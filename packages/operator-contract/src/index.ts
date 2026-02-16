import { fieldProposalSchema, schemaIdSchema } from '@operator/core'
import { initContract } from '@ts-rest/core'
import { z } from 'zod'

const c = initContract()

export const proposalsFromTextRequestSchema = z.object({
    schemaId: schemaIdSchema,
    recordData: z.unknown().optional(),
    text: z.string().min(1),
})

export const operatorContract = c.router({
    proposals: {
        fromText: {
            method: 'POST',
            path: '/proposals/from-text',
            body: proposalsFromTextRequestSchema,
            responses: {
                200: z.object({ proposals: z.array(fieldProposalSchema) }),
                400: z.object({ error: z.string() }),
            },
            summary: 'Generate field proposals from an arbitrary text blob.',
        },
    },
})

export type OperatorContract = typeof operatorContract
