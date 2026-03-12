#!/usr/bin/env tsx

import { execSync } from 'node:child_process'

const CYAN = '\x1b[0;36m'
const YELLOW = '\x1b[1;33m'
const GREEN = '\x1b[0;32m'
const RED = '\x1b[0;31m'
const GRAY = '\x1b[0;90m'
const RESET = '\x1b[0m'

/** Print a stable section header for diagnostics output. */
const printSection = (title: string): void => {
    process.stdout.write(`\n${CYAN}=== ${title} ===${RESET}\n`)
}

const printKeyValue = (
    key: string,
    value: string,
    valueColor: string = RESET,
): void => {
    process.stdout.write(
        `${GRAY}${key}:${RESET} ${valueColor}${value}${RESET}\n`,
    )
}

const colorizePrettierOutput = (output: string): string => {
    return output
        .split('\n')
        .map((line) => {
            if (line.startsWith('[warn]')) {
                return `${YELLOW}${line}${RESET}`
            }
            if (line.startsWith('[error]')) {
                return `${RED}${line}${RESET}`
            }
            return line
        })
        .join('\n')
}

/** Execute prettier check and return raw output text. */
const runPrettierCheck = (): {
    success: boolean
    output: string
    exitCode: number
} => {
    ///build ts
    execSync('pnpm build:self')

    const command = 'pnpm prettier --check'
    try {
        const output = execSync(command, {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
        })
        return { exitCode: 0, output: output.trim(), success: true }
    } catch (error: unknown) {
        const commandError = error as {
            status?: number
            stdout?: string | Buffer
            stderr?: string | Buffer
            message?: string
        }

        const stdoutText = String(commandError.stdout ?? '').trim()
        const stderrText = String(commandError.stderr ?? '').trim()
        const output = [stdoutText, stderrText]
            .filter((value) => value.length > 0)
            .join('\n')
        const exitCode = commandError.status ?? 1
        const fallbackMessage =
            commandError.message ?? 'Prettier check failed to execute.'

        return {
            exitCode,
            output: output.length > 0 ? output : fallbackMessage,
            success: false,
        }
    }
}

printSection('Prettier Report')
const result = runPrettierCheck()

if (result.success) {
    printKeyValue('status', 'clean', GREEN)
    if (result.output.length > 0) {
        process.stdout.write(`${colorizePrettierOutput(result.output)}\n`)
    }
} else {
    const statusColor = result.exitCode === 1 ? YELLOW : RED
    printKeyValue('status', 'needs-formatting-or-check-error', statusColor)
    printKeyValue('prettier_exit_code', String(result.exitCode), statusColor)
    process.stdout.write(`${colorizePrettierOutput(result.output)}\n`)
}

process.exit(0)
