import { Client, type Implementation } from '@operator/api'

const impl: Implementation<{ baseUrl: string }> = async (
    method,
    path,
    params,
    ctx,
) => {
    const baseUrl = ctx?.baseUrl ?? 'http://localhost:3001'
    const url = new URL(path, baseUrl)

    // put GET params into query string
    if (method === 'get' || method === 'head') {
        for (const [k, v] of Object.entries(params ?? {})) {
            if (v === undefined) continue
            url.searchParams.set(k, String(v))
        }
    }

    const res = await fetch(url, {
        body:
            method !== 'get' && method !== 'head'
                ? JSON.stringify(params ?? {})
                : undefined,
        headers:
            method !== 'get' && method !== 'head'
                ? { 'content-type': 'application/json' }
                : undefined,
        method: method.toUpperCase(),
    })

    const text = await res.text()
    return text ? JSON.parse(text) : undefined
}

async function test(): Promise<void> {
    console.log('Hello world')

    const client = new Client('http://localhost:3001')

    const hello = await client.provide(
        'post /hello',
        { name: 'y', nickname: 'giii2x' },
        { baseUrl: 'http://localhost:3001' },
    )

    console.log('AFTER@!!!!!!!!! world', hello)
}

test().catch(console.error)
