// Domain schema placeholder. In a complete implementation this file would
// export Zod schemas for specific domains (e.g. equipment.v1). A build
// process would generate JSON Schema representations as part of the dist.

import { z } from 'zod'

export const exampleSchema = z.object({
    id: z.string(),
    name: z.string(),
    value: z.number().optional(),
})

export type Example = typeof exampleSchema._type
