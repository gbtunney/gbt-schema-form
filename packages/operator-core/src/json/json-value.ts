import { type Json } from '@snailicide/g-library'
import { z } from 'zod'

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = Json.Value | null

// Strict JSON validation (recursive)
export const jsonValueSchema = z.json()
export type JsonSchemaType = z.infer<typeof jsonValueSchema>

// Boundary-safe (non-recursive) — use this in express-zod-api endpoints to avoid bad codegen
export const jsonBoundarySchema = z.unknown()
export type JsonBoundary = z.infer<typeof jsonBoundarySchema>

export { type Json } from '@snailicide/g-library'
