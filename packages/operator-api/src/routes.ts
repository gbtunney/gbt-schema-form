import type {Routing}from 'express-zod-api'
import {deriveOcrEndpoint} from './routes/derive-ocr.js'
export const routing = {
    // flat syntax — /v1/users
   v1:{ "/derive/ocr": deriveOcrEndpoint,
   }

}