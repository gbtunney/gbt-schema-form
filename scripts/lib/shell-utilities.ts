import { execSync } from 'child_process'

/** Run a shell command via execSync and return stdout as a string. */

export function execCommand(
    command: string,
    trim: boolean = true,
    encoding: BufferEncoding = 'utf8',
): string | undefined {
    try {
        const output = execSync(command, { encoding })
        return trim ? output.trim() : output
    } catch (error: unknown) {
        const commandError = error as {
            status?: number
            stderr?: string | Buffer
            stdout?: string | Buffer
            message?: string
        }

        const stderrText = String(commandError.stderr ?? '').trim()
        const message = stderrText || commandError.message || 'Command failed'
        throw new Error(`execCommand failed: ${command}\n${message}`)
    }
}

export const getExecCommandOutput = (
    ...args: Parameters<typeof execCommand>
): { success: boolean; result: string } => {
    const [command] = args
    let success: boolean = false
    let result: string | undefined = undefined
    try {
        const _result = execCommand(...args)
        if (_result !== undefined) {
            success = true
            result = _result
        } else {
            result = `ERROR: Cli Output returned empty string.\n cmd: ${command}`
        }
    } catch (error: unknown) {
        result = `ERROR: ${(error as Error).message}`
    }
    return { result, success }
}

/** Escapes a CLI argument for shell-safe inclusion in a command string. */
export const quoteShellArgument = (value: string): string => {
    return `'${value.replace(/'/g, `'"'"'`)}'`
}
