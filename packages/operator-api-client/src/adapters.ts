// packages/operator-api-client/src/adapters.ts
//
// Implements @operator/store port types over HTTP using the typed client.
// The UI injects these — it never sees fetch() or HTTP status codes.
//
// Flow:
//   UI calls proposalClient(request)
//     → POST /v1/proposals/from-evidence
//       → FieldProposal[]

// TODO : this needs to be properly fixed
//  If you can’t add the proper endpoint yet, narrow the union:

import type { ProposalClient } from '@operator/store'

import { createApi } from './client/api.js'
import type { ClientContext } from './client/runtime.js'

/**
 * Creates a ProposalClient satisfying the @operator/store port.
 *
 * Usage: const proposalClient = createProposalClient({ baseUrl: 'http://localhost:3001' }) <OperatorEditor
 * proposalClient={proposalClient} ... />
 */
export const createProposalClient = (ctx: ClientContext): ProposalClient => {
    const api = createApi(ctx)

    return async (request) => {
        const result = await api.v1.proposals.fromEvidence.post(request)

        if (result === undefined || result.status === 'error') {
            const errorMessage: string =
                result === undefined
                    ? 'Unknown error (no response)'
                    : (result.error?.message ?? 'Unknown error')
            throw new Error(`Proposal generation failed: ${errorMessage}`)
        }

        const data = result.data as unknown

        if (
            typeof data === 'object' &&
            data !== null &&
            'proposals' in data &&
            Array.isArray((data as { proposals: unknown }).proposals)
        ) {
            return (data as { proposals: Array<unknown> }).proposals as any
        }

        throw new Error('Proposal generation failed: unexpected response shape')
    }
}
