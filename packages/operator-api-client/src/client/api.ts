// src/client/api.ts
import type { ClientContext } from './runtime.js'
import { bind, createClient } from './runtime.js'

type BoundCall = ReturnType<ReturnType<typeof bind>>

export type Api = {
    derive: {
        ocr: {
            get: BoundCall
            head: BoundCall
        }
    }
    hello: {
        get: BoundCall
        head: BoundCall
        post: BoundCall
    }
}

function buildApi(ctx: ClientContext): Api {
    const { client } = createClient(ctx)
    const call = bind(client, ctx)

    return {
        derive: {
            ocr: {
                get: call('get /derive/ocr'),
                head: call('head /derive/ocr'),
            },
        },
        hello: {
            get: call('get /hello'),
            head: call('head /hello'),
            post: call('post /hello'),
        },
    }
}

export function createApi(ctx: ClientContext): Api {
    return buildApi(ctx)
}
