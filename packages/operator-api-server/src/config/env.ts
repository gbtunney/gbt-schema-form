// packages/operator-api/src/config/env.ts
// Centralized environment variable loading and configuration. This module
// loads variables from a .env file if present and exposes a typed
// configuration object. Values are optional to support development where
// certain integrations are mocked.

import dotenv from 'dotenv'
import path from 'node:path'

export type Env = {
    /** Add other environment variables here if needed */
    openAiApiKey?: string
    port?: number
    cwd: string
}

let _envCache: Env | undefined

/**
 * Loads environment variables from .env file and returns configuration. Uses lazy initialization to avoid side effects
 * during module bundling.
 */
function loadEnv(): Env {
    if (_envCache) {
        return _envCache
    }

    /* Load variables from .env. Missing .env files are silently ignored. */
    dotenv.config({ path: path.resolve(`${process.cwd()}/.env`) })

    if (!process.env['OPENAI_API_KEY']) {
        console.warn(
            'OPENAI_API_KEY is required but not set in environment variables',
        )
    }

    _envCache = {
        cwd: process.cwd(),

        /**
         * API key for the OpenAI client. Required when real proposals are implemented. Leave empty for the mock
         * service.
         */
        openAiApiKey: process.env['OPENAI_API_KEY'],
        /**
         * Port number the server will listen on. Falls back to 3001 when not provided. Use strings here because
         * environment variables are strings.
         */
        port: process.env['PORT'] ? parseInt(process.env['PORT']) : 3001,
    }

    return _envCache
}

/** Get the current environment configuration. Lazy-loaded on first access to avoid side effects during bundling. */
export const getEnv = (): Env => loadEnv()

/** Legacy export for backward compatibility */
export const env = new Proxy({} as Env, {
    get(_target, prop): Env[keyof Env] | undefined {
        if (typeof prop !== 'string') {
            return undefined
        }

        return loadEnv()[prop as keyof Env]
    },
})
