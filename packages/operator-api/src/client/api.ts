// src/client/api.ts
import type { ClientContext } from './runtime.js'
import { bind, createClient } from './runtime.js'

function buildApi(ctx: ClientContext) {
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

export type Api = ReturnType<typeof buildApi>

export function createApi(ctx: ClientContext): Api {
    return buildApi(ctx)
}
