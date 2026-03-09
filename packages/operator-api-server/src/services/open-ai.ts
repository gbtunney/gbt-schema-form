// packages/operator-api-server/src/services/open-ai.ts
import OpenAI from 'openai'
import { getEnv } from '../config/env.js'

export function createOpenAiClient(): OpenAI {
    const environment = getEnv()

    if (!environment.OPENAI_API_KEY) {
        throw new Error(
            'OPENAI_API_KEY is required to create the OpenAI client.',
        )
    }

    return new OpenAI({
        apiKey: environment.OPENAI_API_KEY,
    })
}
