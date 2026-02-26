// packages/operator-api/src/index.ts
// Entry point for the operator‑api package.
// Exports a factory function to build an Express server with all routes wired up.

import { buildServer } from './server.js'

// Re‑export the service and server builders for external consumption.
export { buildServer }

// Default export simplifies require/import usage
export default buildServer

// EXport the front end client API or external consumption.
export * from './generated/api.js'
