import type { EvidenceGroup, EvidenceItem, EvidenceOwner } from '@operator/core'
import type { OperatorStore } from '@operator/store'
import { type ReactElement, useCallback, useEffect, useState } from 'react'

export type EvidencePaneProps = {
    owner: EvidenceOwner
    store: OperatorStore
    onItemSelect?: (item: EvidenceItem) => void
}

/** Evidence management panel. Lists evidence groups for an owner, allows creating groups and adding text evidence items. */
export function EvidencePane({
    onItemSelect,
    owner,
    store,
}: EvidencePaneProps): ReactElement {
    const [groups, setGroups] = useState<Array<EvidenceGroup>>([])
    const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null)
    const [itemsByGroup, setItemsByGroup] = useState<
        Record<string, Array<EvidenceItem>>
    >({})
    const [newGroupTitle, setNewGroupTitle] = useState('')
    const [newItemTitle, setNewItemTitle] = useState('')
    const [newItemText, setNewItemText] = useState('')

    /** Load evidence groups when owner changes */
    useEffect(() => {
        void store.evidenceGroups.list(owner).then(setGroups)
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
    }, [store, owner, newGroupTitle])

    const handleCreateItem = useCallback(async () => {
        if (!expandedGroupId || !newItemTitle.trim() || !newItemText.trim())
            return
        const item = await store.evidenceItems.create({
            groupId: expandedGroupId,
            text: newItemText.trim(),
            title: newItemTitle.trim(),
        })
        setItemsByGroup((prev) => ({
            ...prev,
            [expandedGroupId]: [...(prev[expandedGroupId] ?? []), item],
        }))
        setNewItemTitle('')
        setNewItemText('')
    }, [store, expandedGroupId, newItemTitle, newItemText])

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

    return (
        <div className="evidence-pane">
            <div className="evidence-pane__header">
                <h3>Evidence</h3>
            </div>

            {/* Group list */}
            <div className="evidence-pane__groups">
                {groups.map((group) => (
                    <div key={group.id} className="evidence-group">
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
                                {expandedGroupId === group.id
                                    ? '\u25BC'
                                    : '\u25B6'}
                            </span>
                            <span className="evidence-group__title">
                                {group.title}
                            </span>
                            <span className="evidence-group__count">
                                {(itemsByGroup[group.id] ?? []).length}
                            </span>
                        </button>

                        {/* Items for expanded group */}
                        {expandedGroupId === group.id && (
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
                                                    {item.pinned
                                                        ? '\u2605'
                                                        : '\u2606'}
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
                                                            : 'Select'
                                                    }
                                                    type="button">
                                                    {item.selected
                                                        ? '\u2713'
                                                        : '\u25CB'}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="evidence-item__text">
                                            {item.text}
                                        </p>
                                    </div>
                                ))}

                                {/* Add evidence item form */}
                                <div className="evidence-pane__add-item">
                                    <input
                                        className="evidence-pane__input"
                                        onChange={(event) => {
                                            setNewItemTitle(event.target.value)
                                        }}
                                        placeholder="Evidence title..."
                                        type="text"
                                        value={newItemTitle}
                                    />
                                    <textarea
                                        className="evidence-pane__textarea"
                                        onChange={(event) => {
                                            setNewItemText(event.target.value)
                                        }}
                                        placeholder="Paste or type evidence text..."
                                        rows={3}
                                        value={newItemText}
                                    />
                                    <button
                                        className="evidence-pane__btn"
                                        disabled={
                                            !newItemTitle.trim() ||
                                            !newItemText.trim()
                                        }
                                        onClick={() => void handleCreateItem()}
                                        type="button">
                                        + Add Evidence
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add group form */}
            <div className="evidence-pane__add-group">
                <input
                    className="evidence-pane__input"
                    onChange={(event) => {
                        setNewGroupTitle(event.target.value)
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') void handleCreateGroup()
                    }}
                    placeholder="New group name..."
                    type="text"
                    value={newGroupTitle}
                />
                <button
                    className="evidence-pane__btn"
                    disabled={!newGroupTitle.trim()}
                    onClick={() => void handleCreateGroup()}
                    type="button">
                    + New Group
                </button>
            </div>
        </div>
    )
}
