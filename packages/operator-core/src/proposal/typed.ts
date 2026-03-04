// packages/operator-core/src/proposal/typed.ts
//
// Generic typed proposal factory.
//
// The untyped base layer (FieldProposal) uses path: string + value: JsonValue
// because the server doesn't know the consumer's schema at compile time.
//
// This module lets the *consumer* recover full type safety by passing in their
// own Zod object schema. The factory:
//   1. Infers all valid JSON Pointer paths from the schema
//   2. Infers the correct value type at each path
//   3. Returns a TypedProposalClient where path + value are co-typed
//   4. Validates each proposal's value against the schema at runtime
//
// Usage:
//
//   const equipmentSchema = z.object({
//       model: z.string(),
//       category: z.enum(['Laptop', 'Monitor']),
//       specs: z.object({ weight_kg: z.number() }),
//   })
//
//   // Call once — typically in your app's DI setup
//   const proposalClient = createTypedProposalClient(equipmentSchema, baseClient)
//
//   // proposals[0].path is "/model" | "/category" | "/specs/weight_kg"
//   // proposals[0].value type narrows per path
//   const proposals = await proposalClient(request)

import { z } from 'zod'
import type { FieldProposal } from './field-proposal.js'

// -------------------------------------------------------
// Minimal types core needs (keep core decoupled)
// -------------------------------------------------------

export type ProposalRequest = unknown

export type ProposalClient = (
    request: ProposalRequest,
) => Promise<Array<FieldProposal>>

// -------------------------------------------------------
// Zod v4-friendly type aliases
// -------------------------------------------------------

type ZodRawShape = z.ZodRawShape

/**
 * Zod v4: avoid constraining on ZodTypeAny because shapes may contain internal $ZodType types that don't extend the old
 * alias cleanly.
 */
type AnyZodSchema = z.ZodType

/** Extract the inferred TypeScript type from any Zod schema */
type InferZod<Schema> = Schema extends z.ZodType<any> ? z.infer<Schema> : never

// -------------------------------------------------------
// Path inference
//
// Given a Zod object shape, derive a union of all JSON Pointer paths.
//
// z.object({ model: z.string(), specs: z.object({ weight: z.number() }) })
//   → "/model" | "/specs" | "/specs/weight"
//
// Intermediate object paths are included so the LLM can propose a replacement
// of an entire nested object, not just individual leaves.
// -------------------------------------------------------

export type PathsOf<Shape extends ZodRawShape> = {
    [Key in keyof Shape & string]: Shape[Key] extends z.ZodObject<
        // Detect nested objects by checking for ZodObject
        infer NestedShape extends ZodRawShape
    >
        ? `/${Key}` | `/${Key}${PathsOf<NestedShape>}`
        : `/${Key}`
}[keyof Shape & string]

// -------------------------------------------------------
// Value resolution
//
// Given a shape and a pointer path, resolve the TypeScript type of the value
// at that path. Returns `never` if the path doesn't exist in the shape.
// -------------------------------------------------------

type ResolveValueAtPath<
    Shape extends ZodRawShape,
    Path extends string,
> = Path extends `/${infer Key}/${infer Rest}`
    ? Key extends keyof Shape
        ? Shape[Key] extends z.ZodObject<infer NestedShape extends ZodRawShape>
            ? ResolveValueAtPath<NestedShape, `/${Rest}`>
            : never
        : never
    : Path extends `/${infer Key}`
      ? Key extends keyof Shape
          ? InferZod<Shape[Key]>
          : never
      : never

// -------------------------------------------------------
// TypedFieldProposal
//
// Unlike the base FieldProposal (path: string, value: JsonValue),
// TypedFieldProposal<Shape> narrows path and value together as a
// discriminated union — one member per valid path.
// -------------------------------------------------------

export type TypedFieldProposal<Shape extends ZodRawShape> = {
    [PointerPath in PathsOf<Shape>]: Omit<FieldProposal, 'path' | 'value'> & {
        path: PointerPath
        value: ResolveValueAtPath<Shape, PointerPath>
    }
}[PathsOf<Shape>]

// -------------------------------------------------------
// TypedProposalClient
// -------------------------------------------------------

export type TypedProposalClient<Shape extends ZodRawShape, Req> = (
    request: Req,
) => Promise<Array<TypedFieldProposal<Shape>>>

// -------------------------------------------------------
// Runtime: path extractor
//
// Walks a Zod object schema at runtime and collects all valid pointer paths
// with their associated sub-schemas. Used to:
//   - Build the LLM prompt (enumerate valid fields)
//   - Validate/narrow LLM response values per path
// -------------------------------------------------------

type PathEntry = {
    pointer: string
    schema: AnyZodSchema
}

/** Zod v4 unwrap: prefer .unwrap() when available; avoid touching _def directly. */
function unwrapZodSchema(schema: AnyZodSchema): AnyZodSchema {
    // Optional / Nullable / Default all implement .unwrap() in Zod
    // (Default unwrap returns inner schema too)
    // eslint-disable @typescript-eslint/no-explicit-any
    const maybeAny: any = schema
    if (maybeAny && typeof maybeAny.unwrap === 'function') {
        return unwrapZodSchema(maybeAny.unwrap())
    }
    return schema
}

function collectPaths(
    schema: AnyZodSchema,
    prefix: string,
    acc: Array<PathEntry>,
): void {
    const inner = unwrapZodSchema(schema)

    if (inner instanceof z.ZodObject) {
        // ZodObject.shape is the stable API
        const shape = (inner as z.ZodObject<ZodRawShape>).shape
        for (const [key, child] of Object.entries(shape)) {
            const pointer = `${prefix}/${key}`
            acc.push({ pointer, schema: child as AnyZodSchema })
            collectPaths(child as AnyZodSchema, pointer, acc)
        }
    }
}

export function extractSchemaPaths(
    schema: z.ZodObject<ZodRawShape>,
): Array<PathEntry> {
    const acc: Array<PathEntry> = []
    collectPaths(schema as unknown as AnyZodSchema, '', acc)
    return acc
}

// -------------------------------------------------------
// createTypedProposalClient
//
// Factory. Takes the consumer's Zod object schema and a base ProposalClient
// (e.g. from @operator/api-client or a mock), and returns a TypedProposalClient
// that validates + narrows each proposal's value against the schema.
//
// Invalid proposals (wrong value type for their path) are dropped with a warning
// rather than thrown — partial results are better than a hard failure.
// -------------------------------------------------------

export function createTypedProposalClient<Shape extends ZodRawShape, Req>(
    schema: z.ZodObject<Shape>,
    baseClient: (request: Req) => Promise<Array<FieldProposal>>,
): TypedProposalClient<Shape, Req> {
    const pathEntries = extractSchemaPaths(
        schema as unknown as z.ZodObject<ZodRawShape>,
    )
    const schemaByPointer = new Map(
        pathEntries.map((entry) => [entry.pointer, entry.schema]),
    )

    return async (request: Req): Promise<Array<TypedFieldProposal<Shape>>> => {
        const raw = await baseClient(request)
        const typed: Array<TypedFieldProposal<Shape>> = []

        for (const proposal of raw) {
            const fieldSchema = schemaByPointer.get(proposal.path)
            if (!fieldSchema) {
                console.warn(
                    `[TypedProposalClient] Dropping proposal with unknown path: ${proposal.path}`,
                )
                continue
            }

            const result = fieldSchema.safeParse(proposal.value)
            if (!result.success) {
                console.warn(
                    `[TypedProposalClient] Dropping proposal at ${proposal.path} — value failed schema validation:`,
                    result.error.issues,
                )
                continue
            }

            typed.push({
                ...proposal,
                path: proposal.path as PathsOf<Shape>,
                value: result.data,
            } as TypedFieldProposal<Shape>)
        }

        return typed
    }
}
