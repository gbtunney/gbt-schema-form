import { z } from 'zod'

/**
 * ISO 8601 datetime string schema.
 */
export const isoDateTimeStringSchema = z.string().datetime()
export type IsoDateTimeString = z.infer<typeof isoDateTimeStringSchema>
