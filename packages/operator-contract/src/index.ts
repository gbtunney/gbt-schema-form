import { fieldProposalSchema, schemaIdSchema } from '@operator/core'
import { initContract } from '@ts-rest/core'
import { z } from 'zod'

const c = initContract()

export const proposalsFromTextRequestSchema = z.object({
    recordData: z.unknown().optional(),
    schemaId: schemaIdSchema,
    text: z.string().min(1),
})

export const operatorContract = c.router({
    getPokemon: {
        method: 'GET',
        path: '/pokemon/:id',
        responses: {
            200: z.object({
                name: z.string(),
            }),
        },
    },
    proposals: {
        fromText: {
            body: proposalsFromTextRequestSchema,
            method: 'POST',
            path: '/proposals/from-text',
            responses: {
                200: z.object({ proposals: z.array(fieldProposalSchema) }),
                400: z.object({ error: z.string() }),
            },
            summary: 'Generate field proposals from an arbitrary text blob.',
        },
    },
})

export type OperatorContract = typeof operatorContract
