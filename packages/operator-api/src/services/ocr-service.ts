// packages/operator-api/src/services/ocr-service.ts
// Mock OCR service. In a real implementation this would call an OCR
// provider like Tesseract or Google Vision. For now it simply echoes
// whichever input value is provided.

export type OcrInput = { imageUrl?: string; base64?: string }
export type OcrService = (input: OcrInput) => Promise<string>

export function createOcrService(): OcrService {
    return async (input: OcrInput) => {
        if (input.base64) return input.base64
        return input.imageUrl ?? ''
    }
}
