// packages/operator-api/src/routes/proposals.ts
// Defines the schema-driven endpoint for generating field proposals. This
// module does not implement any business logic itself; it simply wires
// together the input/output schemas with the injected services. See
// src/server.ts for how this endpoint is bound to an Express route.

import { fieldProposalSchema, proposalRequestSchema } from '@operator/store'
import { z } from 'zod'
import type { Services } from '../server.js'

/**
 * Contract shape for the /proposals endpoint. The handler expects
 * `ctx.services.proposals` to be a function that accepts a ProposalRequest
 * and returns an array of FieldProposal.
 */
export const proposalsEndpoint = {
    handler: async ({ ctx, input }: { input: any; ctx: { services: Services } }) => {
        return await ctx.services.proposals(input)
    },
    input: proposalRequestSchema,
    output: z.array(fieldProposalSchema),
} as const
