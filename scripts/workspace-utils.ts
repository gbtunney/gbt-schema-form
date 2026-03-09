import { execSync } from 'node:child_process'

type WorkspacePackage = {
    name: string
    path: string
}

/** Return raw pnpm workspace package list */
function getWorkspacePackages(): WorkspacePackage[] {
    const stdout = execSync('pnpm list -r --depth -1 --json', {
        encoding: 'utf8',
    })

    return JSON.parse(stdout) as WorkspacePackage[]
}

/** Map<packageName, packagePath> */
export function getWorkspacePackageMap(): Map<string, string> {
    return new Map(getWorkspacePackages().map((p) => [p.name, p.path]))
}

/** Record<packageName, packagePath> */
export function getWorkspacePackageObject(): Record<string, string> {
    return Object.fromEntries(getWorkspacePackageMap())
}

/** Array of package paths */
export function getWorkspacePackagePaths(): string[] {
    return getWorkspacePackages().map((p) => p.path)
}

/** Workspace root path */
export function getWorkspaceRoot(): string {
    return execSync('pnpm root -w', { encoding: 'utf8' }).trim()
}
