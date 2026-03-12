import { execSync } from 'child_process'
import { execCommand, getExecCommandOutput } from './lib/shell-utilities.js'
//todo: move to sh utils

export type WorkspacePackage = {
    name: string
    path: string
    version: string
    private: boolean
    // "dependencies": {}
}

export function getWorkspacePackagesList(
    filter: ((pkg: WorkspacePackage) => boolean) | undefined = undefined,
): WorkspacePackage[] {
    const out = getExecCommandOutput('pnpm list -r --depth -1 --json')

    if (!out.success) {
        return []
    }

    const pkgList = JSON.parse(out.result) as WorkspacePackage[]

    return filter ? pkgList.filter(filter) : pkgList
}

/**
 * Transform a workspace packages lookup back into an array.
 *
 * - For Map<name, pkg> -> returns WorkspacePackage[]
 * - For Record<name, pkg> -> returns WorkspacePackage[]
 */
export function workspacePackagesToArray(
    input:
        | ReadonlyMap<string, WorkspacePackage>
        | Record<string, WorkspacePackage>,
): WorkspacePackage[] {
    if (input instanceof Map) {
        return Array.from(input.values())
    }
    return Object.values(input)
}

/** Map<packageName, packagePath> */
export function getWorkspacePackagesLookup(
    ...args: Parameters<typeof getWorkspacePackagesList>
): Map<string, WorkspacePackage> {
    const pkgObject: Record<string, WorkspacePackage> =
        getWorkspacePackagesObject(...args)
    return new Map(Object.entries(pkgObject))
}

export function getWorkspacePackagesObject(
    filter?: (pkg: WorkspacePackage) => boolean,
): Record<string, WorkspacePackage>
export function getWorkspacePackagesObject<R>(
    filter: ((pkg: WorkspacePackage) => boolean) | undefined,
    mapValue: (pkg: WorkspacePackage, name: string, index: number) => R,
): Record<string, R>
export function getWorkspacePackagesObject<R>(
    filter?: ((pkg: WorkspacePackage) => boolean) | undefined,
    mapValue?: (pkg: WorkspacePackage, name: string, index: number) => R,
) {
    const pkgs = getWorkspacePackagesList(filter)

    if (!mapValue) {
        return Object.fromEntries(
            pkgs.map((pkg) => [pkg.name, pkg] as const),
        ) as Record<string, WorkspacePackage>
    }

    return Object.fromEntries(
        pkgs.map((pkg, i) => [pkg.name, mapValue(pkg, pkg.name, i)] as const),
    ) as Record<string, R>
}

/** Workspace root path */
export function getWorkspaceRoot(): string {
    return execCommand('pnpm root -w') ?? ''
}

type KeyMode = 'include' | 'exclude'

// Overloads give precise return types based on `mode`
function setPackageKeys<Key extends keyof WorkspacePackage>(
    pkg: WorkspacePackage,
    mode: 'include',
    keys: readonly Key[],
): Pick<WorkspacePackage, Key>
function setPackageKeys<Key extends keyof WorkspacePackage>(
    pkg: WorkspacePackage,
    mode: 'exclude',
    keys: readonly Key[],
): Omit<WorkspacePackage, Key>
function setPackageKeys<Key extends keyof WorkspacePackage>(
    pkg: WorkspacePackage,
    mode: KeyMode,
    keys: readonly Key[],
) {
    if (mode === 'include') {
        return Object.fromEntries(keys.map((key) => [key, pkg[key]])) as Pick<
            WorkspacePackage,
            Key
        >
    }

    const clone = { ...pkg }
    for (const key of keys) {
        delete clone[key]
    }
    return clone as Omit<WorkspacePackage, Key>
}

function setAllPackageKeys<Key extends keyof WorkspacePackage>(
    pkgs: readonly WorkspacePackage[],
    mode: 'include',
    keys: readonly Key[],
): Array<Pick<WorkspacePackage, Key>>
function setAllPackageKeys<Key extends keyof WorkspacePackage>(
    pkgs: readonly WorkspacePackage[],
    mode: 'exclude',
    keys: readonly Key[],
): Array<Omit<WorkspacePackage, Key>>
function setAllPackageKeys<Key extends keyof WorkspacePackage>(
    pkgs: readonly WorkspacePackage[],
    mode: KeyMode,
    keys: readonly Key[],
) {
    return pkgs.map((pkg) => setPackageKeys(pkg, mode as any, keys))
}
