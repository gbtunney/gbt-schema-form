/**
 * StatePanel
 *
 * Right panel of the playground. Shows live read-only state:
 *
 * - FormData (current record values)
 * - PatchHistory (applied patches, newest first)
 * - Proposals (last generated set, raw)
 *
 * All read from props — no store access here.
 */

import type { AppliedPatch, FieldProposal } from '@operator/core'
import { type ReactElement, useState } from 'react'

type StateTab = 'formData' | 'patches' | 'proposals'

type Props = {
    formData: Record<string, unknown>
    patches: Array<AppliedPatch>
    proposals: Array<FieldProposal>
}

const PANEL: React.CSSProperties = {
    borderLeft: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
}

const TABS: React.CSSProperties = {
    background: '#f8f8f8',
    borderBottom: '1px solid #ddd',
    display: 'flex',
}

function tab(active: boolean): React.CSSProperties {
    return {
        background: 'none',
        border: 'none',
        borderBottom: active ? '2px solid #0066cc' : '2px solid transparent',
        borderRadius: 0,
        color: active ? '#0066cc' : '#555',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        marginBottom: -1,
        padding: '8px 14px',
    }
}

const PRE: React.CSSProperties = {
    background: '#fafafa',
    color: '#1a1a1a',
    flex: 1,
    fontFamily: 'ui-monospace, "Cascadia Code", Menlo, monospace',
    fontSize: 11,
    lineHeight: 1.6,
    margin: 0,
    overflowY: 'auto',
    padding: '10px 12px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
}

const BADGE: React.CSSProperties = {
    background: '#e8f0fe',
    borderRadius: 10,
    color: '#1a56c4',
    display: 'inline-block',
    fontSize: 10,
    fontWeight: 600,
    marginLeft: 6,
    padding: '1px 6px',
}

function PatchList({ patches }: { patches: Array<AppliedPatch> }): ReactElement {
    if (patches.length === 0) {
        return (
            <div
                style={{
                    color: '#999',
                    fontSize: 12,
                    padding: 16,
                    textAlign: 'center',
                }}>
                No patches yet. Apply a proposal to see history.
            </div>
        )
    }

    return (
        <div style={{ flex: 1, overflowY: 'auto' }}>
            {[...patches].reverse().map((p) => (
                <div
                    key={p.id}
                    style={{
                        borderBottom: '1px solid #eee',
                        fontFamily:
                            'ui-monospace, "Cascadia Code", Menlo, monospace',
                        fontSize: 11,
                        padding: '8px 12px',
                    }}>
                    <div
                        style={{
                            alignItems: 'center',
                            display: 'flex',
                            marginBottom: 2,
                        }}>
                        <span style={{ color: '#555', fontWeight: 600 }}>
                            {p.path}
                        </span>
                        <span style={BADGE}>{p.source}</span>
                    </div>
                    <div style={{ color: '#999' }}>
                        <span style={{ color: '#c0392b' }}>
                            {JSON.stringify(p.beforeJson) ?? '—'}
                        </span>
                        {' → '}
                        <span style={{ color: '#27ae60' }}>
                            {JSON.stringify(p.afterJson)}
                        </span>
                    </div>
                    <div style={{ color: '#bbb', marginTop: 2 }}>
                        {new Date(p.createdAt).toLocaleTimeString()}
                    </div>
                </div>
            ))}
        </div>
    )
}

export function StatePanel({
    formData,
    patches,
    proposals,
}: Props): ReactElement {
    const [activeTab, setActiveTab] = useState<StateTab>('formData')

    return (
        <div style={PANEL}>
            <div style={TABS}>
                <button
                    style={tab(activeTab === 'formData')}
                    onClick={() => { setActiveTab('formData'); }}>
                    formData
                </button>
                <button
                    style={tab(activeTab === 'patches')}
                    onClick={() => { setActiveTab('patches'); }}>
                    patches
                    {patches.length > 0 && (
                        <span
                            style={{
                                ...BADGE,
                                background: '#e8f5e9',
                                color: '#2e7d32',
                            }}>
                            {patches.length}
                        </span>
                    )}
                </button>
                <button
                    style={tab(activeTab === 'proposals')}
                    onClick={() => { setActiveTab('proposals'); }}>
                    proposals
                </button>
            </div>

            {activeTab === 'formData' && (
                <pre style={PRE}>{JSON.stringify(formData, null, 2)}</pre>
            )}

            {activeTab === 'patches' && <PatchList patches={patches} />}

            {activeTab === 'proposals' && (
                <pre style={PRE}>{JSON.stringify(proposals, null, 2)}</pre>
            )}
        </div>
    )
}
