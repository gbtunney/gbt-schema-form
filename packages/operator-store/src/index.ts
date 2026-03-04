/**
 * Persistence contracts (ports) for the operator system.
 *
 * Domain models and schemas live in @operator/core. This package defines only the interfaces (ports) that
 * implementations must satisfy.
 *
 * @packageDocumentation
 */

export type {
    JsonSchema,
    OperatorStore,
    ProposalClient,
    ProposalRequest,
    SchemaResolver,
} from './ports.js'
export { proposalRequestSchema } from './ports.js'

/** Re-export FieldProposal from core for convenience */
export { type FieldProposal, fieldProposalSchema } from '@operator/core'
