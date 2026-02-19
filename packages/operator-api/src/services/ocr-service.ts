// packages/operator-api/src/services/ocr-service.ts
// Mock OCR service. In a real implementation this would call an OCR
// provider like Tesseract or Google Vision. For now it simply echoes
// whichever input value is provided.
import {
    createWorker,
    ImageLike as ImageInput,
    OutputFormats,
    RecognizeOptions,
    RecognizeResult,
} from 'tesseract.js'

// /zod.fsPathTypeExists('file')]
/*const OcrInput = z.object({
    imageBase64: z
        .string()
        .describe('Data URL or base64-encoded image (e.g., image/png)')
        .min(10),
    title: z.string().optional(),
})
*/
export type OcrService = (
    input: ImageInput,
    langs?: string | Array<string>,
    recognizeOpts?: Partial<RecognizeOptions>,
    outputFormats?: Partial<OutputFormats>,
) => Promise<RecognizeResult>

export function createOcrService(): OcrService {
    return async (
        input: ImageInput,
        langs: string | Array<string> = 'eng',
        recognizeOpts?: Partial<RecognizeOptions>,
        outputFormats?: Partial<OutputFormats>,
    ) => {
        const worker = await createWorker('eng')
        const ret = await worker.recognize(input, recognizeOpts, outputFormats)
        console.log(ret.data.text)
        await worker.terminate()

        //if (input.base64) return Promise.resolve(input.base64)
        return ret //Promise.resolve(input.imageUrl ?? '')
    }
}
