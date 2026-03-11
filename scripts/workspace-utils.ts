import { execSync } from 'node:child_process'
import {} from '@snailicide/build-config'
//todo: move to sh utils
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
        result = `ERROR: ${String((error as Error).message)}`
    }
    return { success, result }
}

/** ---------- brand ---------- */

declare const semverBrand: unique symbol
export type Semver = string & {
    readonly [semverBrand]: true
}

/** ---------- regexp ---------- */

export const SEMVER_REGEX =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/

/** ---------- validator ---------- */

export function isSemver(value: string): value is Semver {
    return SEMVER_REGEX.test(value)
}

/*
type WorkspacePackage = {
     "name": "@gbt/root",
    "version": "0.0.0",
    "path": "/workspaces/gbt-schema-form",
    "private": true
}
*/
export type WorkspacePackage = {
    name: string
    path: string
    version: string
    private: boolean
    // "dependencies": {}
}

type KeyMode = 'include' | 'exclude'

function setPackageKey<K extends keyof WorkspacePackage>(
    pkg: WorkspacePackage,
    keys: readonly K[],
    mode: 'include',
): Pick<WorkspacePackage, K>

function setPackageKey<K extends keyof WorkspacePackage>(
    pkg: WorkspacePackage,
    keys: readonly K[],
    mode: 'exclude',
): Omit<WorkspacePackage, K>

function setPackageKey<K extends keyof WorkspacePackage>(
    pkg: WorkspacePackage,
    keys: readonly K[],
    mode: KeyMode,
): Pick<WorkspacePackage, K> | Omit<WorkspacePackage, K> {
    if (mode === 'include') {
        return Object.fromEntries(keys.map((key) => [key, pkg[key]])) as Pick<
            WorkspacePackage,
            K
        >
    }
    const clone = { ...pkg }
    for (const key of keys) {
        delete clone[key]
    }
    return clone as Omit<WorkspacePackage, K>
}

export function getWorkspacePackagesList(
    keys?: undefined,
    mode?: KeyMode,
    filter?: (pkg: WorkspacePackage) => boolean,
): WorkspacePackage[]

export function getWorkspacePackagesList<K extends keyof WorkspacePackage>(
    keys: readonly K[],
    mode: 'include',
    filter?: (pkg: WorkspacePackage) => boolean,
): Array<Pick<WorkspacePackage, K>>

export function getWorkspacePackagesList<K extends keyof WorkspacePackage>(
    keys: readonly K[],
    mode: 'exclude',
    filter?: (pkg: WorkspacePackage) => boolean,
): Array<Omit<WorkspacePackage, K>>

export function getWorkspacePackagesList<K extends keyof WorkspacePackage>(
    keys?: readonly K[],
    mode: KeyMode = 'include',
    filter?: (pkg: WorkspacePackage) => boolean,
):
    | WorkspacePackage[]
    | Array<Pick<WorkspacePackage, K>>
    | Array<Omit<WorkspacePackage, K>> {
    const out = getExecCommandOutput('pnpm list -r --depth -1 --json')

    if (!out.success) {
        return []
    }

    let pkgList = JSON.parse(out.result) as WorkspacePackage[]

    if (filter) {
        pkgList = pkgList.filter(filter)
    }

    if (!keys || keys.length === 0) {
        return pkgList
    }

    if (mode === 'include') {
        return pkgList.map(
            (pkg) =>
                Object.fromEntries(keys.map((key) => [key, pkg[key]])) as Pick<
                    WorkspacePackage,
                    (typeof keys)[number]
                >,
        )
    }
    return pkgList.map((pkg) => {
        const clone = { ...pkg }
        for (const key of keys) {
            delete clone[key]
        }
        return clone as Omit<WorkspacePackage, (typeof keys)[number]>
    })
}

/** Map<packageName, packagePath> */
export function getWorkspacePackagesLookup(
    filter?: (pkg: WorkspacePackage) => boolean,
): Map<string, WorkspacePackage> {
    const pkgObject: Record<string, WorkspacePackage> =
        workspacePackagesObject(filter)
    return new Map(Object.entries(pkgObject))
}

/** Record<packageName, packagePath> */
export const workspacePackagesObject = (
    filter?: (pkg: WorkspacePackage) => boolean,
): Record<string, WorkspacePackage> => {
    return Object.fromEntries(
        getWorkspacePackagesList(undefined, undefined, filter).map((pkg) => [
            pkg.name,
            pkg,
        ]),
    )
}
/** Array of package paths */
export function getWorkspacePackagePaths(): string[] {
    return getWorkspacePackagesList().map((p) => p.path)
}

/** Workspace root path */
export function getWorkspaceRoot(): string {
    return execCommand('pnpm root -w') ?? ''
}
