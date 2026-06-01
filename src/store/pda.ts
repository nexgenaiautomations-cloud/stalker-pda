import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Tab = 'map' | 'tasks' | 'contacts' | 'messages' | 'journal' | 'radio' | 'stats' | 'settings'

export type Faction =
  | 'loner' | 'duty' | 'freedom' | 'bandit' | 'mercs'
  | 'military' | 'monolith' | 'ecologist' | 'clear-sky' | 'sin'

export type Rank = 'rookie' | 'experienced' | 'veteran' | 'master' | 'legend'

export type Anomaly = 'electro' | 'fruit_punch' | 'whirligig' | 'burner' | 'comet' | 'springboard'

export interface LatLng { lat: number; lng: number }

export interface Task {
  id: string
  title: string
  giver: string         // contact id
  faction: Faction
  description: string
  reward: string
  target: LatLng | null
  status: 'active' | 'completed' | 'failed'
  tracked: boolean
  createdAt: number
}

export interface Contact {
  id: string
  callsign: string
  realName?: string
  faction: Faction
  rank: Rank
  location: string
  relationship: 'friendly' | 'neutral' | 'hostile'
  position: LatLng | null
  bio: string
  online: boolean
}

export interface PdaMessage {
  id: string
  from: string          // contact id or 'self' or remote pda id
  to: string            // contact id or 'self'
  text: string
  ts: number
  read: boolean
  remote?: boolean      // came from another browser tab/PDA
}

export interface JournalEntry {
  id: string
  type: 'note' | 'log' | 'rumor' | 'discovery'
  title: string
  body: string
  ts: number
  pinned: boolean
  location?: LatLng | null
}

export type MarkerKind =
  | 'anomaly' | 'stash' | 'camp' | 'trader' | 'hot' | 'extraction'
  | 'person'  | 'poi'

export interface MapMarker {
  id: string
  kind: MarkerKind
  label: string
  position: LatLng
  detail?: string
  anomaly?: Anomaly
  custom?: boolean       // user-created (editable/deletable)
  createdAt?: number
}

export interface RadioStation {
  id: string
  freq: string
  name: string
  faction?: Faction
  description: string
}

export interface PlayerState {
  callsign: string
  faction: Faction
  rank: Rank
  reputation: number      // -1000..+1000
  position: LatLng
  heading: number         // degrees
  zoneName: string
  health: number          // 0..100
  stamina: number
  radiation: number
  hunger: number
  thirst: number
  sleep: number
  bleeding: number
  psy: number
  rubles: number
}

export interface PdaState {
  // shell
  tab: Tab
  booted: boolean
  pdaId: string           // unique id of this PDA instance
  // data
  player: PlayerState
  tasks: Task[]
  contacts: Contact[]
  messages: PdaMessage[]
  journal: JournalEntry[]
  markers: MapMarker[]
  customMarkers: MapMarker[]
  stations: RadioStation[]
  // ui
  selectedTaskId: string | null
  selectedContactId: string | null
  selectedMarkerId: string | null
  activeStationId: string | null
  mapFilters: Record<string, boolean>
  composeTo: string | null
  knownPdas: Record<string, { callsign: string; faction: Faction; lastSeen: number }>
  mapFocus: { position: LatLng; zoom?: number } | null
  // actions
  setTab: (t: Tab) => void
  setBooted: (b: boolean) => void
  selectTask: (id: string | null) => void
  trackTask: (id: string, tracked: boolean) => void
  completeTask: (id: string) => void
  selectContact: (id: string | null) => void
  openCompose: (contactId: string | null) => void
  addMessage: (m: Omit<PdaMessage, 'id' | 'ts' | 'read'> & { read?: boolean }) => PdaMessage
  markMessagesRead: (withContact: string) => void
  addJournal: (j: Omit<JournalEntry, 'id' | 'ts' | 'pinned'> & { pinned?: boolean }) => void
  updateJournal: (id: string, patch: Partial<JournalEntry>) => void
  deleteJournal: (id: string) => void
  setActiveStation: (id: string | null) => void
  toggleMapFilter: (k: string) => void
  setPlayerPos: (p: LatLng, heading?: number) => void
  registerPda: (id: string, info: { callsign: string; faction: Faction }) => void
  addCustomMarker: (m: Omit<MapMarker, 'id' | 'custom' | 'createdAt'>) => string
  updateCustomMarker: (id: string, patch: Partial<MapMarker>) => void
  deleteCustomMarker: (id: string) => void
  updatePlayer: (patch: Partial<PlayerState>) => void
  setMapFocus: (f: { position: LatLng; zoom?: number } | null) => void
}

const SEED_CENTER: LatLng = { lat: 43.8260, lng: -111.7897 } // Rexburg, ID

const seedContacts: Contact[] = [
  { id: 'sidorovich', callsign: 'Sidorovich', faction: 'loner', rank: 'veteran', location: 'Rookie Village', relationship: 'friendly', position: { lat: 43.8171, lng: -111.8003 }, bio: 'Trader at the Cordon. Always has a job — and never pays enough.', online: true },
  { id: 'wolf', callsign: 'Wolf', faction: 'loner', rank: 'experienced', location: 'Rookie Village', relationship: 'friendly', position: { lat: 43.8185, lng: -111.7985 }, bio: 'Camp leader. Looks out for greenhorns.', online: true },
  { id: 'fanatic', callsign: 'Fanatic', faction: 'loner', rank: 'master', location: '100 Rad Bar', relationship: 'friendly', position: { lat: 43.8382, lng: -111.8166 }, bio: 'Loner faction leader. Reliable handler.', online: true },
  { id: 'voronin', callsign: 'General Voronin', faction: 'duty', rank: 'legend', location: 'Rostok', relationship: 'neutral', position: { lat: 43.8393, lng: -111.8199 }, bio: 'Duty command. Hates mutants, hates Freedom only slightly less.', online: true },
  { id: 'lukash', callsign: 'Lukash', faction: 'freedom', rank: 'veteran', location: 'Army Warehouses', relationship: 'neutral', position: { lat: 43.8557, lng: -111.8426 }, bio: 'Freedom command. Believes the Zone should be open to all.', online: true },
  { id: 'sakharov', callsign: 'Prof. Sakharov', faction: 'ecologist', rank: 'master', location: 'Yantar', relationship: 'friendly', position: { lat: 43.8414, lng: -111.8016 }, bio: 'Lead ecologist. Pays well for anomalous artifacts and samples.', online: false },
  { id: 'sultan', callsign: 'Sultan', faction: 'bandit', rank: 'veteran', location: 'Garbage', relationship: 'hostile', position: { lat: 43.8312, lng: -111.8084 }, bio: 'Bandit boss. Stay armed, stay distant.', online: true },
  { id: 'snitch', callsign: 'Snitch', faction: 'loner', rank: 'rookie', location: 'Rookie Village', relationship: 'neutral', position: { lat: 43.8175, lng: -111.7989 }, bio: 'Rumor monger. Half lies, half useful.', online: true },
  { id: 'guide', callsign: 'Guide', faction: 'loner', rank: 'master', location: 'Various', relationship: 'friendly', position: null, bio: 'Fast travel for a fee.', online: true }
]

const seedTasks: Task[] = [
  {
    id: 't1', title: 'Recover a stash from the dead bandit', giver: 'sidorovich', faction: 'loner',
    description: 'A bandit died near the bridge with a stash on his PDA. Pull the data and recover the goods.',
    reward: '5000 RU', target: { lat: 43.8208, lng: -111.7948 }, status: 'active', tracked: true, createdAt: Date.now() - 1000 * 60 * 60
  },
  {
    id: 't2', title: 'Bring artifact "Stone Flower"', giver: 'sakharov', faction: 'ecologist',
    description: 'Sample for ongoing study. Found near Springboard anomalies in Yantar.',
    reward: '12000 RU + suit upgrade', target: { lat: 43.8414, lng: -111.8016 }, status: 'active', tracked: false, createdAt: Date.now() - 1000 * 60 * 60 * 6
  },
  {
    id: 't3', title: 'Clear bandit camp at the Garbage', giver: 'voronin', faction: 'duty',
    description: 'Sultan\'s crew is harassing convoys. Reduce the headcount.',
    reward: '8000 RU + Duty rep', target: { lat: 43.8312, lng: -111.8084 }, status: 'active', tracked: false, createdAt: Date.now() - 1000 * 60 * 60 * 12
  },
  {
    id: 't4', title: 'Find missing stalker "Hatchet"', giver: 'wolf', faction: 'loner',
    description: 'Went north towards the Agroprom underground three days ago. No comms since.',
    reward: '3000 RU + favour', target: { lat: 43.8271, lng: -111.8077 }, status: 'active', tracked: false, createdAt: Date.now() - 1000 * 60 * 60 * 26
  },
  {
    id: 't5', title: 'Deliver package to Freedom', giver: 'fanatic', faction: 'freedom',
    description: 'Sealed package. Don\'t open it. Don\'t lose it.',
    reward: '6000 RU', target: { lat: 43.8557, lng: -111.8426 }, status: 'completed', tracked: false, createdAt: Date.now() - 1000 * 60 * 60 * 48
  }
]

const seedMessages: PdaMessage[] = [
  { id: 'm1', from: 'sidorovich', to: 'self', text: 'Stalker. Got a job. Come see me.', ts: Date.now() - 1000 * 60 * 50, read: true },
  { id: 'm2', from: 'snitch', to: 'self', text: 'Heard there\'s a fresh artifact spawn near the swamps. Maybe.', ts: Date.now() - 1000 * 60 * 30, read: false },
  { id: 'm3', from: 'sakharov', to: 'self', text: 'Bring me a Stone Flower. Payment ready.', ts: Date.now() - 1000 * 60 * 20, read: false },
  { id: 'm4', from: 'wolf', to: 'self', text: 'Watch yourself out there. Pseudodogs spotted south.', ts: Date.now() - 1000 * 60 * 10, read: false }
]

const seedJournal: JournalEntry[] = [
  { id: 'j1', type: 'rumor', title: 'Stash near broken truck', body: 'Snitch says there\'s a fresh stash near the broken truck south of the village. Verify.', ts: Date.now() - 1000 * 60 * 45, pinned: true, location: { lat: 43.8185, lng: -111.7952 } },
  { id: 'j2', type: 'note', title: 'Pseudodogs at swamp edge', body: 'Pack of three. Avoid until I have shotgun + good ammo.', ts: Date.now() - 1000 * 60 * 22, pinned: false, location: { lat: 43.8236, lng: -111.7892 } },
  { id: 'j3', type: 'discovery', title: 'Hidden cellar', body: 'Found a hidden cellar behind the farmhouse — toolbox inside. Took rifle parts.', ts: Date.now() - 1000 * 60 * 12, pinned: false, location: { lat: 43.8220, lng: -111.8012 } }
]

const seedMarkers: MapMarker[] = [
  { id: 'a1', kind: 'anomaly', anomaly: 'electro', label: 'Electro cluster', position: { lat: 43.8195, lng: -111.7962 }, detail: 'Bolts — high yield artifacts reported' },
  { id: 'a2', kind: 'anomaly', anomaly: 'whirligig', label: 'Whirligig field', position: { lat: 43.8262, lng: -111.8092 } },
  { id: 'a3', kind: 'anomaly', anomaly: 'burner', label: 'Burner', position: { lat: 43.8371, lng: -111.7966 } },
  { id: 'a4', kind: 'anomaly', anomaly: 'springboard', label: 'Springboard', position: { lat: 43.8414, lng: -111.8016 } },
  { id: 'c1', kind: 'camp', label: 'Rookie Camp', position: { lat: 43.8181, lng: -111.7991 } },
  { id: 'c2', kind: 'camp', label: '100 Rad Bar', position: { lat: 43.8382, lng: -111.8166 } },
  { id: 'c3', kind: 'camp', label: 'Yantar — Ecologist Bunker', position: { lat: 43.8414, lng: -111.8016 } },
  { id: 'c4', kind: 'camp', label: 'Freedom HQ', position: { lat: 43.8557, lng: -111.8426 } },
  { id: 'tr1', kind: 'trader', label: 'Sidorovich (Trader)', position: { lat: 43.8171, lng: -111.8003 } },
  { id: 'h1', kind: 'hot', label: 'Hostile contacts', position: { lat: 43.8312, lng: -111.8084 }, detail: 'Bandit camp — Sultan' },
  { id: 'ex1', kind: 'extraction', label: 'Extraction point — South gate', position: { lat: 43.8130, lng: -111.8036 } }
]

const seedStations: RadioStation[] = [
  { id: 'r1', freq: '88.7', name: 'Zone Broadcast', description: 'Anonymous shortwave. Distorted reports from the deep Zone.' },
  { id: 'r2', freq: '94.2', name: 'Loner Net', faction: 'loner', description: 'Rookie traffic — job listings, warnings, gossip.' },
  { id: 'r3', freq: '99.5', name: 'Duty Command', faction: 'duty', description: 'Encrypted Duty channel — partial decryption.' },
  { id: 'r4', freq: '101.3', name: 'Open Frequency', faction: 'freedom', description: 'Anti-establishment broadcast. Heavy guitar.' },
  { id: 'r5', freq: '105.1', name: 'Ecologist Telemetry', faction: 'ecologist', description: 'Beeps. Steady carrier with data bursts.' },
  { id: 'r6', freq: '108.0', name: 'Monolith Choir', faction: 'monolith', description: 'Layered chanting. Avoid prolonged listening.' }
]

const seedPlayer: PlayerState = {
  callsign: 'Marked One',
  faction: 'loner',
  rank: 'experienced',
  reputation: 240,
  position: { ...SEED_CENTER },
  heading: 45,
  zoneName: 'Rexburg',
  health: 92,
  stamina: 78,
  radiation: 6,
  hunger: 18,
  thirst: 22,
  sleep: 14,
  bleeding: 0,
  psy: 4,
  rubles: 12400
}

const newId = () => Math.random().toString(36).slice(2, 10)

export const usePda = create<PdaState>()(
  persist(
    (set, get) => ({
      tab: 'map',
      booted: false,
      pdaId: 'pda-' + newId(),
      player: seedPlayer,
      tasks: seedTasks,
      contacts: seedContacts,
      messages: seedMessages,
      journal: seedJournal,
      markers: seedMarkers,
      customMarkers: [],
      stations: seedStations,
      selectedTaskId: 't1',
      selectedContactId: null,
      selectedMarkerId: null,
      activeStationId: null,
      mapFilters: {
        anomaly: true, stash: true, camp: true, trader: true,
        hot: true, extraction: true, person: true, poi: true,
        task: true, journal: false
      },
      composeTo: null,
      knownPdas: {},
      mapFocus: null,

      setTab: (t) => set({ tab: t }),
      setBooted: (b) => set({ booted: b }),
      selectTask: (id) => set({ selectedTaskId: id }),
      trackTask: (id, tracked) => set({
        tasks: get().tasks.map(t => t.id === id ? { ...t, tracked } : t)
      }),
      completeTask: (id) => set({
        tasks: get().tasks.map(t => t.id === id ? { ...t, status: 'completed', tracked: false } : t)
      }),
      selectContact: (id) => set({ selectedContactId: id }),
      openCompose: (contactId) => set({ composeTo: contactId, tab: 'messages' }),
      addMessage: (m) => {
        const msg: PdaMessage = { id: newId(), ts: Date.now(), read: m.read ?? false, ...m }
        set({ messages: [...get().messages, msg] })
        return msg
      },
      markMessagesRead: (withContact) => set({
        messages: get().messages.map(m =>
          (m.from === withContact || m.to === withContact) ? { ...m, read: true } : m
        )
      }),
      addJournal: (j) => set({
        journal: [{ id: newId(), ts: Date.now(), pinned: j.pinned ?? false, ...j }, ...get().journal]
      }),
      updateJournal: (id, patch) => set({
        journal: get().journal.map(j => j.id === id ? { ...j, ...patch } : j)
      }),
      deleteJournal: (id) => set({
        journal: get().journal.filter(j => j.id !== id)
      }),
      setActiveStation: (id) => set({ activeStationId: id }),
      toggleMapFilter: (k) => set({ mapFilters: { ...get().mapFilters, [k]: !get().mapFilters[k] } }),
      setPlayerPos: (p, heading) => set({
        player: { ...get().player, position: p, heading: heading ?? get().player.heading }
      }),
      registerPda: (id, info) => set({
        knownPdas: { ...get().knownPdas, [id]: { ...info, lastSeen: Date.now() } }
      }),
      addCustomMarker: (m) => {
        const id = newId()
        const marker: MapMarker = { ...m, id, custom: true, createdAt: Date.now() }
        set({ customMarkers: [...get().customMarkers, marker] })
        return id
      },
      updateCustomMarker: (id, patch) => set({
        customMarkers: get().customMarkers.map(m => m.id === id ? { ...m, ...patch } : m)
      }),
      deleteCustomMarker: (id) => set({
        customMarkers: get().customMarkers.filter(m => m.id !== id)
      }),
      updatePlayer: (patch) => set({ player: { ...get().player, ...patch } }),
      setMapFocus: (f) => set({ mapFocus: f })
    }),
    {
      name: 'stalker-pda',
      version: 4,
      partialize: (s) => ({
        pdaId: s.pdaId,
        player: s.player,
        tasks: s.tasks,
        messages: s.messages,
        journal: s.journal,
        mapFilters: s.mapFilters,
        activeStationId: s.activeStationId,
        knownPdas: s.knownPdas,
        customMarkers: s.customMarkers
      })
    }
  )
)

export const factionLabel: Record<Faction, string> = {
  loner: 'Loners', duty: 'Duty', freedom: 'Freedom', bandit: 'Bandits',
  mercs: 'Mercenaries', military: 'Military', monolith: 'Monolith',
  ecologist: 'Ecologists', 'clear-sky': 'Clear Sky', sin: 'Sin'
}

export const factionClass: Record<Faction, string> = {
  loner: 'fac-loner', duty: 'fac-duty', freedom: 'fac-freedom', bandit: 'fac-bandit',
  mercs: 'fac-mercs', military: 'fac-military', monolith: 'fac-monolith',
  ecologist: 'fac-ecologist', 'clear-sky': 'fac-clear-sky', sin: 'fac-sin'
}

export const rankLabel: Record<Rank, string> = {
  rookie: 'Rookie', experienced: 'Experienced', veteran: 'Veteran',
  master: 'Master', legend: 'Legend'
}
