// packages/operator-api/src/config/env.ts
// Centralized environment variable loading and configuration. This module
// loads variables from a .env file if present and exposes a typed
// configuration object. Values are optional to support development where
// certain integrations are mocked.

import dotenv from 'dotenv'

// Load variables from .env at module load time. Missing .env files are
// silently ignored.
dotenv.config()

export const env = {
    /**
     * API key for the OpenAI client. Required when real proposals are
     * implemented. Leave empty for the mock service.
     */
    openaiApiKey: process.env.OPENAI_API_KEY ?? '',

    /**
     * Port number the server will listen on. Falls back to 3001 when not
     * provided. Use strings here because environment variables are strings.
     */
    port: process.env.PORT ?? '3001',
}
