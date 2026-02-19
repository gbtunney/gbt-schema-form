import { Integration } from 'express-zod-api'
import typescript from 'typescript'
import { routes } from './routes.js'
import { getConfig } from './server.js'

export const client = new Integration({
    config: getConfig(), // or await Integration.create() to delegate importing
    routing: routes,
    typescript,
    variant: 'client', // <— optional, see also "types" for a DIY solution
})

export const prettierFormattedTypescriptCode = await client.printFormatted()
