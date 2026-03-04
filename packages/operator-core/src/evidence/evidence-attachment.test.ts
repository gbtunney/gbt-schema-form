import { describe, expect, test } from 'vitest'
import { evidenceAttachmentSchema } from './evidence-attachment.js'

describe('evidence/evidence-attachment evidenceAttachmentSchema', () => {
    const validAttachment = {
        createdAt: '2024-01-15T10:30:00Z',
        id: 'attach-123',
        itemId: 'item-456',
        mimeType: 'application/pdf',
        url: 'https://example.com/files/document.pdf',
    }

    test('accepts valid evidence attachment with all required fields', () => {
        const result = evidenceAttachmentSchema.safeParse(validAttachment)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.id).toBe('attach-123')
            expect(result.data.itemId).toBe('item-456')
            expect(result.data.url).toBe(
                'https://example.com/files/document.pdf',
            )
            expect(result.data.mimeType).toBe('application/pdf')
        }
    })

    test('accepts various valid URLs', () => {
        const validUrls = [
            'https://example.com/file.pdf',
            'http://localhost:3000/upload',
            'https://cdn.example.com/path/to/file.jpg',
            'ftp://files.example.com/document.txt',
        ]

        validUrls.forEach((url) => {
            const attachment = { ...validAttachment, url }
            const result = evidenceAttachmentSchema.safeParse(attachment)
            expect(result.success).toBe(true)
        })
    })

    test('rejects invalid URL formats', () => {
        const invalidUrls = [
            'not-a-url',
            'example.com/file',
            '/relative/path',
            '',
        ]

        invalidUrls.forEach((url) => {
            const attachment = { ...validAttachment, url }
            const result = evidenceAttachmentSchema.safeParse(attachment)
            expect(result.success).toBe(false)
        })
    })

    test('accepts various MIME types', () => {
        const validMimeTypes = [
            'image/png',
            'image/jpeg',
            'application/json',
            'text/plain',
            'video/mp4',
            'application/octet-stream',
        ]

        validMimeTypes.forEach((mimeType) => {
            const attachment = { ...validAttachment, mimeType }
            const result = evidenceAttachmentSchema.safeParse(attachment)
            expect(result.success).toBe(true)
        })
    })

    test('rejects attachment missing required id', () => {
        const { id, ...withoutId } = validAttachment
        const result = evidenceAttachmentSchema.safeParse(withoutId)
        expect(result.success).toBe(false)
    })

    test('rejects attachment with empty id', () => {
        const attachment = { ...validAttachment, id: '' }
        const result = evidenceAttachmentSchema.safeParse(attachment)
        expect(result.success).toBe(false)
    })

    test('rejects attachment with empty itemId', () => {
        const attachment = { ...validAttachment, itemId: '' }
        const result = evidenceAttachmentSchema.safeParse(attachment)
        expect(result.success).toBe(false)
    })

    test('rejects attachment with invalid datetime format', () => {
        const attachment = { ...validAttachment, createdAt: 'not-a-date' }
        const result = evidenceAttachmentSchema.safeParse(attachment)
        expect(result.success).toBe(false)
    })

    test('accepts empty mimeType string', () => {
        const attachment = { ...validAttachment, mimeType: '' }
        const result = evidenceAttachmentSchema.safeParse(attachment)
        expect(result.success).toBe(true)
    })

    test('rejects non-string mimeType', () => {
        const attachment = { ...validAttachment, mimeType: null }
        const result = evidenceAttachmentSchema.safeParse(attachment)
        expect(result.success).toBe(false)
    })
})
