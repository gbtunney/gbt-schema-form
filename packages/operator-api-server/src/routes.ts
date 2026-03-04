// packages/operator-api-server/src/routes.ts
import type { Routing } from 'express-zod-api'

import { deriveOcrEndpoint } from './routes/derive-ocr.js'
import { deriveTranscribeEndpoint } from './routes/derive-transcribe.js'
import { helloWorldEndpoint } from './routes/hello-world.js'
import { proposalsFromEvidenceEndpoint } from './routes/proposals.js'

export const routes: Routing = {
    '/derive/ocr': deriveOcrEndpoint,
    '/derive/transcribe': deriveTranscribeEndpoint,
    '/hello': helloWorldEndpoint,
    '/v1/proposals/from-evidence': proposalsFromEvidenceEndpoint,
}
