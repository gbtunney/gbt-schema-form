import { ProjectGraph, ProjectGraphProjectNode } from '@nx/devkit'
import { readFileSync } from 'fs'
import { getExecCommandOutput } from '../lib/shell-utilities.js'
/** 🌸 Type-safe Cute Logger */
function logAffected() {
    try {
        // Note: 'nx show projects --affected --json' returns string[]
        // If you use 'nx graph --affected --file=stdout', it returns ProjectGraph
        const input = readFileSync(0, 'utf8')

        if (!input.trim()) {
            console.log('✨ No projects affected. Everything is chill! 🌸')
            return
        }

        const projectNames: Array<string> = JSON.parse(input)

        if (projectNames.length === 0) {
            console.log('\n✨ No projects affected. Everything is chill! 🌸\n')
            return
        }

        console.log('\n🌸 \x1b[35m%s\x1b[0m', 'Affected Projects:')

        projectNames.forEach((name: string) => {
            console.log('  ✨ \x1b[36m%s\x1b[0m', name)
        })

        console.log(
            '\n🎀 \x1b[33mTotal:\x1b[0m %d projects need love.\n',
            projectNames.length,
        )
    } catch (err) {
        console.error('❌ Error parsing affected projects:', err)
    }
}
/**
 * #todo this is pointless    needs to fix the included / excluded script
 */
function logAffectedNodes() {
    const result = getExecCommandOutput(
        'pnpm exec nx graph --affected --file=stdout',
    )

    if (result.success) {
        try {
            // 1. The stdout from 'nx graph' is an object { graph: ProjectGraph, ... }
            const parsed = JSON.parse(result.result)
            const graph: ProjectGraph = parsed.graph

            if (!graph || !graph.nodes) {
                console.log('✨ No projects affected. Everything is chill! 🌸')
                return
            }

            const nodes = Object.values(graph.nodes)

            console.log('\n🌸 \x1b[35m%s\x1b[0m', 'Detailed Affected Projects:')

            nodes.forEach((node: ProjectGraphProjectNode) => {
                // 1. Skip the node itself if it's a separator
                if (node.name.includes('\n')) return

                const { data, name, type } = node

                // 2. FILTER the targets list
                const cleanTargets = Object.keys(data.targets || {}).filter(
                    (target) => {
                        const isSeparator =
                            target.includes('==') ||
                            target.includes('>>') ||
                            target.includes('\n')
                        return !isSeparator
                    },
                )

                // Only log if there are actual targets left
                if (cleanTargets.length > 0) {
                    console.log(`  ✨ \x1b[36m${name}\x1b[0m`)
                    console.log(`     📂 Root: ${data.root}`)
                    console.log(`     🏷️  Type: ${type}`)
                    // Log the clean list joined by commas
                    console.log(
                        `     🛠️  Targets: [${cleanTargets.join(', ')}]`,
                    )
                    console.log('') // Add a little breathing room
                }
            })
            console.log(
                '\n🎀 \x1b[33mTotal:\x1b[0m %d nodes processed.\n',
                nodes.length,
            )
        } catch (err: unknown) {
            console.error('❌ Error parsing Nx Graph output:', err)
        }
    } else {
        console.error('❌ Nx Command Failed:', result.result)
    }
}
// TODDO: reimplement someday logAffectedNodes();
logAffected()
console.log('hi')
