import { z } from 'zod'

/**
 * ISO 8601 datetime string schema.
 */
export const isoDateTimeStringSchema = z.iso.datetime()
export type IsoDateTimeString = z.infer<typeof isoDateTimeStringSchema>
