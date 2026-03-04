// packages/operator-api-server/src/services/open-ai.ts
import OpenAI from 'openai'

export function createOpenAiClient(): OpenAI {
    return new OpenAI({
        apiKey: process.env['OPENAI_API_KEY'],
    })
}
