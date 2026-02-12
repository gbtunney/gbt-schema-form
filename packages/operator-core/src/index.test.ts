import { describe, expect, it } from 'vitest'

import { jsonValueSchema } from './json/json-value.js'

describe('@operator/core', () => {
    it('parses JsonValue via Zod', () => {
        const parsed = jsonValueSchema.parse({ a: [1, true, null, 'x'] })
        expect(parsed).toEqual({ a: [1, true, null, 'x'] })
    })
})
