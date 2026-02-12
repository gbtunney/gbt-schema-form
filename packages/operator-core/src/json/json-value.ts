import { type Json } from '@snailicide/g-library'
import z from 'zod'

export type JsonPrimitive = string | number | boolean | null

export type JsonValue = Json.Value | null

export const jsonValueSchema = z.json()

//JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

export { type Json } from '@snailicide/g-library'
