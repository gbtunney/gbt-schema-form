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

import { fieldProposalSchema } from '@operator/core'
import { proposalRequestSchema } from '@operator/store'
import { defaultEndpointsFactory as endpointsFactory } from 'express-zod-api'
import { z } from 'zod'

import { createProposalService } from '../services/proposal-service.js'

// Instantiate once — the service holds the OpenAI client
const proposalService = createProposalService()

export const proposalsFromEvidenceEndpoint = endpointsFactory.build({
    description:
        'Generate field proposals from a single evidence item. ' +
        'Provide the evidence item, current record data, and schemaId. ' +
        'Returns an array of FieldProposals — AI suggestions for specific fields.',
    handler: async ({ input, logger }) => {
        logger.info(
            `Generating proposals for evidence item: ${input.evidenceItem.id} (schema: ${input.schemaId})`,
        )

        const proposals = await proposalService(input)

        const count = proposals.length
        logger.info(`Got ${String(count)} proposals`)

        logger.info(`Generated ${proposals.length.toString()} proposals`)
        return { proposals }
    },
    input: proposalRequestSchema,
    method: 'post',
    output: z.object({
        proposals: z.array(fieldProposalSchema),
    }),
})
