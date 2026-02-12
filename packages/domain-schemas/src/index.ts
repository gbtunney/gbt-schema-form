import { z } from 'zod'

/**
 * Domain schema placeholder.
 *
 * Domain Zod schemas live here (not in operator packages).
 * Build outputs should generate JSON Schema artifacts for UI runtime use.
 */

export const exampleSchema = z.object({
    id: z.string(),
    name: z.string(),
    value: z.number().optional(),
})

export type Example = z.infer<typeof exampleSchema>
