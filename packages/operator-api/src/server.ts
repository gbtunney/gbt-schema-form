// packages/operator-api/src/server.ts
// Constructs an Express server exposing the proposals and derivation endpoints.
// The server uses Zod for request/response validation and a simple DI pattern
// to provide service implementations. The default services are mock/fake
// implementations suitable for local development and testing.

import { fieldProposalSchema } from '@operator/core'
import { operatorContract } from '@operator/contract'
import { proposalRequestSchema } from '@operator/store'
import { createExpressEndpoints } from '@ts-rest/express'
import express from 'express'
import { z } from 'zod'

import { createOcrService } from './services/ocr-service.js'
import { createProposalService } from './services/proposal-service.js'
import { createScrapeService } from './services/scrape-service.js'
import { createWhisperService } from './services/whisper-service.js'

// Service interface definitions for dependency injection. Each property
// corresponds to a function implementing part of the API surface.
export type Services = {
    /**
     * Generate field proposals from a proposal request. Should return
     * an array of FieldProposal objects.
     */
    proposals: ReturnType<typeof createProposalService>

    /**
     * Perform OCR on an image attachment. Accepts either an image URL or
     * base64‑encoded image data and returns extracted text.
     */
    ocr: ReturnType<typeof createOcrService>

    /**
     * Transcribe an audio attachment. Accepts either an audio URL or
     * base64‑encoded audio data and returns transcribed text.
     */
    whisper: ReturnType<typeof createWhisperService>

    /**
     * Scrape text from a remote URL. Should return the extracted text.
     */
    scrape: ReturnType<typeof createScrapeService>
}

// Assemble the default set of services. This factory can be replaced
/**
 * during testing or when integrating real implementations.
 */
export function buildServices(): Services {
    return {
        ocr: createOcrService(),
        proposals: createProposalService(),
        scrape: createScrapeService(),
        whisper: createWhisperService(),
    }
}

/**
 * Create and configure an Express application. Injects the provided
 * services and binds routes to handlers. If no services are passed
 * explicitly, the default mock services are used.
 */
export function buildServer(services: Services = buildServices()): express.Express {
    const app = express()
    app.use(express.json())

    // ts-rest endpoints (mounted alongside the existing routes)
    createExpressEndpoints(operatorContract, {
        proposals: {
            fromText: async ({ body }) => {
                try {
                    // Minimal mock implementation: if the text contains "model",
                    // return a single proposal targeting /model.
                    if (/model/i.test(body.text)) {
                        return {
                            status: 200,
                            body: {
                                proposals: [
                                    {
                                        confidence: 'High',
                                        evidenceItemId: 'text-blob',
                                        excerpt: 'Detected model from text blob',
                                        id: String(Date.now()),
                                        path: '/model',
                                        value: 'Eheim 2211',
                                    },
                                ],
                            },
                        }
                    }

                    return { status: 200, body: { proposals: [] } }
                } catch (err: any) {
                    return { status: 400, body: { error: (err && err.message) || 'Invalid request' } }
                }
            },
        },
    }, app)

    // POST /proposals — core loop for generating field proposals
    app.post('/proposals', async (req, res) => {
        try {
            // Validate request body against ProposalRequest schema
            const input = proposalRequestSchema.parse(req.body)
            const result = await services.proposals(input)
            // Validate response using FieldProposal schema array
            const output = z.array(fieldProposalSchema).parse(result)
            res.json(output)
        } catch (err: any) {
            res.status(400).json({ error: (err && err.message) || 'Invalid request' })
        }
    })

    /**
     * Generic helper to validate derivation inputs and return text
     */
    function deriveEndpoint(
        inputSchema: z.ZodType,
        handler: (args: any) => Promise<string>,
    ): (req: express.Request, res: express.Response) => Promise<void> {
        return async (req: express.Request, res: express.Response): Promise<void> => {
            try {
                const input = inputSchema.parse(req.body)
                const text = await handler(input)
                res.json({ text })
            } catch (err: any) {
                res.status(400).json({ error: (err && err.message) || 'Invalid request' })
            }
        }
    }

    // POST /derive/ocr — convert image to text
    const ocrInputSchema = z
        .object({
            base64: z.string().optional(),
            imageUrl: z.url().optional(),
        })
        .refine((data) => data.imageUrl || data.base64, {
            message: 'Provide either imageUrl or base64',
        })
    app.post('/derive/ocr', deriveEndpoint(ocrInputSchema, services.ocr))

    // POST /derive/whisper — transcribe audio to text
    const whisperInputSchema = z
        .object({
            audioUrl: z.url().optional(),
            base64: z.string().optional(),
        })
        .refine((data) => data.audioUrl || data.base64, {
            message: 'Provide either audioUrl or base64',
        })
    app.post('/derive/whisper', deriveEndpoint(whisperInputSchema, services.whisper))

    // POST /derive/scrape — scrape text from a URL
    const scrapeInputSchema = z.object({ url: z.url() })
    app.post('/derive/scrape', deriveEndpoint(scrapeInputSchema, services.scrape))

    return app
}


/*
import dotenv from 'dotenv'
import { createConfig, createServer } from 'express-zod-api'
import { router } from './router.js'

dotenv.config()

const port = Number(process.env.PORT || 3000)

async function start() {
    const config = createConfig({
        cors: true,
        http: { listen: port },
        logger: { color: true, ctx: {}, depth: 2, level: 'info' },
    })
    await createServer(config, router)
}

start().catch((err) => {
    console.error('Failed to start API server:', err)
    process.exit(1)
})*/