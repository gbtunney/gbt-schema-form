import { z } from 'zod'

/**
 * ISO 8601 datetime string schema.
 */
export const isoDateTimeStringSchema = z.string()
export type IsoDateTimeString = z.infer<typeof isoDateTimeStringSchema>
