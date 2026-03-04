import { Client } from './../generated/api.js'
import type { Implementation } from './../generated/api.js'

export type ClientContext = {
    baseUrl: string
    headers?: Record<string, string>
}

// IMPORTANT: make the client context optional because Implementation passes ctx?: T
export type EzClient = Client<ClientContext | undefined>

const DEFAULT_BASE_URL = 'http://localhost:3001'

export const defaultImpl: Implementation<ClientContext | undefined> = async (
    method,
    path,
    params,
    ctx,
): Promise<unknown> => {
    const c: ClientContext = ctx ?? { baseUrl: DEFAULT_BASE_URL }
    const url = new URL(path, c.baseUrl)

    const isGetLike = method === 'get' || method === 'head'

    if (isGetLike) {
        for (const [k, v] of Object.entries(params ?? {})) {
            if (v === undefined) continue
            if (Array.isArray(v))
                v.forEach((x) => {
                    url.searchParams.append(k, String(x))
                })
            else url.searchParams.set(k, String(v))
        }
    }

    const res = await fetch(url, {
        body: isGetLike ? undefined : JSON.stringify(params ?? {}),
        headers: isGetLike
            ? c.headers
            : { 'content-type': 'application/json', ...(c.headers ?? {}) },
        method: method.toUpperCase(),
    })

    const text = await res.text()
    const parsed: unknown = text ? JSON.parse(text) : undefined
    return parsed
}

export function createRawClient(): EzClient {
    return new Client<ClientContext | undefined>(defaultImpl)
}

export function createClient(ctx: ClientContext): {
    client: EzClient
    ctx: ClientContext
} {
    const client = createRawClient()
    return { client, ctx }
}

export const bind =
    (client: EzClient, ctx: ClientContext) =>
    <Key extends Parameters<EzClient['provide']>[0]>(
        key: Key,
    ): ((
        input: Parameters<EzClient['provide']>[1],
    ) => ReturnType<EzClient['provide']>) =>
    (input) =>
        client.provide(key, input as never, ctx as never)
