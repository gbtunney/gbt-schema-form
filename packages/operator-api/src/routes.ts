import {helloWorldEndpoint} from './routes/hello-world.js'
import type { Routing } from 'express-zod-api'
import {deriveOcrEndpoint,  } from './routes/derive-ocr.js'
export const routes: Routing = {
    // flat syntax — /v1/users
   // v1: {
        '/derive/ocr': deriveOcrEndpoint ,
        hello: helloWorldEndpoint,
   // },
}
