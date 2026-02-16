// packages/operator-api/src/services/proposal-service.ts
// Provides a simple mock implementation of the proposal service. It
// generates a fixed FieldProposal when the evidence text contains the word
// "model". A real implementation would call OpenAI or another AI
// provider to generate field proposals based on the evidence.

import type { FieldProposal } from '@operator/core'
import type { ProposalRequest } from '@operator/store'

export type ProposalService = (request: ProposalRequest) => Promise<Array<FieldProposal>>

export function createProposalService(): ProposalService {
    return (request: ProposalRequest) => {
        const evidenceText = request.evidenceItem?.text ?? ''
        const proposals: Array<FieldProposal> = []
        if (/model/i.test(evidenceText)) {
            const proposal: FieldProposal = {
                confidence: 'High',
                evidenceItemId: request.evidenceItem.id,
                excerpt: 'Detected model from evidence text',
                id: String(Date.now()),
                path: '/model',
                value: 'Eheim 2211',
            }
            proposals.push(proposal)
        }
        return Promise.resolve(proposals)
    }
}
