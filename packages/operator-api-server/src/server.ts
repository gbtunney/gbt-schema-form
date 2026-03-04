// packages/operator-api-server/src/server.ts
// Constructs an Express server exposing the proposals and derivation endpoints.
// Uses express-zod-api with a simple DI pattern for service implementations.

import type { Express } from 'express'
import { createConfig, createServer, type ServerConfig } from 'express-zod-api'

import { env, type Env } from './config/env.js'
import { routes } from './routes.js'
import { createOcrService } from './services/ocr-service.js'

export type Services = {
    /**
     * Perform OCR on an image attachment. Accepts either an image URL or base64-encoded image data and returns
     * extracted text.
     */
    ocr: ReturnType<typeof createOcrService>
}

export const getConfig = (environment: Env = env): ServerConfig =>
    createConfig({
        cors: true,
        http: { listen: environment.port ?? 3000 },
        logger: { color: true, ctx: {}, depth: 2, level: 'info' },
    })

export const buildServer = async (): Promise<Express> => {
    const _server = await createServer(getConfig(), routes)
    return _server.app
}
