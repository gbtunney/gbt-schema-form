// packages/operator-api-server/src/services/proposal-service.ts
//
// Turns a single EvidenceItem into an array of FieldProposals using
// the OpenAI Responses API with Structured Outputs.
//
// Uses zodResponseFormat() so fieldProposalSchema is the single source
// of truth — no manually written JSON Schema, no drift.
//
// Note: value uses a flat primitive union instead of z.json() because
// OpenAI Structured Outputs does not support recursive schemas.
// z.string() | z.number() | z.boolean() | z.null() covers all real
// form field values. Nested object values are not expected from proposals.

import { fieldProposalSchema } from '@operator/core'
import type { FieldProposal } from '@operator/core'
import type { ProposalRequest } from '@operator/store'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

import { createOpenAiClient } from './open-ai.js'

// -------------------------------------------------------
// Response schema — Zod, used directly with zodResponseFormat()
//
// Kept separate from core FieldProposalSchema because:
//   - value must be a flat primitive union (no recursive z.json())
//   - excerpt is required here (optional in core) for better LLM output
// -------------------------------------------------------
//const testy = fieldProposalSchema

const proposalResponseSchema = z.object({
    proposals: z
        .array(fieldProposalSchema)
        .describe(
            'List of proposed field values. Empty array if evidence supports nothing.',
        ),
})

// ✅ Add an explicit inferred type because some openai SDK versions
// don’t propagate the zodResponseFormat type into response.output_parsed.
type ProposalResponse = z.infer<typeof proposalResponseSchema>

// -------------------------------------------------------
// Prompt helpers (exported for unit testing)
// -------------------------------------------------------

export function buildSystemPrompt(): string {
    return `You are a data entry assistant helping fill in a structured record from unstructured evidence.

You will receive:
1. The valid field paths for this record type (with types and allowed values)
2. An evidence text blob (raw input — OCR, notes, transcription, etc.)
3. The current state of the record's data

Your job is to suggest field values that are supported by the evidence text.

Rules:
- Only suggest fields where the evidence clearly supports a value.
- Do not invent data that is not in the evidence.
- Only use paths from the provided field list — do not make up paths.
- excerpt must be a short verbatim quote from the evidence text.
- If the evidence does not support any fields, return an empty proposals array.
- Return valid JSON only.
- Wrap all proposals in a "proposals" array.
- Confidence levels:
    High   = value is explicitly stated in the evidence
    Medium = value is strongly implied
    Low    = value is loosely inferred`
}

/**
 * Flatten a JSON Schema into readable field descriptors for the prompt. Gives the LLM concrete path + type + enum info
 * so it uses valid paths only.
 */
export function describeSchema(schema: unknown, prefix = ''): Array<string> {
    if (!schema || typeof schema !== 'object') return []

    const obj = schema as Record<string, unknown>
    const properties = obj['properties'] as Record<string, unknown> | undefined
    if (!properties) return []

    const lines: Array<string> = []

    for (const [key, def] of Object.entries(properties)) {
        const fieldDef = def as Record<string, unknown>
        const pointer = `${prefix}/${key}`
        const type = fieldDef['type'] as string | undefined
        const title = fieldDef['title'] as string | undefined
        const enumVals = fieldDef['enum'] as Array<unknown> | undefined
        const format = fieldDef['format'] as string | undefined

        let description = `  ${pointer}`
        if (title) description += ` (${title})`
        if (type) description += ` — ${type}`
        if (format) description += ` [${format}]`
        if (enumVals) {
            description += ` — one of: ${enumVals.map((v) => JSON.stringify(v)).join(', ')}`
        }

        lines.push(description)

        if (type === 'object' || fieldDef['properties']) {
            lines.push(...describeSchema(def, pointer))
        }
    }

    return lines
}

export function buildUserPrompt(request: ProposalRequest): string {
    const schemaSection = request.jsonSchema
        ? `Valid field paths for schema "${request.schemaId}":
${describeSchema(request.jsonSchema).join('\n') || '  (no properties found)'}

Only suggest proposals using paths from the list above.`
        : `Schema ID: ${request.schemaId} (no schema provided — infer paths from context)`

    return `${schemaSection}

Evidence item ID: ${request.evidenceItem.id}
Evidence title: ${request.evidenceItem.title}
Evidence text:
---
${request.evidenceItem.text}
---

Current record data:
${JSON.stringify(request.recordData ?? {}, null, 2)}

Suggest field proposals based only on the evidence text above.`
}

// -------------------------------------------------------
// Service factory
// -------------------------------------------------------

export type ProposalService = (
    request: ProposalRequest,
) => Promise<Array<FieldProposal>>

export function createProposalService(): ProposalService {
    const client = createOpenAiClient()

    return async (request: ProposalRequest): Promise<Array<FieldProposal>> => {
        const response = await client.responses.parse({
            input: [
                { content: buildSystemPrompt(), role: 'system' },
                { content: buildUserPrompt(request), role: 'user' },
            ],
            model: 'gpt-4o-mini',
            response_format: zodResponseFormat(
                proposalResponseSchema,
                'field_proposals',
            ),
        })

        const parsed = response.output_parsed as
            | ProposalResponse
            | null
            | undefined
        if (!parsed) return []

        return parsed.proposals
    }
}
