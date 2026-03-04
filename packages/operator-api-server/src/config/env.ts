// packages/operator-api/src/config/env.ts
// Centralized environment variable loading and configuration. This module
// loads variables from a .env file if present and exposes a typed
// configuration object. Values are optional to support development where
// certain integrations are mocked.

import dotenv from 'dotenv'
import path from 'node:path'
// Load variables from .env at module load time. Missing .env files are
// silently ignored.

export type Env = {
    /** Add other environment variables here if needed */
    openAiApiKey?: string
    port?: number
    cwd: string
}
declare namespace NodeJS {
    export type ProcessEnv = Env
}

dotenv.config({ path: path.resolve(`${process.cwd()}/.env`) })

if (!process.env['OPENAI_API_KEY']) {
    //    throw new Error(
    console.warn(
        'OPENAI_API_KEY is required but not set in environment variables',
    )
}

export const env = {
    cwd: process.cwd(),

    /** API key for the OpenAI client. Required when real proposals are implemented. Leave empty for the mock service. */
    openAiApiKey: process.env['OPENAI_API_KEY'],
    /**
     * Port number the server will listen on. Falls back to 3001 when not provided. Use strings here because environment
     * variables are strings.
     */
    port: process.env['PORT'] ? parseInt(process.env['PORT']) : 3001,
}
