// Tests for createInMemoryStore
// Covers all store methods — groups, items, patches, records.
// No mocking needed — pure in-memory operations.

import { describe, expect, test, beforeEach } from 'vitest'
import { createInMemoryStore } from './index.js'
import type { OperatorStore } from '@operator/store'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const recordOwner = { kind: 'record' as const, recordId: 'rec-001' }
const draftOwner  = { kind: 'draft' as const }

const sampleRecord = {
    createdAt: '2025-01-01T00:00:00Z',
    data: { model: 'Latitude 7440' },
    id: 'rec-001',
    schemaId: 'equipment.v1',
    updatedAt: '2025-01-01T00:00:00Z',
}

// ─── records ──────────────────────────────────────────────────────────────────

describe('records', () => {
    let store: OperatorStore

    beforeEach(() => { store = createInMemoryStore() })

    test('load returns null for unknown id', async () => {
        expect(await store.records.load('missing')).toBeNull()
    })

    test('save then load returns the record', async () => {
        await store.records.save(sampleRecord)
        const loaded = await store.records.load('rec-001')
        expect(loaded?.id).toBe('rec-001')
        expect(loaded?.data).toEqual({ model: 'Latitude 7440' })
        expect(loaded?.schemaId).toBe('equipment.v1')
    })

    test('save preserves original createdAt on update', async () => {
        await store.records.save(sampleRecord)
        const first = await store.records.load('rec-001')

        await store.records.save({ ...sampleRecord, data: { model: 'XPS 15' } })
        const second = await store.records.load('rec-001')

        expect(second?.createdAt).toBe(first?.createdAt)
        expect(second?.data).toEqual({ model: 'XPS 15' })
    })

    test('save updates updatedAt on re-save', async () => {
        await store.records.save(sampleRecord)
        const first = await store.records.load('rec-001')

        await new Promise((r) => setTimeout(r, 5))
        await store.records.save({ ...sampleRecord, data: { model: 'XPS 15' } })
        const second = await store.records.load('rec-001')

        expect(second?.updatedAt).not.toBe(first?.updatedAt)
    })

    test('list returns all saved records', async () => {
        await store.records.save(sampleRecord)
        await store.records.save({ ...sampleRecord, id: 'rec-002' })
        const all = await store.records.list?.()
        expect(all).toHaveLength(2)
    })

    test('list returns empty array when no records', async () => {
        const all = await store.records.list?.()
        expect(all).toHaveLength(0)
    })
})

// ─── evidenceGroups ───────────────────────────────────────────────────────────

describe('evidenceGroups', () => {
    let store: OperatorStore

    beforeEach(() => { store = createInMemoryStore() })

    test('create returns group with generated id and timestamps', async () => {
        const group = await store.evidenceGroups.create({
            owner: recordOwner,
            title: 'Photos',
        })
        expect(group.id).toBeTruthy()
        expect(group.title).toBe('Photos')
        expect(group.owner).toEqual(recordOwner)
        expect(group.createdAt).toBeTruthy()
    })

    test('list returns groups for matching record owner', async () => {
        await store.evidenceGroups.create({ owner: recordOwner, title: 'A' })
        await store.evidenceGroups.create({ owner: recordOwner, title: 'B' })
        await store.evidenceGroups.create({
            owner: { kind: 'record', recordId: 'rec-other' },
            title: 'Other',
        })

        const groups = await store.evidenceGroups.list(recordOwner)
        expect(groups).toHaveLength(2)
        expect(groups.map((g) => g.title)).toContain('A')
        expect(groups.map((g) => g.title)).toContain('B')
    })

    test('list returns only draft groups for draft owner', async () => {
        await store.evidenceGroups.create({ owner: draftOwner, title: 'Draft group' })
        await store.evidenceGroups.create({ owner: recordOwner, title: 'Record group' })

        const drafts = await store.evidenceGroups.list(draftOwner)
        expect(drafts).toHaveLength(1)
        expect(drafts[0]?.title).toBe('Draft group')
    })

    test('list returns empty array for owner with no groups', async () => {
        const groups = await store.evidenceGroups.list(recordOwner)
        expect(groups).toHaveLength(0)
    })
})

// ─── evidenceItems ────────────────────────────────────────────────────────────

describe('evidenceItems', () => {
    let store: OperatorStore
    let groupId: string

    beforeEach(async () => {
        store = createInMemoryStore()
        const group = await store.evidenceGroups.create({
            owner: recordOwner,
            title: 'Test group',
        })
        groupId = group.id
    })

    test('create returns item with defaults', async () => {
        const item = await store.evidenceItems.create({
            groupId,
            text: 'Dell Latitude 7440',
            title: 'Asset label',
        })
        expect(item.id).toBeTruthy()
        expect(item.groupId).toBe(groupId)
        expect(item.text).toBe('Dell Latitude 7440')
        expect(item.pinned).toBe(false)
        expect(item.selected).toBe(false)
    })

    test('list returns items for correct group only', async () => {
        const other = await store.evidenceGroups.create({ owner: recordOwner, title: 'Other' })

        await store.evidenceItems.create({ groupId, text: 'A', title: 'A' })
        await store.evidenceItems.create({ groupId, text: 'B', title: 'B' })
        await store.evidenceItems.create({ groupId: other.id, text: 'C', title: 'C' })

        const items = await store.evidenceItems.list(groupId)
        expect(items).toHaveLength(2)
        expect(items.map((i) => i.title)).toContain('A')
        expect(items.map((i) => i.title)).toContain('B')
    })

    test('list returns empty array for group with no items', async () => {
        const items = await store.evidenceItems.list(groupId)
        expect(items).toHaveLength(0)
    })

    test('update patches selected flag', async () => {
        const item = await store.evidenceItems.create({ groupId, text: 'x', title: 'x' })
        const updated = await store.evidenceItems.update?.({
            id: item.id,
            patch: { selected: true },
        })
        expect(updated?.selected).toBe(true)
        expect(updated?.pinned).toBe(false) // unchanged
    })

    test('update patches pinned flag', async () => {
        const item = await store.evidenceItems.create({ groupId, text: 'x', title: 'x' })
        const updated = await store.evidenceItems.update?.({
            id: item.id,
            patch: { pinned: true },
        })
        expect(updated?.pinned).toBe(true)
    })

    test('update preserves id, groupId, createdAt', async () => {
        const item = await store.evidenceItems.create({ groupId, text: 'x', title: 'x' })
        const updated = await store.evidenceItems.update?.({
            id: item.id,
            patch: { selected: true },
        })
        expect(updated?.id).toBe(item.id)
        expect(updated?.groupId).toBe(item.groupId)
        expect(updated?.createdAt).toBe(item.createdAt)
    })

    test('update rejects for unknown id', async () => {
        await expect(
            store.evidenceItems.update?.({ id: 'ghost', patch: { selected: true } }),
        ).rejects.toThrow('EvidenceItem not found')
    })
})

// ─── patches ──────────────────────────────────────────────────────────────────

describe('patches', () => {
    let store: OperatorStore

    beforeEach(() => { store = createInMemoryStore() })

    const makePatch = (path: string, before: unknown, after: unknown) => ({
        afterJson: after as import('@operator/core').JsonValue,
        beforeJson: before as import('@operator/core').JsonValue,
        createdAt: new Date().toISOString(),
        evidenceItemId: 'item-001',
        id: crypto.randomUUID(),
        path,
        recordId: 'rec-001',
        source: 'proposal' as const,
    })

    test('list returns empty array for record with no patches', async () => {
        const patches = await store.patches.list('rec-001')
        expect(patches).toHaveLength(0)
    })

    test('append then list returns patches in order', async () => {
        await store.patches.append(makePatch('/model', null, 'Latitude 7440'))
        await store.patches.append(makePatch('/manufacturer', null, 'Dell'))

        const patches = await store.patches.list('rec-001')
        expect(patches).toHaveLength(2)
        expect(patches[0]?.path).toBe('/model')
        expect(patches[1]?.path).toBe('/manufacturer')
    })

    test('list is scoped to recordId', async () => {
        await store.patches.append(makePatch('/model', null, 'A'))
        await store.patches.append({
            ...makePatch('/model', null, 'B'),
            recordId: 'rec-other',
        })

        expect(await store.patches.list('rec-001')).toHaveLength(1)
        expect(await store.patches.list('rec-other')).toHaveLength(1)
    })

    test('append preserves all patch fields', async () => {
        const patch = makePatch('/status', 'Active', 'In Repair')
        await store.patches.append(patch)
        const [loaded] = await store.patches.list('rec-001')
        expect(loaded?.path).toBe('/status')
        expect(loaded?.beforeJson).toBe('Active')
        expect(loaded?.afterJson).toBe('In Repair')
        expect(loaded?.source).toBe('proposal')
    })
})

// ─── initialState ─────────────────────────────────────────────────────────────

describe('initialState', () => {
    test('accepts pre-seeded records', async () => {
        const store = createInMemoryStore({
            recordsById: new Map([['rec-001', sampleRecord]]),
        })
        const loaded = await store.records.load('rec-001')
        expect(loaded?.id).toBe('rec-001')
    })

    test('accepts pre-seeded evidence groups', async () => {
        const group = {
            createdAt: '2025-01-01T00:00:00Z',
            id: 'grp-001',
            owner: recordOwner,
            title: 'Pre-seeded',
            updatedAt: '2025-01-01T00:00:00Z',
        }
        const store = createInMemoryStore({
            evidenceGroupsById: new Map([['grp-001', group]]),
        })
        const groups = await store.evidenceGroups.list(recordOwner)
        expect(groups).toHaveLength(1)
        expect(groups[0]?.title).toBe('Pre-seeded')
    })
})
