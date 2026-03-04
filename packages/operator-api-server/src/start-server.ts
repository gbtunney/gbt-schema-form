import { buildServer } from './server.js'

buildServer().catch((err: unknown) => {
    console.error('Failed to start API server:', err)
    process.exit(1)
})
