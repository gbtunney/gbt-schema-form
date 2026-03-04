import type { EvidenceGroup, EvidenceItem, EvidenceOwner } from '@operator/core'
import type { OperatorStore } from '@operator/store'
import { type ReactElement, useCallback, useEffect, useState } from 'react'
import { VoiceRecordButton } from './VoiceRecordButton.tsx'

export type EvidencePaneProps = {
    owner: EvidenceOwner
    store: OperatorStore
    /** Pass to enable real Whisper transcription, e.g. "http://localhost:3001". Omit for mock mode. */
    transcribeUrl?: string
    onItemSelect?: (item: EvidenceItem) => void
}

/** Generate a short human-readable timestamp title e.g. "Note 14:32" */
function autoTitle(): string {
    return `Note ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

const DEFAULT_GROUP_TITLE = 'Notes'

/** Evidence management panel. */
export function EvidencePane({
    onItemSelect,
    owner,
    store,
    transcribeUrl,
}: EvidencePaneProps): ReactElement {
    const [groups, setGroups] = useState<Array<EvidenceGroup>>([])
    const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null)
    const [itemsByGroup, setItemsByGroup] = useState<
        Record<string, Array<EvidenceItem>>
    >({})
    const [newGroupTitle, setNewGroupTitle] = useState('')
    const [newItemText, setNewItemText] = useState('')
    const [showAddGroup, setShowAddGroup] = useState(false)

    /** Load groups. If none exist, auto-create a default group and expand it. */
    useEffect(() => {
        void store.evidenceGroups.list(owner).then(async (loaded) => {
            if (loaded.length === 0) {
                const defaultGroup = await store.evidenceGroups.create({
                    owner,
                    title: DEFAULT_GROUP_TITLE,
                })
                setGroups([defaultGroup])
                setExpandedGroupId(defaultGroup.id)
            } else {
                setGroups(loaded)
                // Auto-expand if there's only one group
                if (loaded.length === 1 && loaded[0]) {
                    setExpandedGroupId(loaded[0].id)
                }
            }
        })
    }, [store, owner])

    /** Load items when a group is expanded */
    useEffect(() => {
        if (expandedGroupId) {
            void store.evidenceItems
                .list(expandedGroupId)
                .then((loadedItems: Array<EvidenceItem>) => {
                    setItemsByGroup((prev) => ({
                        ...prev,
                        [expandedGroupId]: loadedItems,
                    }))
                })
        }
    }, [store, expandedGroupId])

    const handleCreateGroup = useCallback(async () => {
        const trimmed = newGroupTitle.trim()
        if (!trimmed) return
        const group = await store.evidenceGroups.create({
            owner,
            title: trimmed,
        })
        setGroups((prev) => [...prev, group])
        setNewGroupTitle('')
        setExpandedGroupId(group.id)
        setShowAddGroup(false)
    }, [store, owner, newGroupTitle])

    const handleCreateItem = useCallback(async () => {
        if (!expandedGroupId || !newItemText.trim()) return
        const item = await store.evidenceItems.create({
            groupId: expandedGroupId,
            text: newItemText.trim(),
            title: autoTitle(),
        })
        setItemsByGroup((prev) => ({
            ...prev,
            [expandedGroupId]: [...(prev[expandedGroupId] ?? []), item],
        }))
        setNewItemText('')
    }, [store, expandedGroupId, newItemText])

    const handleTogglePin = useCallback(
        async (item: EvidenceItem) => {
            if (!store.evidenceItems.update) return
            const updated = await store.evidenceItems.update({
                id: item.id,
                patch: { pinned: !item.pinned },
            })
            setItemsByGroup((prev) => ({
                ...prev,
                [item.groupId]: (prev[item.groupId] ?? []).map((existing) =>
                    existing.id === updated.id ? updated : existing,
                ),
            }))
        },
        [store],
    )

    const handleToggleSelect = useCallback(
        async (item: EvidenceItem) => {
            if (!store.evidenceItems.update) return
            const updated = await store.evidenceItems.update({
                id: item.id,
                patch: { selected: !item.selected },
            })
            setItemsByGroup((prev) => ({
                ...prev,
                [item.groupId]: (prev[item.groupId] ?? []).map((existing) =>
                    existing.id === updated.id ? updated : existing,
                ),
            }))
            if (updated.selected && onItemSelect) {
                onItemSelect(updated)
            }
        },
        [store, onItemSelect],
    )

    const currentItems = expandedGroupId
        ? (itemsByGroup[expandedGroupId] ?? [])
        : []
    const hasMultipleGroups = groups.length > 1

    return (
        <div className="evidence-pane">
            <div className="evidence-pane__header">
                <h3>Evidence</h3>
                {/* Only show "New Group" button when there are already groups */}
                {groups.length > 0 && (
                    <button
                        className="evidence-pane__header-btn"
                        onClick={() => {
                            setShowAddGroup((prev) => !prev)
                        }}
                        title="Add group"
                        type="button">
                        + Group
                    </button>
                )}
            </div>

            {/* Add group form — shown inline when triggered, or when no groups exist */}
            {showAddGroup && (
                <div className="evidence-pane__add-group">
                    <input
                        autoFocus
                        className="evidence-pane__input"
                        onChange={(event) => {
                            setNewGroupTitle(event.target.value)
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') void handleCreateGroup()
                            if (event.key === 'Escape') setShowAddGroup(false)
                        }}
                        placeholder="Group name..."
                        type="text"
                        value={newGroupTitle}
                    />
                    <div className="evidence-pane__add-group-actions">
                        <button
                            className="evidence-pane__btn"
                            disabled={!newGroupTitle.trim()}
                            onClick={() => void handleCreateGroup()}
                            type="button">
                            Add
                        </button>
                        <button
                            className="evidence-pane__btn evidence-pane__btn--ghost"
                            onClick={() => {
                                setShowAddGroup(false)
                                setNewGroupTitle('')
                            }}
                            type="button">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Group list — only show toggle headers when there are multiple groups */}
            <div className="evidence-pane__groups">
                {groups.map((group) => (
                    <div key={group.id} className="evidence-group">
                        {/* Only render the toggle header when there are multiple groups */}
                        {hasMultipleGroups && (
                            <button
                                className={`evidence-group__toggle ${expandedGroupId === group.id ? 'evidence-group__toggle--active' : ''}`}
                                onClick={() => {
                                    setExpandedGroupId(
                                        expandedGroupId === group.id
                                            ? null
                                            : group.id,
                                    )
                                }}
                                type="button">
                                <span className="evidence-group__arrow">
                                    {expandedGroupId === group.id ? '▼' : '▶'}
                                </span>
                                <span className="evidence-group__title">
                                    {group.title}
                                </span>
                                <span className="evidence-group__count">
                                    {(itemsByGroup[group.id] ?? []).length}
                                </span>
                            </button>
                        )}

                        {/* Items — always visible for single group, collapsible for multiple */}
                        {(expandedGroupId === group.id ||
                            !hasMultipleGroups) && (
                            <div className="evidence-group__items">
                                {currentItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`evidence-item ${item.selected ? 'evidence-item--selected' : ''}`}>
                                        <div className="evidence-item__header">
                                            <span className="evidence-item__title">
                                                {item.title}
                                            </span>
                                            <div className="evidence-item__actions">
                                                <button
                                                    className={`evidence-item__btn ${item.pinned ? 'evidence-item__btn--active' : ''}`}
                                                    onClick={() =>
                                                        void handleTogglePin(
                                                            item,
                                                        )
                                                    }
                                                    title={
                                                        item.pinned
                                                            ? 'Unpin'
                                                            : 'Pin'
                                                    }
                                                    type="button">
                                                    {item.pinned ? '★' : '☆'}
                                                </button>
                                                <button
                                                    className={`evidence-item__btn ${item.selected ? 'evidence-item__btn--active' : ''}`}
                                                    onClick={() =>
                                                        void handleToggleSelect(
                                                            item,
                                                        )
                                                    }
                                                    title={
                                                        item.selected
                                                            ? 'Deselect'
                                                            : 'Select to generate proposals'
                                                    }
                                                    type="button">
                                                    {item.selected ? '✓' : '○'}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="evidence-item__text">
                                            {item.text}
                                        </p>
                                    </div>
                                ))}

                                {/* Quick-add: just paste text, title is auto-generated */}
                                <div className="evidence-pane__add-item">
                                    <textarea
                                        className="evidence-pane__textarea"
                                        onChange={(event) => {
                                            setNewItemText(event.target.value)
                                        }}
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === 'Enter' &&
                                                (event.metaKey || event.ctrlKey)
                                            ) {
                                                void handleCreateItem()
                                            }
                                        }}
                                        placeholder="Paste or type evidence text… (⌘↵ to add)"
                                        rows={4}
                                        value={newItemText}
                                    />
                                    <button
                                        className="evidence-pane__btn"
                                        disabled={!newItemText.trim()}
                                        onClick={() => void handleCreateItem()}
                                        type="button">
                                        + Add
                                    </button>

                                    <div className="evidence-pane__divider">
                                        or
                                    </div>

                                    <VoiceRecordButton
                                        groupId={expandedGroupId ?? group.id}
                                        owner={owner}
                                        store={store}
                                        transcribeUrl={transcribeUrl}
                                        onCreated={() => {
                                            void store.evidenceItems
                                                .list(group.id)
                                                .then((loaded) => {
                                                    setItemsByGroup((prev) => ({
                                                        ...prev,
                                                        [group.id]: loaded,
                                                    }))
                                                })
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
