import { decode } from 'html-entities'
import { type HTMLElement, parse } from 'node-html-parser'

// ─── HTML → text conversion ───────────────────────────────────────────────────

function stripNoise(root: HTMLElement): HTMLElement {
    root.querySelectorAll('script,style,noscript,nav,footer').forEach((n) =>
        n.remove(),
    )
    return root
}

function convertBreaks(root: HTMLElement): HTMLElement {
    root.querySelectorAll('br').forEach((n) => n.replaceWith('\n'))
    return root
}

function convertHeadings(root: HTMLElement): HTMLElement {
    root.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((n) => {
        const level = Number(n.tagName[1])
        const prefix = '#'.repeat(level)
        const text = n.text.trim()
        n.replaceWith(`\n${prefix} ${text}\n\n`)
    })
    return root
}

function convertLinks(root: HTMLElement): HTMLElement {
    root.querySelectorAll('a').forEach((n) => {
        const text = n.text.trim()
        const href = n.getAttribute('href')
        n.replaceWith(href && text ? `${text} (${href})` : text)
    })
    return root
}

function convertLists(root: HTMLElement): HTMLElement {
    root.querySelectorAll('ul').forEach((ul) => {
        ul.querySelectorAll('li').forEach((li) => {
            li.replaceWith(`• ${li.text.trim()}\n`)
        })
    })
    root.querySelectorAll('ol').forEach((ol) => {
        ol.querySelectorAll('li').forEach((li, i) => {
            li.replaceWith(`${(i + 1).toString()}. ${li.text.trim()}\n`)
        })
    })
    return root
}

function convertTables(root: HTMLElement): HTMLElement {
    root.querySelectorAll('tr').forEach((row) => {
        const cells = row.querySelectorAll('td,th')
        if (!cells.length) return
        row.replaceWith(cells.map((c) => c.text.trim()).join('\t') + '\n')
    })
    return root
}

function convertBlocks(root: HTMLElement): HTMLElement {
    root.querySelectorAll('p,div,section,article,header,main').forEach((n) => {
        // node-html-parser appendChild() needs a Node, not a string.
        // replaceWith() accepts a string, so we can safely add a newline delimiter.
        n.replaceWith(`${n.text}\n`)
    })
    return root
}

function normalizeWhitespace(text: string): string {
    return text
        .replace(/\r/g, '')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\n[ \t]+/g, '\n')
        .trim()
}

export function htmlToText(html: string): string {
    const root = parse(html)
    stripNoise(root)
    convertBreaks(root)
    convertHeadings(root)
    convertLinks(root)
    convertLists(root)
    convertTables(root)
    convertBlocks(root)
    return normalizeWhitespace(decode(root.text))
}
