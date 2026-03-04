// packages/operator-api-server/src/services/proposal-service.ts
//
// Turns a single EvidenceItem (text blob) into an array of FieldProposals
// using OpenAI structured output.
//
// Flow per the notes:
//   evidence item text + current record data + schemaId
//     → GPT-4o-mini (json_object mode)
//       → FieldProposal[]
//
// Rules enforced here (from DIRECTIONS.md):
//   - AI suggests, never commits
//   - Only suggest fields supported by the evidence — no invention
//   - Return empty array rather than guess

import type { FieldProposal } from '@operator/core'
import { fieldProposalSchema } from '@operator/core'
import type { ProposalRequest } from '@operator/store'
import OpenAI from 'openai'
import { z } from 'zod'

import { env } from '../config/env.js'

const proposalArraySchema = z.array(fieldProposalSchema)

// -------------------------------------------------------
// Prompt helpers
// -------------------------------------------------------

export function buildSystemPrompt(): string {
    return `
You are a data entry assistant helping fill in a structured record.

You will receive:
1. An evidence text blob (raw unstructured input — OCR, notes, audio transcription, etc.)
2. The current state of the record's data (JSON)
3. A schemaId identifying what kind of record this is

Your job is to suggest field values that are **supported by the evidence text**.

Rules:
- Only suggest fields where the evidence clearly supports a value.
- Do not invent data that isn't in the evidence.
- Prefer specific, verbatim excerpts over paraphrased excerpts.
- If the evidence doesn't support any fields, return an empty array.
- Confidence must be "High", "Medium", or "Low":
    High   = explicitly stated in evidence
    Medium = strongly implied
    Low    = loosely inferred

You MUST respond with valid JSON only — no explanation, no markdown, no code fences.
The response must be a JSON object with a single key "proposals" containing an array.

Each proposal must match this shape exactly:
{
  "id": "<unique string, e.g. uuid or short hash>",
  "path": "<JSON pointer e.g. /model or /specs/flow_rate>",
  "value": <the suggested value — string, number, boolean, or null>,
  "confidence": "High" | "Medium" | "Low",
  "evidenceItemId": "<the evidence item id provided>",
  "excerpt": "<short supporting quote from the evidence text>"
}

Example output:
{
  "proposals": [
    {
      "id": "p1",
      "path": "/model",
      "value": "Eheim 2211",
      "confidence": "High",
      "evidenceItemId": "ev-123",
      "excerpt": "Eheim 2211 canister filter"
    }
  ]
}`
}

/**
 * Flatten a JSON Schema object into a list of field descriptors for the prompt. Gives the LLM concrete path + type +
 * enum info so it doesn't hallucinate paths.
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
        if (enumVals)
            description += ` — one of: ${enumVals.map((v) => JSON.stringify(v)).join(', ')}`

        lines.push(description)

        // Recurse into nested objects
        if (type === 'object' || fieldDef['properties']) {
            lines.push(...describeSchema(def, pointer))
        }
    }

    return lines
}

export function buildUserPrompt(request: ProposalRequest): string {
    const schemaSection = request.jsonSchema
        ? `
Valid field paths for schema "${request.schemaId}":
${describeSchema(request.jsonSchema).join('\n') || '  (no properties found)'}

Only suggest proposals using paths from the list above.`
        : `
Schema ID: ${request.schemaId} (no schema provided — infer paths from context)`

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
    const client = new OpenAI({ apiKey: env.openAiApiKey })

    return async (request: ProposalRequest): Promise<Array<FieldProposal>> => {
        const completion = await client.chat.completions.create({
            messages: [
                { content: buildSystemPrompt(), role: 'system' },
                { content: buildUserPrompt(request), role: 'user' },
            ],
            // gpt-4o-mini is fast and cheap — good default for proposal generation.
            // Swap for gpt-4o for higher accuracy on complex schemas.
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            temperature: 0.2, // low temp = more consistent structured output
        })

        const raw = completion.choices[0]?.message?.content
        if (!raw) return []

        const parsed: unknown = JSON.parse(raw)

        // GPT with json_object mode wraps arrays in an object.
        // We told it to use { "proposals": [...] } but handle bare array too.
        const arr = Array.isArray(parsed)
            ? parsed
            : ((parsed as Record<string, unknown>)['proposals'] ?? [])

        // Validate each proposal against core schema — silently drop invalid ones
        // rather than throwing, since partial results are better than none.
        const validated: Array<FieldProposal> = []
        for (const item of arr as Array<unknown>) {
            const result = fieldProposalSchema.safeParse(item)
            if (result.success) {
                validated.push(result.data)
            } else {
                console.warn(
                    'Dropping invalid proposal from LLM:',
                    result.error.issues,
                )
            }
        }

        return validated
    }
}
