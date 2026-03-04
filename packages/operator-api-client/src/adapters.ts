// packages/operator-api-client/src/adapters.ts
//
// Implements @operator/store port types over HTTP using the typed client.
// The UI injects these — it never sees fetch() or HTTP status codes.
//
// Flow:
//   UI calls proposalClient(request)
//     → POST /v1/proposals/from-evidence
//       → FieldProposal[]

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
        const result = await api.derive.ocr.get(request)

        if (result.status === 'error') {
            throw new Error(
                `Proposal generation failed: ${result.error.message as unknown as string}`,
            )
        }

        return result.data.proposals
    }
}
