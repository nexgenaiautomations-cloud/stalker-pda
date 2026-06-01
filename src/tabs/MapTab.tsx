import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { usePda, MapMarker, MarkerKind, Task, JournalEntry, LatLng } from '../store/pda'
import { IconPlus, IconTrash, IconCheck } from '../components/Icons'

interface KindSpec { id: MarkerKind; label: string; symbol: string; color: string }

const KINDS: KindSpec[] = [
  { id: 'stash',      label: 'Stash',      symbol: '$', color: '#ffd56b' },
  { id: 'person',     label: 'Person',     symbol: 'P', color: '#79d3e8' },
  { id: 'camp',       label: 'Camp',       symbol: '#', color: '#7ec84a' },
  { id: 'trader',     label: 'Trader',     symbol: 'T', color: '#5fb4ff' },
  { id: 'anomaly',    label: 'Anomaly',    symbol: 'A', color: '#ff8a2b' },
  { id: 'hot',        label: 'Hostile',    symbol: '!', color: '#ff3a2b' },
  { id: 'extraction', label: 'Exit',       symbol: 'X', color: '#b88aff' },
  { id: 'poi',        label: 'POI',        symbol: '●', color: '#ffd56b' }
]

const kindMeta = (k: MarkerKind): KindSpec =>
  KINDS.find(x => x.id === k) ?? KINDS[0]

function divIcon(html: string, size = 28, className = '') {
  return L.divIcon({
    html,
    className: `pda-marker-wrap ${className}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

function markerHtml(symbol: string, color: string, ring = true) {
  return `
    <div class="pda-marker" style="color:${color}">
      <span>${symbol}</span>
      ${ring ? '<span class="ring"></span>' : ''}
    </div>`
}

function Recenter({ pos }: { pos: LatLng }) {
  const map = useMap()
  useEffect(() => {
    map.setView([pos.lat, pos.lng], map.getZoom())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos.lat, pos.lng])
  return null
}

function MapClickCatcher({ onPlace }: { onPlace: (ll: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPlace({ lat: e.latlng.lat, lng: e.latlng.lng })
    }
  })
  return null
}

interface LongPressProps {
  onLongPress: (ll: LatLng) => void
  onProgress?: (px: { x: number; y: number } | null) => void
  durationMs?: number
  moveTolerance?: number
}

function LongPressHandler({
  onLongPress, onProgress, durationMs = 500, moveTolerance = 12
}: LongPressProps) {
  const map = useMap()
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    let startX = 0, startY = 0
    let startLatLng: LatLng | null = null

    const getXY = (oe: any) => {
      if (oe?.touches?.[0]) return { x: oe.touches[0].clientX, y: oe.touches[0].clientY }
      if (oe?.changedTouches?.[0]) return { x: oe.changedTouches[0].clientX, y: oe.changedTouches[0].clientY }
      return { x: oe?.clientX ?? 0, y: oe?.clientY ?? 0 }
    }

    const cancel = () => {
      if (timer) { clearTimeout(timer); timer = null }
      startLatLng = null
      onProgress?.(null)
    }

    const onDown = (e: any) => {
      cancel()
      const { x, y } = getXY(e.originalEvent)
      startX = x; startY = y
      startLatLng = { lat: e.latlng.lat, lng: e.latlng.lng }
      // local coords relative to map container
      const rect = (map.getContainer() as HTMLElement).getBoundingClientRect()
      onProgress?.({ x: x - rect.left, y: y - rect.top })
      timer = setTimeout(() => {
        if (startLatLng) {
          try { (navigator as any).vibrate?.(20) } catch { /* ignore */ }
          onLongPress(startLatLng)
        }
        cancel()
      }, durationMs)
    }

    const onMove = (e: any) => {
      if (!timer) return
      const { x, y } = getXY(e.originalEvent)
      if (Math.hypot(x - startX, y - startY) > moveTolerance) cancel()
    }

    map.on('mousedown', onDown)
    map.on('mousemove', onMove)
    map.on('mouseup', cancel)
    map.on('dragstart', cancel)
    map.on('zoomstart', cancel)
    map.on('movestart', cancel)

    return () => {
      cancel()
      map.off('mousedown', onDown)
      map.off('mousemove', onMove)
      map.off('mouseup', cancel)
      map.off('dragstart', cancel)
      map.off('zoomstart', cancel)
      map.off('movestart', cancel)
    }
  }, [map, onLongPress, onProgress, durationMs, moveTolerance])
  return null
}

function FilterToggle({ k, label, color }: { k: string; label: string; color: string }) {
  const on = usePda(s => s.mapFilters[k])
  const toggle = usePda(s => s.toggleMapFilter)
  return (
    <button
      onClick={() => toggle(k)}
      className={`shrink-0 flex items-center gap-2 px-2 py-1 border text-[10px] tracking-widest uppercase
        ${on ? 'border-pda-borderHot text-pda-amberHot bg-pda-panel2'
              : 'border-pda-rule text-pda-dim hover:text-pda-muted'}`}
    >
      <span className="w-2 h-2" style={{ background: color }} />
      {label}
    </button>
  )
}

type Draft = {
  id?: string
  kind: MarkerKind
  label: string
  detail: string
  position: LatLng
}

export function MapTab() {
  const {
    markers, customMarkers, tasks, journal, player, mapFilters,
    addCustomMarker, updateCustomMarker, deleteCustomMarker
  } = usePda()

  const [placeMode, setPlaceMode] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [pressPx, setPressPx] = useState<{ x: number; y: number } | null>(null)

  const playerIcon = useMemo(() => divIcon(
    `<div class="pda-marker" style="color:#ffb13b">
       <div class="player-arrow" style="transform: rotate(${player.heading}deg)"></div>
       <span class="ring"></span>
     </div>`, 28
  ), [player.heading])

  const taskMarkers = tasks.filter(t => mapFilters.task && t.status === 'active' && t.target)
  const allWorldMarkers = useMemo(
    () => [...markers, ...customMarkers],
    [markers, customMarkers]
  )

  const handleMapClick = (ll: LatLng) => {
    if (!placeMode) return
    setDraft({ kind: 'stash', label: '', detail: '', position: ll })
    setPlaceMode(false)
  }

  const handleLongPress = (ll: LatLng) => {
    if (draft) return  // already editing
    setDraft({ kind: 'stash', label: '', detail: '', position: ll })
    setPlaceMode(false)
    setPressPx(null)
  }

  const editExisting = (m: MapMarker) => {
    setDraft({
      id: m.id,
      kind: m.kind,
      label: m.label,
      detail: m.detail ?? '',
      position: m.position
    })
  }

  const saveDraft = () => {
    if (!draft) return
    const payload = {
      kind: draft.kind,
      label: draft.label.trim() || kindMeta(draft.kind).label,
      detail: draft.detail.trim() || undefined,
      position: draft.position
    }
    if (draft.id) updateCustomMarker(draft.id, payload)
    else addCustomMarker(payload)
    setDraft(null)
  }

  return (
    <div className="flex flex-1 flex-col relative">
      <div className="panel-header px-3 py-2 text-xs flex justify-between">
        <span>Zone Map · {player.zoneName}</span>
        <span className="text-pda-muted hidden sm:inline">scale 1:25k · grid WGS84</span>
      </div>

      <div className="flex-1 relative map-zone">
        <MapContainer
          center={[player.position.lat, player.position.lng]}
          zoom={14}
          minZoom={11}
          maxZoom={18}
          zoomControl
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />
          <Recenter pos={player.position} />
          {placeMode && <MapClickCatcher onPlace={handleMapClick} />}
          <LongPressHandler onLongPress={handleLongPress} onProgress={setPressPx} />

          {/* Player */}
          <Marker position={[player.position.lat, player.position.lng]} icon={playerIcon}>
            <Popup>
              <div className="text-pda-amber font-mono text-xs">
                <div className="text-pda-amberHot">[ YOU ]</div>
                <div>{player.callsign}</div>
                <div>{player.zoneName}</div>
              </div>
            </Popup>
          </Marker>

          {/* World + custom markers */}
          {allWorldMarkers.filter(m => mapFilters[m.kind]).map(m => {
            const meta = kindMeta(m.kind)
            return (
              <Marker
                key={m.id}
                position={[m.position.lat, m.position.lng]}
                icon={divIcon(markerHtml(meta.symbol, meta.color))}
              >
                <Popup>
                  <div className="font-mono text-xs min-w-[160px]">
                    <div className="text-pda-amberHot uppercase">
                      [{meta.label}]{m.custom ? ' · custom' : ''}
                    </div>
                    <div className="text-pda-amber mt-0.5">{m.label}</div>
                    {m.detail && <div className="text-pda-text mt-1">{m.detail}</div>}
                    <div className="text-pda-muted mt-1 text-[10px]">
                      N {m.position.lat.toFixed(4)} · E {m.position.lng.toFixed(4)}
                    </div>
                    {m.custom && (
                      <div className="flex gap-1 mt-2">
                        <button className="btn-tac flex-1" onClick={() => editExisting(m)}>Edit</button>
                        <button className="btn-tac"
                          onClick={() => { if (confirm('Delete this pin?')) deleteCustomMarker(m.id) }}>
                          <IconTrash size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* Task markers */}
          {taskMarkers.map((t: Task) => (
            <Marker
              key={t.id}
              position={[t.target!.lat, t.target!.lng]}
              icon={divIcon(markerHtml(t.tracked ? '★' : '?', t.tracked ? '#ffd56b' : '#ffb13b'), 32)}
            >
              <Popup>
                <div className="font-mono text-xs">
                  <div className="text-pda-amberHot uppercase">[TASK]</div>
                  <div className="text-pda-amber">{t.title}</div>
                  <div className="text-pda-text mt-1">{t.description}</div>
                  <div className="text-pda-muted mt-1">Reward: {t.reward}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Journal pins */}
          {mapFilters.journal && journal.filter((j: JournalEntry) => j.location).map(j => (
            <Marker
              key={j.id}
              position={[j.location!.lat, j.location!.lng]}
              icon={divIcon(markerHtml('§', '#79d3e8'))}
            >
              <Popup>
                <div className="font-mono text-xs">
                  <div className="text-pda-amberHot uppercase">[JOURNAL · {j.type}]</div>
                  <div className="text-pda-amber">{j.title}</div>
                  <div className="text-pda-text mt-1">{j.body}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Place-mode banner */}
        {placeMode && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[500] panel px-3 py-2
                          flex items-center gap-3 shadow-[0_0_20px_rgba(255,160,60,0.25)]">
            <span className="w-2 h-2 bg-pda-amber animate-blip" />
            <span className="text-pda-amberHot text-xs tracking-widest uppercase">
              Tap map to drop pin
            </span>
            <button className="btn-tac" onClick={() => setPlaceMode(false)}>Cancel</button>
          </div>
        )}

        {/* Add-pin floating button */}
        {!placeMode && !draft && (
          <button
            onClick={() => setPlaceMode(true)}
            className="absolute top-2 left-2 z-[500] btn-tac flex items-center gap-2 shadow-[0_0_16px_rgba(255,160,60,0.3)]"
          >
            <IconPlus size={14} /> Add Pin
          </button>
        )}

        {/* Long-press hint (auto-fades after a few seconds via CSS via key) */}
        {!placeMode && !draft && customMarkers.length === 0 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[500] text-[10px] tracking-widest uppercase text-pda-amber bg-pda-panel/85 border border-pda-rule px-2 py-1 pointer-events-none">
            Long-press map to drop pin
          </div>
        )}

        {/* Long-press progress ring at the touch point */}
        {pressPx && (
          <span
            key={`${pressPx.x},${pressPx.y}`}
            className="long-press-ring"
            style={{ left: pressPx.x, top: pressPx.y }}
          />
        )}

        {/* Pin count */}
        {customMarkers.length > 0 && !placeMode && !draft && (
          <div className="absolute top-2 left-[110px] z-[500] panel px-2 py-1 text-[10px] text-pda-muted tracking-widest uppercase pointer-events-none">
            {customMarkers.length} custom
          </div>
        )}

        {/* Compass */}
        <div className="absolute top-2 right-2 z-[400] w-14 h-14 rounded-full border border-pda-borderHot bg-pda-panel/80 grid place-items-center pointer-events-none">
          <div className="text-[10px] text-pda-amber tracking-widest">N</div>
          <div className="absolute w-px h-5 bg-pda-amber"
               style={{ transform: `rotate(${player.heading}deg) translateY(-9px)` }} />
        </div>

        {/* Edit/Create form */}
        {draft && (
          <PinForm
            draft={draft}
            onChange={setDraft}
            onCancel={() => setDraft(null)}
            onSave={saveDraft}
            onDelete={
              draft.id
                ? () => { if (confirm('Delete this pin?')) { deleteCustomMarker(draft.id!); setDraft(null) } }
                : undefined
            }
          />
        )}
      </div>

      {/* Filter row */}
      <div className="border-t border-pda-border px-3 py-2 flex gap-2 bg-pda-panel overflow-x-auto">
        <FilterToggle k="stash" label="Stashes" color="#ffd56b" />
        <FilterToggle k="person" label="People" color="#79d3e8" />
        <FilterToggle k="camp" label="Camps" color="#7ec84a" />
        <FilterToggle k="trader" label="Traders" color="#5fb4ff" />
        <FilterToggle k="anomaly" label="Anomalies" color="#ff8a2b" />
        <FilterToggle k="hot" label="Hostile" color="#ff3a2b" />
        <FilterToggle k="extraction" label="Exit" color="#b88aff" />
        <FilterToggle k="poi" label="POI" color="#ffd56b" />
        <FilterToggle k="task" label="Tasks" color="#ffb13b" />
        <FilterToggle k="journal" label="Journal" color="#79d3e8" />
      </div>
    </div>
  )
}

interface PinFormProps {
  draft: Draft
  onChange: (d: Draft) => void
  onSave: () => void
  onCancel: () => void
  onDelete?: () => void
}

function PinForm({ draft, onChange, onSave, onCancel, onDelete }: PinFormProps) {
  const meta = kindMeta(draft.kind)
  return (
    <div className="absolute inset-0 z-[600] flex items-center justify-center p-3 sm:p-6"
         onClick={onCancel}>
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative panel w-full max-w-[380px] max-h-full flex flex-col"
           onClick={(e) => e.stopPropagation()}>
        <div className="panel-header px-3 py-2 text-xs flex items-center justify-between">
          <span>{draft.id ? 'Edit Pin' : 'Add Pin'}</span>
          <span className="text-pda-muted text-[10px]">
            N {draft.position.lat.toFixed(4)} · E {draft.position.lng.toFixed(4)}
          </span>
        </div>

        <div className="p-3 sm:p-4 overflow-y-auto space-y-3">
          {/* Icon picker */}
          <div>
            <div className="text-[10px] tracking-widest text-pda-muted mb-2">ICON</div>
            <div className="grid grid-cols-4 gap-1.5">
              {KINDS.map(k => {
                const sel = draft.kind === k.id
                return (
                  <button key={k.id}
                    onClick={() => onChange({ ...draft, kind: k.id })}
                    className={`flex flex-col items-center justify-center gap-1 py-2 border
                      ${sel
                        ? 'border-pda-amberHot bg-pda-panel2 shadow-[0_0_8px_rgba(255,160,60,0.3)]'
                        : 'border-pda-rule hover:border-pda-border bg-pda-bg'}`}
                  >
                    <span className="text-base font-bold"
                          style={{ color: k.color, textShadow: `0 0 6px ${k.color}` }}>
                      {k.symbol}
                    </span>
                    <span className="text-[9px] tracking-widest uppercase text-pda-text">
                      {k.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Label */}
          <div>
            <div className="text-[10px] tracking-widest text-pda-muted mb-1">LABEL</div>
            <input
              autoFocus
              value={draft.label}
              onChange={e => onChange({ ...draft, label: e.target.value })}
              placeholder={meta.label}
              className="w-full text-sm"
            />
          </div>

          {/* Detail */}
          <div>
            <div className="text-[10px] tracking-widest text-pda-muted mb-1">DETAIL · OPTIONAL</div>
            <textarea
              value={draft.detail}
              onChange={e => onChange({ ...draft, detail: e.target.value })}
              placeholder="Notes, contents, threat level, contact name..."
              rows={3}
              className="w-full text-sm resize-none"
            />
          </div>
        </div>

        <div className="border-t border-pda-rule p-2 flex items-center gap-2">
          {onDelete && (
            <button className="btn-tac flex items-center gap-1" onClick={onDelete}>
              <IconTrash size={12} /> Delete
            </button>
          )}
          <div className="flex-1" />
          <button className="btn-tac" onClick={onCancel}>Cancel</button>
          <button className="btn-tac flex items-center gap-1" onClick={onSave}>
            <IconCheck size={12} /> Save
          </button>
        </div>
      </div>
    </div>
  )
}
