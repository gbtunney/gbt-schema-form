import type {
    EvidenceItem,
    FieldProposal,
    JsonSchemaType,
} from '@operator/core'
import { type ReactElement } from 'react'

export type ProposalsPaneProps = {
    currentData: Record<string, JsonSchemaType>
    evidenceItem: EvidenceItem | null
    loading: boolean
    proposals: Array<FieldProposal>
    onApply: (proposal: FieldProposal) => void
    onApplyAll?: (proposals: Array<FieldProposal>) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function confidenceColor(confidence: FieldProposal['confidence']): string {
    if (confidence === 'High') return '#1a7f37'
    if (confidence === 'Medium') return '#9a6700'
    return '#6e7781'
}

function confidenceBg(confidence: FieldProposal['confidence']): string {
    if (confidence === 'High') return '#dafbe1'
    if (confidence === 'Medium') return '#fff8c5'
    return '#f0f0f0'
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'string') return value
    return JSON.stringify(value)
}

/**
 * Normalise a value for comparison — trims strings, coerces numeric strings. Mirrors normalizePointerValue from
 *
 * @operator/core so filtering stays consistent.
 */
function normalizeForComparison(value: unknown): unknown {
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed === '') return null
        const asNumber = Number(trimmed)
        return Number.isFinite(asNumber) ? asNumber : trimmed
    }
    return value
}

function isAlreadyApplied(
    proposal: FieldProposal,
    currentData: Record<string, JsonSchemaType>,
): boolean {
    const key = proposal.path.replace(/^\//, '')
    const current = currentData[key]
    return (
        JSON.stringify(normalizeForComparison(current)) ===
        JSON.stringify(normalizeForComparison(proposal.value))
    )
}

function getCurrentValue(
    proposal: FieldProposal,
    currentData: Record<string, JsonSchemaType>,
): { isEmpty: boolean; display: string } {
    const key = proposal.path.replace(/^\//, '')
    const current = currentData[key]
    if (current === undefined || current === null || current === '') {
        return { display: 'empty', isEmpty: true }
    }
    return { display: formatValue(current), isEmpty: false }
}

// ─── Empty / loading states ───────────────────────────────────────────────────

function EmptyState({
    allApplied,
    evidenceItem,
}: {
    evidenceItem: EvidenceItem | null
    allApplied: boolean
}): ReactElement {
    if (!evidenceItem) {
        return (
            <div className="proposals-pane__empty">
                <p>Select an evidence item to generate proposals.</p>
            </div>
        )
    }
    if (allApplied) {
        return (
            <div className="proposals-pane__empty proposals-pane__empty--done">
                <span className="proposals-pane__check">✓</span>
                <p>All proposals applied</p>
            </div>
        )
    }
    return (
        <div className="proposals-pane__empty">
            <p>No proposals generated.</p>
            <p className="proposals-pane__hint">
                The evidence may not contain recognisable fields for this
                schema.
            </p>
        </div>
    )
}

// ─── Proposal card ────────────────────────────────────────────────────────────

function ProposalCard({
    currentData,
    onApply,
    proposal,
}: {
    proposal: FieldProposal
    currentData: Record<string, JsonSchemaType>
    onApply: (proposal: FieldProposal) => void
}): ReactElement {
    const { display, isEmpty } = getCurrentValue(proposal, currentData)

    return (
        <div className="proposal-card">
            <div className="proposal-card__header">
                <code className="proposal-card__path">{proposal.path}</code>
                <span
                    className="proposal-card__confidence"
                    style={{
                        background: confidenceBg(proposal.confidence),
                        color: confidenceColor(proposal.confidence),
                    }}>
                    {proposal.confidence}
                </span>
            </div>

            <div className="proposal-card__value">
                {formatValue(proposal.value)}
            </div>

            {proposal.excerpt && (
                <blockquote className="proposal-card__excerpt">
                    {proposal.excerpt}
                </blockquote>
            )}

            <div className="proposal-card__footer">
                <span
                    className={`proposal-card__current${isEmpty ? ' proposal-card__current--empty' : ''}`}>
                    {isEmpty ? 'field is empty' : `currently: ${display}`}
                </span>
                <button
                    className="proposal-card__apply"
                    onClick={() => {
                        onApply(proposal)
                    }}
                    title={`Apply: ${formatValue(proposal.value)}`}
                    type="button">
                    Apply →
                </button>
            </div>
        </div>
    )
}

// ─── ProposalsPane ────────────────────────────────────────────────────────────

/**
 * Shows FieldProposals generated from the selected evidence item.
 *
 * - Filters out proposals already matching current form data
 * - Shows apply arrows per proposal + optional "Apply all" bulk action
 * - Handles loading / empty / all-applied states cleanly
 */
export function ProposalsPane({
    currentData,
    evidenceItem,
    loading,
    onApply,
    onApplyAll,
    proposals,
}: ProposalsPaneProps): ReactElement {
    const visible = proposals.filter((p) => !isAlreadyApplied(p, currentData))
    const allApplied = proposals.length > 0 && visible.length === 0
    const showEmpty = !loading && (visible.length === 0 || !evidenceItem)

    return (
        <div className="proposals-pane">
            <div className="proposals-pane__header">
                <h3>Proposals</h3>
                {evidenceItem && (
                    <span className="proposals-pane__source">
                        {evidenceItem.title}
                    </span>
                )}
            </div>

            <div className="proposals-pane__body">
                {loading && (
                    <div className="proposals-pane__loading">
                        <span className="proposals-pane__spinner" />
                        Generating…
                    </div>
                )}

                {showEmpty && (
                    <EmptyState
                        evidenceItem={evidenceItem}
                        allApplied={allApplied}
                    />
                )}

                {!loading && visible.length > 0 && (
                    <>
                        {onApplyAll && visible.length > 1 && (
                            <button
                                className="proposals-pane__apply-all"
                                onClick={() => {
                                    onApplyAll(visible)
                                }}
                                type="button">
                                Apply all ({visible.length})
                            </button>
                        )}

                        {visible.map((proposal) => (
                            <ProposalCard
                                key={proposal.id}
                                currentData={currentData}
                                proposal={proposal}
                                onApply={onApply}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}
