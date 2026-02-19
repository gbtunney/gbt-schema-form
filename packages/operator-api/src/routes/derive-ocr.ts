 /* Defines the OCR derivation endpoint. Accepts either an image URL or base64‑encoded image data and returns extracted text. Request structure: one of imageUrl or base64 must be provided.*/

import { defaultEndpointsFactory as endPointsFactory } from 'express-zod-api'
import { createOcrService } from './../services/ocr-service.js'
import Tesseract, { type ImageLike, type Page, type RecognizeResult } from 'tesseract.js'
import type { Merge } from 'type-fest'
import { z } from 'zod'

export const ocrInitialSchema = z
    .object({
        base64: z.base64().optional(),
        imageUrl: z.url().optional(),
        langs: z.union([z.string(), z.array(z.string())]).default('eng'),
    })
    .refine((data): boolean => !!(data.base64 || data.imageUrl), {
        error: 'Provide either base64 or imageUrl',
        path: ['base64'],
    })

type InnerOutput = Merge<{ image: ImageLike }, Pick<z.output<typeof ocrInitialSchema>, 'langs'>>

export const ocrInputInnerSchema: z.ZodType<
    InnerOutput,
    z.input<typeof ocrInitialSchema>
> = ocrInitialSchema.transform((val, ctx): InnerOutput => {
    const out = val.base64 ?? val.imageUrl
    if (!out) {
        ctx.issues.push({
            code: 'custom',
            input: val,
            message: 'Provide either base64 or imageUrl',
        })
        return z.NEVER
    }
    const _imageLike: ImageLike = out as unknown as ImageLike

    const _data: InnerOutput = { image: _imageLike, langs: val.langs }
    return _data
})

type ImageInput = Parameters<typeof Tesseract.recognize>[0]
export type OcrInputSchema = z.input<typeof ocrInitialSchema>

export type OcrOutputSchema = Pick<Page, 'text' | 'confidence' /*|"words"*/>

export const ocrOutputSchema: z.ZodType<OcrOutputSchema> = z.object({
    confidence: z.number(),
    text: z.string(),
    //words:z.array(z.string()),
    //lines:z.array(z.number())
})

const newSchema = z
    .object({
        email: z.email().optional(),
        id: z.string().optional(),
        lang: z.union([z.string(), z.array(z.string())]).default('eng'),
        otherThing: z.string().optional(),
    })
    .refine((inputs) => Object.keys(inputs).length >= 1, 'Please provide at least one property')
//type MYTYPE = EndpointsFactory<z.infer<typeof ocrOutputSchema>, z.infer<typeof ocrInputSchema>>
export const deriveOcrEndpoint = endPointsFactory.build({
    handler: async ({ ctx, input: { image, langs }, logger }) => {
        const tttttt: ImageLike = image
        logger.debug('Context:', ctx) // middlewares provide ctx
        logger.debug('lang:', langs) // middlewares provide ctx
        const result: RecognizeResult = await createOcrService()(image, langs)
        if (!result?.data?.text) logger.error('No image found:', image) // middlewares provide ctx
        return { confidence: result.data.confidence, text: result.data.text }
    },
    input: ocrInputInnerSchema,
    output: ocrOutputSchema,
    })
