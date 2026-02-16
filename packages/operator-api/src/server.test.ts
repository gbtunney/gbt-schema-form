import { fieldProposalSchema } from '@operator/core'
import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { z } from 'zod'

import { buildServer, buildServices } from './server.js'

/**
 * Comprehensive test coverage for Express API endpoints in server.ts
 * Tests include: valid requests, schema validation failures (400), and
 * verification that outputs match the expected Zod schemas.
 */
describe('server.ts API endpoints', () => {
    let app: ReturnType<typeof buildServer>

    beforeEach(() => {
        app = buildServer(buildServices())
    })

    describe('POST /proposals', () => {
        it('should return field proposals for valid request with matching evidence', async () => {
            const validRequest = {
                evidenceItem: {
                    createdAt: '2024-01-15T10:30:00Z',
                    groupId: 'group-1',
                    id: 'evidence-1',
                    pinned: false,
                    selected: true,
                    text: 'This is about a model Eheim 2211',
                    title: 'Model Information',
                    updatedAt: '2024-01-15T12:00:00Z',
                },
                recordData: { field1: 'value1' },
                schemaId: 'schema-1',
            }

            const response = await request(app)
                .post('/proposals')
                .send(validRequest)
                .expect(200)

            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body.length).toBeGreaterThan(0)

            // Verify each proposal matches fieldProposalSchema
            response.body.forEach((proposal: any) => {
                expect(() => fieldProposalSchema.parse(proposal)).not.toThrow()
                expect(proposal).toHaveProperty('id')
                expect(proposal).toHaveProperty('path')
                expect(proposal).toHaveProperty('value')
                expect(proposal).toHaveProperty('confidence')
                expect(proposal).toHaveProperty('evidenceItemId')
            })
        })

        it('should return empty array for valid request with no matching evidence', async () => {
            const validRequest = {
                evidenceItem: {
                    createdAt: '2024-01-15T10:30:00Z',
                    groupId: 'group-2',
                    id: 'evidence-2',
                    pinned: false,
                    selected: true,
                    text: 'This evidence does not match any pattern',
                    title: 'General Information',
                    updatedAt: '2024-01-15T12:00:00Z',
                },
                recordData: { field1: 'value1' },
                schemaId: 'schema-2',
            }

            const response = await request(app)
                .post('/proposals')
                .send(validRequest)
                .expect(200)

            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body.length).toBe(0)
        })

        it('should return 400 for invalid request schema', async () => {
            const invalidRequest = {
                evidenceItem: {
                    // missing required fields like 'id', 'groupId', timestamps, etc.
                    text: 'Some text',
                    title: 'Invalid Evidence',
                },
                recordData: {},
                // missing required schemaId
            }

            const response = await request(app)
                .post('/proposals')
                .send(invalidRequest)
                .expect(400)

            expect(response.body).toHaveProperty('error')
            expect(typeof response.body.error).toBe('string')
        })

        it('should return 400 for completely malformed request', async () => {
            const response = await request(app)
                .post('/proposals')
                .send({ invalid: 'data' })
                .expect(400)

            expect(response.body).toHaveProperty('error')
        })

        it('should validate response against fieldProposalSchema array', async () => {
            const validRequest = {
                evidenceItem: {
                    createdAt: '2024-01-15T10:30:00Z',
                    groupId: 'group-3',
                    id: 'evidence-3',
                    pinned: false,
                    selected: true,
                    text: 'model information',
                    title: 'Model Data',
                    updatedAt: '2024-01-15T12:00:00Z',
                },
                recordData: {},
                schemaId: 'schema-3',
            }

            const response = await request(app)
                .post('/proposals')
                .send(validRequest)
                .expect(200)

            // Verify the entire response can be parsed as an array of FieldProposal
            expect(() => z.array(fieldProposalSchema).parse(response.body)).not.toThrow()
        })
    })

    describe('POST /derive/ocr', () => {
        it('should return text for valid request with imageUrl', async () => {
            const validRequest = { imageUrl: 'https://example.com/image.png' }

            const response = await request(app)
                .post('/derive/ocr')
                .send(validRequest)
                .expect(200)

            expect(response.body).toHaveProperty('text')
            expect(typeof response.body.text).toBe('string')
            expect(response.body.text).toBe('https://example.com/image.png')
        })

        it('should return text for valid request with base64', async () => {
            const validRequest = { base64: 'base64EncodedImageData' }

            const response = await request(app)
                .post('/derive/ocr')
                .send(validRequest)
                .expect(200)

            expect(response.body).toHaveProperty('text')
            expect(typeof response.body.text).toBe('string')
            expect(response.body.text).toBe('base64EncodedImageData')
        })

        it('should return 400 when neither imageUrl nor base64 provided', async () => {
            const invalidRequest = {}

            const response = await request(app)
                .post('/derive/ocr')
                .send(invalidRequest)
                .expect(400)

            expect(response.body).toHaveProperty('error')
            expect(response.body.error).toContain('Provide either imageUrl or base64')
        })

        it('should return 400 for invalid imageUrl', async () => {
            const invalidRequest = { imageUrl: 'not-a-valid-url' }

            const response = await request(app)
                .post('/derive/ocr')
                .send(invalidRequest)
                .expect(400)

            expect(response.body).toHaveProperty('error')
        })
    })

    describe('POST /derive/whisper', () => {
        it('should return text for valid request with audioUrl', async () => {
            const validRequest = { audioUrl: 'https://example.com/audio.mp3' }

            const response = await request(app)
                .post('/derive/whisper')
                .send(validRequest)
                .expect(200)

            expect(response.body).toHaveProperty('text')
            expect(typeof response.body.text).toBe('string')
            expect(response.body.text).toBe('https://example.com/audio.mp3')
        })

        it('should return text for valid request with base64', async () => {
            const validRequest = { base64: 'base64EncodedAudioData' }

            const response = await request(app)
                .post('/derive/whisper')
                .send(validRequest)
                .expect(200)

            expect(response.body).toHaveProperty('text')
            expect(typeof response.body.text).toBe('string')
            expect(response.body.text).toBe('base64EncodedAudioData')
        })

        it('should return 400 when neither audioUrl nor base64 provided', async () => {
            const invalidRequest = {}

            const response = await request(app)
                .post('/derive/whisper')
                .send(invalidRequest)
                .expect(400)

            expect(response.body).toHaveProperty('error')
            expect(response.body.error).toContain('Provide either audioUrl or base64')
        })

        it('should return 400 for invalid audioUrl', async () => {
            const invalidRequest = { audioUrl: 'not-a-valid-url' }

            const response = await request(app)
                .post('/derive/whisper')
                .send(invalidRequest)
                .expect(400)

            expect(response.body).toHaveProperty('error')
        })
    })

    describe('POST /derive/scrape', () => {
        it('should return text for valid request with url', async () => {
            const validRequest = { url: 'https://example.com/page' }

            const response = await request(app)
                .post('/derive/scrape')
                .send(validRequest)
                .expect(200)

            expect(response.body).toHaveProperty('text')
            expect(typeof response.body.text).toBe('string')
            expect(response.body.text).toContain('scraped content from')
            expect(response.body.text).toContain('https://example.com/page')
        })

        it('should return 400 for invalid url', async () => {
            const invalidRequest = { url: 'not-a-valid-url' }

            const response = await request(app)
                .post('/derive/scrape')
                .send(invalidRequest)
                .expect(400)

            expect(response.body).toHaveProperty('error')
        })

        it('should return 400 for missing url', async () => {
            const invalidRequest = {}

            const response = await request(app)
                .post('/derive/scrape')
                .send(invalidRequest)
                .expect(400)

            expect(response.body).toHaveProperty('error')
        })
    })
})
