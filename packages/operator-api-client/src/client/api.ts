// src/client/api.ts
// Typed API object — wraps the generated client with named methods.
// Regenerate src/generated/api.ts via: pnpm --filter @operator/api-server gen:client

import type { ClientContext } from './runtime.js'
import { bind, createClient } from './runtime.js'

type BoundCall = ReturnType<ReturnType<typeof bind>>

export type Api = {
    derive: {
        ocr: {
            get: BoundCall
            head: BoundCall
        }
        scrape: {
            post: BoundCall
        }
        transcribe: {
            post: BoundCall
        }
    }
    hello: {
        get: BoundCall
        head: BoundCall
        post: BoundCall
    }
    v1: {
        proposals: {
            fromEvidence: {
                post: BoundCall
            }
        }
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
            scrape: {
                post: call('post /derive/scrape'),
            },
            transcribe: {
                post: call('post /derive/transcribe'),
            },
        },
        hello: {
            get: call('get /hello'),
            head: call('head /hello'),
            post: call('post /hello'),
        },
        v1: {
            proposals: {
                fromEvidence: {
                    post: call('post /v1/proposals/from-evidence'),
                },
            },
        },
    }
}

export function createApi(ctx: ClientContext): Api {
    return buildApi(ctx)
}
