import { describe, expect, test } from 'vitest'
import { z } from 'zod'

import { jsonParser, jsonStringified } from './json-stringified.js'

describe('json/json-stringified', () => {
    test('serialize + deserialize roundtrip', () => {
        const schema = jsonStringified(z.object({ a: z.number() }))

        const raw = schema.serialize({ a: 1 })
        expect(typeof raw).toBe('string')
        expect(schema.deserialize(raw)).toEqual({ a: 1 })
    })

    test('parseToValue parses JSON and validates schema', () => {
        const schema = jsonStringified(z.object({ a: z.number() }))
        expect(schema.parseToValue('{"a":2}')).toEqual({ a: 2 })
    })

    test('validate works for string and object inputs', () => {
        const schema = jsonStringified(z.object({ a: z.number() }))

        expect(schema.validate('{"a":1}')).toBe(true)
        expect(schema.validate({ a: 1 })).toBe(true)

        expect(schema.validate('{"a":"nope"}')).toBe(false)
        expect(schema.validate('not-json')).toBe(false)
    })

    test('safeParse reports invalid JSON', () => {
        const schema = jsonStringified(z.object({ a: z.number() }))
        const result = schema.safeParse('nope')
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe('Value is not valid JSON')
        }
    })

    test('jsonParser() defaults to z.json()', () => {
        const schema = jsonParser()
        expect(schema.validate('{"a":[1,true,null,"x"]}')).toBe(true)
        expect(schema.validate('nope')).toBe(false)
    })
})
