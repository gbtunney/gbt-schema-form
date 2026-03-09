import { URL } from 'node:url'
import { getEnv } from './config/env.js'
import { buildServer } from './server.js'

namespace NodeJS {
    type ProcessEnv = {
        /** Set to '0' to skip auto-booting the server. Default: boot enabled */
        SMOKE_BOOT_SERVER?: '0' | '1'
        /** Set to '1' to include AI routes (transcribe, proposals). Default: off */
        SMOKE_INCLUDE_AI?: '0' | '1'
        /** Set to '1' to include OCR route. Default: off */
        SMOKE_INCLUDE_OCR?: '0' | '1'
    }
}

type HttpMethod = 'GET' | 'POST'

type RouteCall = {
    body?: unknown
    method: HttpMethod
    name: string
    path: string
    query?: Record<string, string>
}

type RouteResult = {
    body: string
    method: HttpMethod
    name: string
    path: string
    status: number
}

/** Build a fully-qualified route URL from a base URL and route definition. */
function buildUrl(baseUrl: string, routeCall: RouteCall): string {
    const url = new URL(routeCall.path, baseUrl)

    if (routeCall.query) {
        for (const [key, value] of Object.entries(routeCall.query)) {
            url.searchParams.set(key, value)
        }
    }

    return url.toString()
}

/** Extract the numeric port from a URL string when present. */
function getPortFromBaseUrl(baseUrl: string): number | null {
    try {
        const parsedUrl = new URL(baseUrl)
        if (!parsedUrl.port) {
            return parsedUrl.protocol === 'https:' ? 443 : 80
        }
        const parsedPort = Number.parseInt(parsedUrl.port, 10)
        return Number.isNaN(parsedPort) ? null : parsedPort
    } catch {
        return null
    }
}

/** Perform one HTTP call and return a printable result summary. */
async function callRoute(
    baseUrl: string,
    routeCall: RouteCall,
): Promise<RouteResult> {
    const url = buildUrl(baseUrl, routeCall)

    const response = await fetch(url, {
        body: routeCall.body ? JSON.stringify(routeCall.body) : undefined,
        headers: routeCall.body
            ? { 'Content-Type': 'application/json' }
            : undefined,
        method: routeCall.method,
    })

    return {
        body: await response.text(),
        method: routeCall.method,
        name: routeCall.name,
        path: routeCall.path,
        status: response.status,
    }
}

/** Parse and pretty-print route payloads without throwing on non-JSON bodies. */
function printPayload(payload: string): void {
    try {
        const parsedPayload = JSON.parse(payload) as unknown
        console.log(JSON.stringify(parsedPayload, null, 2))
    } catch {
        console.log(payload)
    }
}

/** Print a single route call result block to the terminal. */
function printResult(result: RouteResult): void {
    const statusGroup = Math.floor(result.status / 100)
    const statusLabel =
        statusGroup === 2
            ? 'OK'
            : statusGroup === 4
              ? 'CLIENT_ERROR'
              : statusGroup === 5
                ? 'SERVER_ERROR'
                : 'OTHER'

    console.log(
        `\n[${statusLabel}] ${result.method} ${result.path} (${result.name}) -> ${result.status.toString()}`,
    )
    printPayload(result.body)
}

/** Run smoke calls for all routes in operator-api-server. */
async function main(): Promise<void> {
    const env = getEnv()
    const baseUrl =
        env.API_BASE_URL ?? `http://localhost:${(env.PORT ?? 3001).toString()}`
    const shouldBootServer = process.env['SMOKE_BOOT_SERVER'] !== '0'
    const includeOcrRoute = process.env['SMOKE_INCLUDE_OCR'] === '1'
    const includeAiRoutes = process.env['SMOKE_INCLUDE_AI'] === '1'

    if (shouldBootServer) {
        const targetPort = getPortFromBaseUrl(baseUrl)
        if (targetPort !== null) {
            process.env['PORT'] = String(targetPort)
        }
        await buildServer()
    }

    const routeCalls: Array<RouteCall> = [
        {
            method: 'GET',
            name: 'hello:get',
            path: '/hello',
            query: { name: 'GBT', nickname: 'Skink' },
        },
        {
            body: { name: 'GBT', nickname: 'Skink' },
            method: 'POST',
            name: 'hello:post',
            path: '/hello',
        },
        {
            body: {
                timeoutMs: 10_000,
                url: 'https://en.wikipedia.org/wiki/Blue-tongued_skink',
            },
            method: 'POST',
            name: 'derive:scrape:post',
            path: '/derive/scrape',
        },
    ]

    if (includeOcrRoute) {
        routeCalls.push({
            method: 'GET',
            name: 'derive:ocr:get',
            path: '/derive/ocr',
            query: {
                imageUrl:
                    'https://upload.wikimedia.org/wikipedia/commons/3/3f/JPEG_example_flower.jpg',
                langs: 'eng',
            },
        })
    }

    if (includeAiRoutes) {
        routeCalls.push(
            {
                body: {
                    audioBase64: 'UklGRiQAAABXQVZFZm10IA==',
                    language: 'en',
                    mimeType: 'audio/webm',
                },
                method: 'POST',
                name: 'derive:transcribe:post',
                path: '/derive/transcribe',
            },
            {
                body: {
                    evidenceItem: {
                        createdAt: '2026-03-08T00:00:00.000Z',
                        groupId: 'grp_1',
                        id: 'ev_1',
                        pinned: false,
                        selected: true,
                        text: 'Name: Jane Doe. Email: jane@example.com',
                        title: 'test evidence',
                        updatedAt: '2026-03-08T00:00:00.000Z',
                    },
                    recordData: {},
                    schemaId: 'demo-schema',
                },
                method: 'POST',
                name: 'proposals:from-evidence:post',
                path: '/v1/proposals/from-evidence',
            },
        )
    }

    console.log(`Running route smoke calls against ${baseUrl}`)
    console.log(
        `Options: boot=${shouldBootServer ? 'on' : 'off'} ocr=${includeOcrRoute ? 'on' : 'off'} ai=${includeAiRoutes ? 'on' : 'off'}`,
    )

    let transportFailureCount = 0

    for (const routeCall of routeCalls) {
        try {
            const result = await callRoute(baseUrl, routeCall)
            printResult(result)
        } catch (error: unknown) {
            transportFailureCount += 1
            const message =
                error instanceof Error ? error.message : String(error)
            console.error(
                `\n[NETWORK_ERROR] ${routeCall.method} ${routeCall.path} (${routeCall.name})`,
            )
            console.error(message)
        }
    }

    if (transportFailureCount > 0) {
        console.error(
            `\nCompleted with ${transportFailureCount.toString()} transport failure(s).`,
        )
        process.exit(1)
    }

    console.log('\nCompleted route smoke calls.')
    process.exit(0)
}

void main()
