// packages/operator-api/src/index.ts
// Entry point for the operator‑api package.
// Exports a factory function to build an Express server with all routes wired up.

import { buildServer } from './server.js'
buildServer().catch((err: unknown) => {
    console.error('Failed to start API server:', err)
    process.exit(1)
})

// Re‑export the service and server builders for external consumption.
export { buildServer }

// Default export simplifies require/import usage
export default buildServer

