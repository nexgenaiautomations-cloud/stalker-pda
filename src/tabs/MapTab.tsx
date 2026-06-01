import { useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { usePda, MapMarker, Task, JournalEntry } from '../store/pda'

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

const symbolFor = (m: MapMarker) => {
  switch (m.kind) {
    case 'anomaly': return { s: 'A', c: '#ff8a2b' }
    case 'stash': return { s: '$', c: '#ffd56b' }
    case 'camp': return { s: '#', c: '#7ec84a' }
    case 'trader': return { s: 'T', c: '#5fb4ff' }
    case 'hot': return { s: '!', c: '#ff3a2b' }
    case 'extraction': return { s: 'X', c: '#b88aff' }
  }
}

function Recenter({ pos }: { pos: { lat: number; lng: number } }) {
  const map = useMap()
  useEffect(() => {
    map.setView([pos.lat, pos.lng], map.getZoom())
  }, [pos.lat, pos.lng, map])
  return null
}

function FilterToggle({ k, label, color }: { k: string; label: string; color: string }) {
  const on = usePda(s => s.mapFilters[k])
  const toggle = usePda(s => s.toggleMapFilter)
  return (
    <button
      onClick={() => toggle(k)}
      className={`flex items-center gap-2 px-2 py-1 border text-[10px] tracking-widest uppercase
        ${on ? 'border-pda-borderHot text-pda-amberHot bg-pda-panel2'
              : 'border-pda-rule text-pda-dim hover:text-pda-muted'}`}
    >
      <span className="w-2 h-2" style={{ background: color }} />
      {label}
    </button>
  )
}

export function MapTab() {
  const { markers, tasks, journal, player, mapFilters } = usePda()
  const recenterTo = player.position

  const playerIcon = useMemo(() => divIcon(
    `<div class="pda-marker" style="color:#ffb13b">
       <div class="player-arrow" style="transform: rotate(${player.heading}deg)"></div>
       <span class="ring"></span>
     </div>`, 28
  ), [player.heading])

  const taskMarkers = tasks.filter(t => mapFilters.task && t.status === 'active' && t.target)

  return (
    <div className="flex flex-1 flex-col">
      <div className="panel-header px-3 py-2 text-xs flex justify-between">
        <span>Zone Map · {player.zoneName}</span>
        <span className="text-pda-muted">scale 1:25k · grid WGS84</span>
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
          <Recenter pos={recenterTo} />

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

          {/* World markers */}
          {markers.filter(m => mapFilters[m.kind]).map(m => {
            const { s, c } = symbolFor(m)
            return (
              <Marker
                key={m.id}
                position={[m.position.lat, m.position.lng]}
                icon={divIcon(markerHtml(s, c))}
              >
                <Popup>
                  <div className="font-mono text-xs">
                    <div className="text-pda-amberHot uppercase">[{m.kind}]</div>
                    <div className="text-pda-amber">{m.label}</div>
                    {m.detail && <div className="text-pda-text mt-1">{m.detail}</div>}
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

        {/* Compass */}
        <div className="absolute top-2 right-2 z-[400] w-16 h-16 rounded-full border border-pda-borderHot bg-pda-panel/80 grid place-items-center pointer-events-none">
          <div className="text-[10px] text-pda-amber tracking-widest">N</div>
          <div className="absolute w-px h-6 bg-pda-amber" style={{ transform: `rotate(${player.heading}deg) translateY(-10px)` }} />
        </div>
      </div>

      {/* Filter row */}
      <div className="border-t border-pda-border px-3 py-2 flex flex-wrap gap-2 bg-pda-panel">
        <FilterToggle k="anomaly" label="Anomalies" color="#ff8a2b" />
        <FilterToggle k="stash" label="Stashes" color="#ffd56b" />
        <FilterToggle k="camp" label="Camps" color="#7ec84a" />
        <FilterToggle k="trader" label="Traders" color="#5fb4ff" />
        <FilterToggle k="hot" label="Hostile" color="#ff3a2b" />
        <FilterToggle k="extraction" label="Extraction" color="#b88aff" />
        <FilterToggle k="task" label="Tasks" color="#ffb13b" />
        <FilterToggle k="journal" label="Journal Pins" color="#79d3e8" />
      </div>
    </div>
  )
}
