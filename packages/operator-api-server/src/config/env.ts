// packages/operator-api/src/config/env.ts
// Centralized environment variable loading and configuration. This module
// loads variables from a .env file if present and exposes a typed
// configuration object. Values are optional to support development where
// certain integrations are mocked.

import { createEnv } from '@t3-oss/env-core'
import dotenv from 'dotenv'
import { z } from 'zod'
import path from 'node:path'

/** Generic schema type from t3-oss bc i couldnt find it */
export type EnvSchema = Parameters<typeof createEnv>[0]
let _envInstance: Env | undefined = undefined

const DOTENV_PATH = path.resolve(process.cwd(), '.env')

const schemaEnv = {
    client: {},
    clientPrefix: 'CLIENT_',
    runtimeEnv: process.env,
    server: {
        API_BASE_URL: z.url().optional(),
        /** API key for OpenAI client. Required when real proposals are implemented. */
        OPENAI_API_KEY: z.string().optional(),
        /** Port number the server will listen on. Defaults to 3001. */
        PORT: z.string().default('3001').pipe(z.coerce.number()),
    },
} as const

// 2. Create the instance
dotenv.config({ path: DOTENV_PATH })
export const env = createEnv(schemaEnv)

// 3. Extract the type from the instance itself
export type Env = typeof env

export const getEnv = (): Env => {
    if (!_envInstance) {
        dotenv.config({ path: DOTENV_PATH })
        // Since createEnv was already called above, we just return the instance
        // or re-initialize if you need lazy loading:
        _envInstance = env
    }
    return _envInstance
}
