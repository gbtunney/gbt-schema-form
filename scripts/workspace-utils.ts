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
    filter?: (pkg: WorkspacePackage) => boolean,
): Array<WorkspacePackage> {
    const out = getExecCommandOutput('pnpm list -r --depth -1 --json')

    if (!out.success) {
        return []
    }

    const pkgList = JSON.parse(out.result) as Array<WorkspacePackage>

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
): Array<WorkspacePackage> {
    if (input instanceof Map) {
        return Array.from<WorkspacePackage>(input.values())
    }
    return Object.values<WorkspacePackage>(
        input as Record<string, WorkspacePackage>,
    )
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
    filter?: (pkg: WorkspacePackage) => boolean,
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

/** Overloads give precise return types based on `mode` */
function setPackageKeys<Key extends keyof WorkspacePackage>(
    pkg: WorkspacePackage,
    mode: 'include',
    keys: ReadonlyArray<Key>,
): Pick<WorkspacePackage, Key>
function setPackageKeys<Key extends keyof WorkspacePackage>(
    pkg: WorkspacePackage,
    mode: 'exclude',
    keys: ReadonlyArray<Key>,
): Omit<WorkspacePackage, Key>
function setPackageKeys<Key extends keyof WorkspacePackage>(
    pkg: WorkspacePackage,
    mode: KeyMode,
    keys: ReadonlyArray<Key>,
) {
    if (mode === 'include') {
        return Object.fromEntries(keys.map((key) => [key, pkg[key]])) as Pick<
            WorkspacePackage,
            Key
        >
    }

    return Object.fromEntries(
        (Object.keys(pkg) as Array<keyof WorkspacePackage>)
            .filter(
                (key) =>
                    !(keys as ReadonlyArray<keyof WorkspacePackage>).includes(
                        key,
                    ),
            )
            .map((key) => [key, pkg[key]]),
    ) as Omit<WorkspacePackage, Key>
}

function setAllPackageKeys<Key extends keyof WorkspacePackage>(
    pkgs: ReadonlyArray<WorkspacePackage>,
    mode: 'include',
    keys: ReadonlyArray<Key>,
): Array<Pick<WorkspacePackage, Key>>
function setAllPackageKeys<Key extends keyof WorkspacePackage>(
    pkgs: ReadonlyArray<WorkspacePackage>,
    mode: 'exclude',
    keys: ReadonlyArray<Key>,
): Array<Omit<WorkspacePackage, Key>>
function setAllPackageKeys<Key extends keyof WorkspacePackage>(
    pkgs: ReadonlyArray<WorkspacePackage>,
    mode: KeyMode,
    keys: ReadonlyArray<Key>,
) {
    if (mode === 'include') {
        return pkgs.map((pkg) => setPackageKeys(pkg, mode, keys))
    }
    return pkgs.map((pkg) => setPackageKeys(pkg, mode, keys))
}

function setAllPackageKeysExcluding<Key extends keyof WorkspacePackage>(
    pkgs: ReadonlyArray<WorkspacePackage>,
    mode: 'include',
    keys: ReadonlyArray<Key>,
): Array<Pick<WorkspacePackage, Key>>
function setAllPackageKeysExcluding<Key extends keyof WorkspacePackage>(
    pkgs: ReadonlyArray<WorkspacePackage>,
    mode: 'exclude',
    keys: ReadonlyArray<Key>,
): Array<Omit<WorkspacePackage, Key>>
function setAllPackageKeysExcluding<Key extends keyof WorkspacePackage>(
    pkgs: ReadonlyArray<WorkspacePackage>,
    mode: KeyMode,
    keys: ReadonlyArray<Key>,
) {
    if (mode === 'include') {
        return pkgs.map((pkg) => setPackageKeys(pkg, mode, keys))
    }
    return pkgs.map((pkg) => setPackageKeys(pkg, mode, keys))
}
