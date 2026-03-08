import { describe, expect, test } from 'vitest'
import { htmlToText } from './html-to-text.js'

// ─── htmlToText unit tests ────────────────────────────────────────────────────
// Test the converter directly — no fetch mocking needed here.

describe('htmlToText', () => {
    test('strips script and style tags and their content', () => {
        const result = htmlToText('<script>alert("xss")</script><p>Clean</p>')
        expect(result).toBe('Clean')
        expect(result).not.toContain('alert')
    })

    test('strips nav and footer noise', () => {
        const result = htmlToText(
            '<nav>Home About</nav><main><p>Content</p></main><footer>© 2025</footer>',
        )
        expect(result).toContain('Content')
        expect(result).not.toContain('Home About')
        expect(result).not.toContain('© 2025')
    })

    test('converts headings to markdown-style prefixes', () => {
        const result = htmlToText('<h1>Title</h1><h2>Section</h2><h3>Sub</h3>')
        expect(result).toContain('# Title')
        expect(result).toContain('## Section')
        expect(result).toContain('### Sub')
    })

    test('converts unordered lists to bullets', () => {
        const result = htmlToText('<ul><li>Apple</li><li>Banana</li></ul>')
        expect(result).toContain('• Apple')
        expect(result).toContain('• Banana')
    })

    test('converts ordered lists to numbers', () => {
        const result = htmlToText(
            '<ol><li>First</li><li>Second</li><li>Third</li></ol>',
        )
        expect(result).toContain('1. First')
        expect(result).toContain('2. Second')
        expect(result).toContain('3. Third')
    })

    test('converts table rows to tab-separated lines', () => {
        const result = htmlToText(`
            <table>
                <tr><th>Name</th><th>Serial</th></tr>
                <tr><td>Latitude 7440</td><td>DLAT-001</td></tr>
            </table>
        `)
        expect(result).toContain('Name\tSerial')
        expect(result).toContain('Latitude 7440\tDLAT-001')
    })

    test('converts links to "text (url)" format', () => {
        const result = htmlToText(
            '<a href="https://example.com">Click here</a>',
        )
        expect(result).toContain('Click here (https://example.com)')
    })

    test('strips links with no href', () => {
        const result = htmlToText('<a>No link</a>')
        expect(result).toContain('No link')
        expect(result).not.toContain('(')
    })

    test('decodes HTML entities', () => {
        const result = htmlToText(
            '<p>AT&amp;T &lt;3 &quot;quotes&quot; &#39;apostrophe&#39;</p>',
        )
        expect(result).toContain('AT&T')
        expect(result).toContain('<3')
        expect(result).toContain('"quotes"')
        expect(result).toContain("'apostrophe'")
    })

    test('collapses excessive whitespace', () => {
        const result = htmlToText('<p>too   many    spaces</p>')
        expect(result).not.toMatch(/ {2}/)
    })

    test('collapses 3+ newlines to max 2', () => {
        const result = htmlToText('<p>one</p>\n\n\n\n<p>two</p>')
        expect(result).not.toMatch(/\n{3,}/)
    })

    test('realistic article page', () => {
        const result = htmlToText(`
            <html>
            <head><style>body{font-size:16px}</style></head>
            <body>
                <nav><a href="/">Home</a></nav>
                <main>
                    <h1>Equipment Inventory Guide</h1>
                    <p>The <strong>Dell Latitude 7440</strong> ships with:</p>
                    <ul>
                        <li>Serial number on base label</li>
                        <li>Warranty card in box</li>
                    </ul>
                    <h2>Specifications</h2>
                    <table>
                        <tr><th>Field</th><th>Value</th></tr>
                        <tr><td>Weight</td><td>1.4 kg</td></tr>
                    </table>
                </main>
                <footer>© Dell 2025</footer>
                <script>window.analytics = {}</script>
            </body>
            </html>
        `)
        expect(result).toContain('# Equipment Inventory Guide')
        expect(result).toContain('## Specifications')
        expect(result).toContain('• Serial number on base label')
        expect(result).toContain('Field\tValue')
        expect(result).toContain('Weight\t1.4 kg')
        expect(result).not.toContain('window.analytics')
        expect(result).not.toContain('font-size')
        expect(result).not.toContain('© Dell')
        expect(result).not.toContain('Home') // nav stripped
    })
})
