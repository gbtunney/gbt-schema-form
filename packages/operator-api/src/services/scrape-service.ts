// packages/operator-api/src/services/scrape-service.ts
// Mock scraping service. A real implementation would fetch the remote URL
// and extract text from the page. For now it simply returns the URL
// prefixed with a marker so that the caller can see the input.

export type ScrapeInput = { url: string }
export type ScrapeService = (input: ScrapeInput) => Promise<string>

export function createScrapeService(): ScrapeService {
    return async (input: ScrapeInput) => {
        return `scraped content from ${input.url}`
    }
}
