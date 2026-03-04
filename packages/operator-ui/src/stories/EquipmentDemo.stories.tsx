/**
 * Equipment Demo Stories
 *
 * Shows the OperatorEditor wired with a mock ProposalClient typed to the equipment schema. Each story represents a
 * realistic scenario:
 *
 * - AssetLabelScan — OCR from a physical asset tag
 * - PurchaseOrderText — pasted PO description
 * - VoiceNote — transcribed audio note from a field tech
 * - EmptyNewRecord — blank record, no pre-existing data
 * - PreFilledWithGaps — record with some fields filled, evidence fills the rest
 *
 * The mock proposalClient simulates realistic latency (~800ms) and returns proposals typed to the equipment schema's
 * field paths.
 *
 * In production, swap mockProposalClient for createProposalClient(ctx) from @operator/api-client — same ProposalClient
 * signature, real OpenAI backend.
 */

import { createInMemoryStore } from '@operator/adapter-local'
import type { FieldProposal } from '@operator/core'
import type {
    JsonSchema,
    ProposalClient,
    SchemaResolver,
} from '@operator/store'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { OperatorEditor } from '../components/OperatorEditor.tsx'

// ─── Equipment Schema ─────────────────────────────────────────────────────────
// Mirrored in @domain/schemas/equipment.v1 — kept inline here so stories are
// fully self-contained and don't require the domain package at dev time.

const equipmentSchema = {
    properties: {
        category: {
            enum: [
                'Laptop',
                'Monitor',
                'Phone',
                'Printer',
                'Server',
                'Network',
                'Other',
            ],
            title: 'Category',
            type: 'string',
        },
        location: { title: 'Location', type: 'string' },
        manufacturer: { title: 'Manufacturer', type: 'string' },
        model: { title: 'Model', type: 'string' },
        notes: { title: 'Notes', type: 'string' },
        purchaseDate: {
            format: 'date',
            title: 'Purchase Date',
            type: 'string',
        },
        serialNumber: { title: 'Serial Number', type: 'string' },
        status: {
            enum: ['Active', 'In Repair', 'Retired', 'In Storage'],
            title: 'Status',
            type: 'string',
        },
        warrantyExpiry: {
            format: 'date',
            title: 'Warranty Expiry',
            type: 'string',
        },
    },
    required: ['serialNumber', 'category'],
    title: 'Equipment Record',
    type: 'object',
} as const

const mockSchemaResolver: SchemaResolver = async (schemaId) =>
    Promise.resolve({ jsonSchema: equipmentSchema as JsonSchema, schemaId })

// ─── Typed proposal factory ───────────────────────────────────────────────────
// Valid pointer paths for this schema — the typed factory (operator-core/proposal/typed.ts)
// would infer these from the Zod schema at compile time. Here we assert them manually
// so the story is standalone.

type EquipmentPath =
    | '/serialNumber'
    | '/manufacturer'
    | '/model'
    | '/category'
    | '/status'
    | '/location'
    | '/purchaseDate'
    | '/warrantyExpiry'
    | '/notes'

type EquipmentProposal = FieldProposal & { path: EquipmentPath }

/** Helper to build mock proposals cleanly */
function proposal(
    path: EquipmentPath,
    value: string,
    confidence: FieldProposal['confidence'],
    excerpt: string,
    evidenceItemId: string,
): EquipmentProposal {
    return {
        confidence,
        evidenceItemId,
        excerpt,
        id: crypto.randomUUID(),
        path,
        value,
    }
}

// ─── Mock ProposalClient ──────────────────────────────────────────────────────
// Each evidence item id maps to a set of realistic proposals.
// In production this is replaced by createProposalClient(ctx) from @operator/api-client.

type ProposalScenario = Record<string, Array<EquipmentProposal>>

function createMockProposalClient(scenarios: ProposalScenario): ProposalClient {
    return async ({ evidenceItem }) => {
        // Simulate realistic LLM latency
        await new Promise((r) => setTimeout(r, 700 + Math.random() * 500))
        return scenarios[evidenceItem.id] ?? []
    }
}

// ─── Story 1: Asset Label Scan ────────────────────────────────────────────────

const assetLabelStore = (() => {
    const recordId = 'rec-scan-001'
    const groupId = 'grp-scan-001'
    const itemId = 'item-label'

    return createInMemoryStore({
        evidenceGroupsById: new Map([
            [
                groupId,
                {
                    createdAt: '2025-02-10T09:00:00Z',
                    id: groupId,
                    owner: { kind: 'record', recordId },
                    title: 'Asset Tag Scan',
                    updatedAt: '2025-02-10T09:00:00Z',
                },
            ],
        ]),
        evidenceItemsById: new Map([
            [
                itemId,
                {
                    createdAt: '2025-02-10T09:01:00Z',
                    groupId,
                    id: itemId,
                    pinned: true,
                    selected: false,
                    text: [
                        'DELL TECHNOLOGIES',
                        'Model: Latitude 7440',
                        'S/N: DLAT-2025-7791',
                        'Service Tag: 8XK29F',
                        'Manufactured: 2024-11',
                        'Country of Origin: China',
                        'FCC ID: GXB-E8521',
                    ].join('\n'),
                    title: 'Asset tag (OCR)',
                    updatedAt: '2025-02-10T09:01:00Z',
                },
            ],
        ]),
        recordsById: new Map([
            [
                recordId,
                {
                    createdAt: '2025-02-10T09:00:00Z',
                    data: {},
                    id: recordId,
                    schemaId: 'equipment.v1',
                    updatedAt: '2025-02-10T09:00:00Z',
                },
            ],
        ]),
    })
})()

const assetLabelProposals = createMockProposalClient({
    'item-label': [
        proposal(
            '/manufacturer',
            'Dell',
            'High',
            'DELL TECHNOLOGIES',
            'item-label',
        ),
        proposal(
            '/model',
            'Latitude 7440',
            'High',
            'Model: Latitude 7440',
            'item-label',
        ),
        proposal(
            '/serialNumber',
            'DLAT-2025-7791',
            'High',
            'S/N: DLAT-2025-7791',
            'item-label',
        ),
        proposal('/category', 'Laptop', 'High', 'Latitude 7440', 'item-label'),
        proposal(
            '/purchaseDate',
            '2024-11-01',
            'Medium',
            'Manufactured: 2024-11',
            'item-label',
        ),
        proposal('/status', 'Active', 'Low', '', 'item-label'),
    ],
})

// ─── Story 2: Purchase Order text ─────────────────────────────────────────────

const poStore = (() => {
    const recordId = 'rec-po-001'
    const groupId = 'grp-po-001'
    const itemId = 'item-po'

    return createInMemoryStore({
        evidenceGroupsById: new Map([
            [
                groupId,
                {
                    createdAt: '2025-02-12T10:00:00Z',
                    id: groupId,
                    owner: { kind: 'record', recordId },
                    title: 'Purchase Order',
                    updatedAt: '2025-02-12T10:00:00Z',
                },
            ],
        ]),
        evidenceItemsById: new Map([
            [
                itemId,
                {
                    createdAt: '2025-02-12T10:01:00Z',
                    groupId,
                    id: itemId,
                    pinned: false,
                    selected: false,
                    text: [
                        'PO # 2025-04821',
                        'Vendor: CDW Direct LLC',
                        'Ship-to: Floor 4, Server Room B',
                        '',
                        'Line Items:',
                        '  1x HP ProLiant DL380 Gen11',
                        '     Part: P52562-B21',
                        '     Serial: HPE-SRV-2025-00X9',
                        '     Unit Price: $9,450.00',
                        '',
                        'Warranty: 3yr HPE Foundation Care',
                        'Warranty Expires: 2028-03-15',
                        'Purchase Date: 2025-03-15',
                    ].join('\n'),
                    title: 'PO-2025-04821.txt',
                    updatedAt: '2025-02-12T10:01:00Z',
                },
            ],
        ]),
        recordsById: new Map([
            [
                recordId,
                {
                    createdAt: '2025-02-12T10:00:00Z',
                    data: {},
                    id: recordId,
                    schemaId: 'equipment.v1',
                    updatedAt: '2025-02-12T10:00:00Z',
                },
            ],
        ]),
    })
})()

const poProposals = createMockProposalClient({
    'item-po': [
        proposal(
            '/manufacturer',
            'HP',
            'High',
            'HP ProLiant DL380 Gen11',
            'item-po',
        ),
        proposal(
            '/model',
            'ProLiant DL380 Gen11',
            'High',
            'HP ProLiant DL380 Gen11',
            'item-po',
        ),
        proposal(
            '/serialNumber',
            'HPE-SRV-2025-00X9',
            'High',
            'Serial: HPE-SRV-2025-00X9',
            'item-po',
        ),
        proposal('/category', 'Server', 'High', 'HP ProLiant DL380', 'item-po'),
        proposal(
            '/location',
            'Floor 4, Server Room B',
            'High',
            'Ship-to: Floor 4, Server Room B',
            'item-po',
        ),
        proposal(
            '/purchaseDate',
            '2025-03-15',
            'High',
            'Purchase Date: 2025-03-15',
            'item-po',
        ),
        proposal(
            '/warrantyExpiry',
            '2028-03-15',
            'High',
            'Warranty Expires: 2028-03-15',
            'item-po',
        ),
        proposal('/status', 'Active', 'Medium', '', 'item-po'),
    ],
})

// ─── Story 3: Voice Note ──────────────────────────────────────────────────────

const voiceNoteStore = (() => {
    const recordId = 'rec-voice-001'
    const groupId = 'grp-voice-001'
    const itemId = 'item-voice'

    return createInMemoryStore({
        evidenceGroupsById: new Map([
            [
                groupId,
                {
                    createdAt: '2025-02-14T14:00:00Z',
                    id: groupId,
                    owner: { kind: 'record', recordId },
                    title: 'Field Tech Notes',
                    updatedAt: '2025-02-14T14:00:00Z',
                },
            ],
        ]),
        evidenceItemsById: new Map([
            [
                itemId,
                {
                    createdAt: '2025-02-14T14:01:00Z',
                    groupId,
                    id: itemId,
                    pinned: false,
                    selected: false,
                    text: [
                        'Transcribed voice note — field tech Maya R., 14 Feb 2025:',
                        '',
                        '"So I\'m in the comms room on level two, found a Cisco switch,',
                        'looks like a Catalyst 9300 series. The label on the back says',
                        "serial CSC93-2024-881X. It's been sitting in a rack unpowered,",
                        'probably been in storage since we did the network refresh.',
                        'Warranty sticker says expires June 2026.',
                        'I\'d put it as In Storage for now until we decide what to do with it."',
                    ].join('\n'),
                    title: 'Voice note (Whisper transcript)',
                    updatedAt: '2025-02-14T14:01:00Z',
                },
            ],
        ]),
        recordsById: new Map([
            [
                recordId,
                {
                    createdAt: '2025-02-14T14:00:00Z',
                    data: {},
                    id: recordId,
                    schemaId: 'equipment.v1',
                    updatedAt: '2025-02-14T14:00:00Z',
                },
            ],
        ]),
    })
})()

const voiceNoteProposals = createMockProposalClient({
    'item-voice': [
        proposal(
            '/manufacturer',
            'Cisco',
            'High',
            'a Cisco switch',
            'item-voice',
        ),
        proposal(
            '/model',
            'Catalyst 9300',
            'Medium',
            'looks like a Catalyst 9300 series',
            'item-voice',
        ),
        proposal(
            '/serialNumber',
            'CSC93-2024-881X',
            'High',
            'serial CSC93-2024-881X',
            'item-voice',
        ),
        proposal('/category', 'Network', 'High', 'Cisco switch', 'item-voice'),
        proposal(
            '/location',
            'Level 2 - Comms Room',
            'High',
            'comms room on level two',
            'item-voice',
        ),
        proposal(
            '/status',
            'In Storage',
            'High',
            "I'd put it as In Storage for now",
            'item-voice',
        ),
        proposal(
            '/warrantyExpiry',
            '2026-06-01',
            'Medium',
            'Warranty sticker says expires June 2026',
            'item-voice',
        ),
    ],
})

// ─── Story 4: Pre-filled with gaps ───────────────────────────────────────────

const preFilledStore = (() => {
    const recordId = 'rec-gap-001'
    const groupId = 'grp-gap-001'
    const itemId = 'item-spec-sheet'

    return createInMemoryStore({
        evidenceGroupsById: new Map([
            [
                groupId,
                {
                    createdAt: '2025-01-20T11:00:00Z',
                    id: groupId,
                    owner: { kind: 'record', recordId },
                    title: 'Spec Sheet',
                    updatedAt: '2025-01-20T11:00:00Z',
                },
            ],
        ]),
        evidenceItemsById: new Map([
            [
                itemId,
                {
                    createdAt: '2025-01-20T11:01:00Z',
                    groupId,
                    id: itemId,
                    pinned: false,
                    selected: false,
                    text: [
                        'Apple MacBook Pro 16-inch (M3 Pro)',
                        'Color: Space Black',
                        'Serial Number: C02ZX1ABCD12',
                        'Configuration: 18GB RAM / 512GB SSD',
                        'AppleCare+ expires: 2027-02-28',
                        'Assigned to: Engineering — Desk E-14',
                    ].join('\n'),
                    title: 'MacBook spec sheet',
                    updatedAt: '2025-01-20T11:01:00Z',
                },
            ],
        ]),
        recordsById: new Map([
            [
                recordId,
                {
                    createdAt: '2025-01-20T10:00:00Z',
                    // Record has some fields pre-filled but missing serial, location, warranty
                    data: {
                        category: 'Laptop',
                        manufacturer: 'Apple',
                        model: 'MacBook Pro 16',
                        status: 'Active',
                    },
                    id: recordId,
                    schemaId: 'equipment.v1',
                    updatedAt: '2025-01-20T10:00:00Z',
                },
            ],
        ]),
    })
})()

const preFilledProposals = createMockProposalClient({
    'item-spec-sheet': [
        // manufacturer + model already match — will be filtered by ProposalsPane (already applied)
        proposal(
            '/manufacturer',
            'Apple',
            'High',
            'Apple MacBook Pro',
            'item-spec-sheet',
        ),
        proposal(
            '/model',
            'MacBook Pro 16-inch (M3 Pro)',
            'High',
            'Apple MacBook Pro 16-inch (M3 Pro)',
            'item-spec-sheet',
        ),
        // These are new — will show up as proposals
        proposal(
            '/serialNumber',
            'C02ZX1ABCD12',
            'High',
            'Serial Number: C02ZX1ABCD12',
            'item-spec-sheet',
        ),
        proposal(
            '/location',
            'Engineering - Desk E-14',
            'High',
            'Assigned to: Engineering — Desk E-14',
            'item-spec-sheet',
        ),
        proposal(
            '/warrantyExpiry',
            '2027-02-28',
            'High',
            'AppleCare+ expires: 2027-02-28',
            'item-spec-sheet',
        ),
        proposal(
            '/notes',
            '18GB RAM / 512GB SSD, Space Black',
            'Medium',
            'Configuration: 18GB RAM / 512GB SSD',
            'item-spec-sheet',
        ),
    ],
})

// ─── Story meta ───────────────────────────────────────────────────────────────

const meta = {
    component: OperatorEditor,
    parameters: { layout: 'fullscreen' },
    title: 'Equipment/OperatorEditor',
} satisfies Meta<typeof OperatorEditor>

export default meta
type Story = StoryObj<typeof meta>

// ─── Stories ──────────────────────────────────────────────────────────────────

/**
 * Asset label scanned via OCR. Select the evidence item → proposals populate from the label text. Apply arrows fill the
 * form fields.
 */
export const AssetLabelScan: Story = {
    args: {
        proposalClient: assetLabelProposals,
        recordId: 'rec-scan-001',
        schemaId: 'equipment.v1',
        schemaResolver: mockSchemaResolver,
        store: assetLabelStore,
    },
}

/** Purchase order pasted as text. Rich evidence — serial, location, purchase date and warranty all extractable. */
export const PurchaseOrderText: Story = {
    args: {
        proposalClient: poProposals,
        recordId: 'rec-po-001',
        schemaId: 'equipment.v1',
        schemaResolver: mockSchemaResolver,
        store: poStore,
    },
}

/**
 * Transcribed voice note from a field technician. Demonstrates that proposals work on unstructured, conversational
 * text. Confidence is mixed — some fields are clear, others are inferred.
 */
export const VoiceNote: Story = {
    args: {
        proposalClient: voiceNoteProposals,
        recordId: 'rec-voice-001',
        schemaId: 'equipment.v1',
        schemaResolver: mockSchemaResolver,
        store: voiceNoteStore,
    },
}

/**
 * Record already partially filled. The ProposalsPane filters out proposals whose values already match current data —
 * only the genuinely new/missing fields show apply arrows.
 */
export const PreFilledWithGaps: Story = {
    args: {
        proposalClient: preFilledProposals,
        recordId: 'rec-gap-001',
        schemaId: 'equipment.v1',
        schemaResolver: mockSchemaResolver,
        store: preFilledStore,
    },
}

/**
 * Blank record with no pre-existing data. Shows the empty state of the proposals pane before an evidence item is
 * selected.
 */
export const EmptyNewRecord: Story = {
    args: {
        proposalClient: createMockProposalClient({}),
        schemaId: 'equipment.v1',
        schemaResolver: mockSchemaResolver,
        store: createInMemoryStore(),
    },
}
