// packages/operator-api-server/src/routes/proposals.ts
//
// POST /v1/proposals/from-evidence
//
// Takes a ProposalRequest (one evidence item + current record data + schemaId)
// and returns FieldProposal[].
//
// This is the main AI loop entry point. Routes in the UI call this via
// ProposalClient from @operator/api-client, which satisfies the ProposalClient
// port type from @operator/store.

import {
    fieldProposalSchema,
    jsonBoundarySchema,
    jsonValueSchema,
    recordDocSchema,
} from '@operator/core'
import { proposalRequestSchema } from '@operator/store'
import { defaultEndpointsFactory as endpointsFactory } from 'express-zod-api'
import { z } from 'zod'

import { createProposalService } from '../services/proposal-service.js'

let proposalService: ReturnType<typeof createProposalService> | null = null

export const proposalsFromEvidenceEndpoint = endpointsFactory.build({
    description:
        'Generate field proposals from a single evidence item. ' +
        'Provide the evidence item, current record data, and schemaId. ' +
        'Returns an array of FieldProposals — AI suggestions for specific fields.',
    handler: async ({ input, logger }) => {
        logger.info(
            `Generating proposals for evidence item: ${input.evidenceItem.id} (schema: ${input.schemaId})`,
        )

        const recordData = recordDocSchema.shape.data.parse(input.recordData)

        /** Lazy initialization — only instantiate when handler runs */
        if (!proposalService) {
            proposalService = createProposalService()
        }

        const proposals = await proposalService({ ...input, recordData })

        // optional: assert values are valid JSON
        for (const p of proposals) {
            jsonValueSchema.parse(p.value)
        }

        const count = proposals.length
        logger.info(`Got ${String(count)} proposals`)

        logger.info(`Generated ${String(proposals.length)} proposals`)
        return { proposals }
    },

    // Avoid JsonValue recursion in generated client types:
    input: proposalRequestSchema.extend({
        recordData: z.unknown(),
    }),

    method: 'post',
    output: z.object({
        proposals: z.array(
            fieldProposalSchema.extend({
                // prevent recursive JSON type in generated client
                value: jsonBoundarySchema,
            }),
        ),
    }),
})
