import { useState } from 'react'
import { usePda, factionClass, factionLabel, rankLabel, Faction } from '../store/pda'

const FACTIONS: ('all' | Faction)[] = ['all','loner','duty','freedom','bandit','mercs','military','ecologist','monolith','clear-sky']

export function ContactsTab() {
  const { contacts, selectedContactId, selectContact, openCompose } = usePda()
  const [filter, setFilter] = useState<'all' | Faction>('all')
  const list = filter === 'all' ? contacts : contacts.filter(c => c.faction === filter)
  const selected = contacts.find(c => c.id === selectedContactId) ?? list[0]

  return (
    <div className="flex flex-1">
      <div className="w-[340px] border-r border-pda-border flex flex-col">
        <div className="panel-header px-3 py-2 text-xs flex justify-between">
          <span>Contacts</span>
          <span className="text-pda-muted">{list.length}</span>
        </div>
        <div className="flex flex-wrap gap-1 p-2 border-b border-pda-rule">
          {FACTIONS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-[10px] tracking-widest uppercase px-2 py-1 border
                ${filter === f ? 'border-pda-borderHot text-pda-amberHot bg-pda-panel2'
                                : 'border-pda-rule text-pda-dim hover:text-pda-muted'}`}>
              {f === 'all' ? 'All' : factionLabel[f]}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {list.map(c => {
            const active = selected?.id === c.id
            return (
              <button key={c.id} onClick={() => selectContact(c.id)}
                className={`w-full text-left px-3 py-3 border-b border-pda-rule
                  ${active ? 'row-active' : 'row-hover'}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${c.online ? 'bg-pda-green animate-blip' : 'bg-pda-dim'}`} />
                  <span className={`text-sm ${factionClass[c.faction]}`}>{c.callsign}</span>
                </div>
                <div className="text-[10px] text-pda-muted tracking-widest uppercase mt-0.5">
                  {factionLabel[c.faction]} · {c.location}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="panel-header px-3 py-2 text-xs">Contact dossier</div>
        {selected ? (
          <div className="p-6 overflow-y-auto">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 border border-pda-borderHot bg-pda-panel2 grid place-items-center text-pda-amber text-2xl amber-glow">
                {selected.callsign.slice(0, 2)}
              </div>
              <div>
                <div className={`text-lg tracking-widest ${factionClass[selected.faction]} amber-glow`}>
                  {selected.callsign.toUpperCase()}
                </div>
                <div className="text-pda-muted text-xs tracking-widest">{factionLabel[selected.faction]} · {rankLabel[selected.rank]}</div>
                <div className="text-pda-text text-xs mt-1">{selected.location}</div>
                <div className={`text-xs mt-1
                  ${selected.relationship === 'friendly' ? 'text-pda-green'
                  : selected.relationship === 'hostile' ? 'text-pda-red' : 'text-pda-muted'}`}>
                  status: {selected.relationship} · {selected.online ? 'online' : 'offline'}
                </div>
              </div>
            </div>

            <div className="hr-amber my-4" />
            <p className="text-pda-text leading-relaxed">{selected.bio}</p>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="panel-sunken p-3">
                <div className="text-[10px] text-pda-muted tracking-widest">LAST KNOWN POSITION</div>
                <div className="text-pda-text mt-1">
                  {selected.position
                    ? `N ${selected.position.lat.toFixed(4)} · E ${selected.position.lng.toFixed(4)}`
                    : '— unknown —'}
                </div>
              </div>
              <div className="panel-sunken p-3">
                <div className="text-[10px] text-pda-muted tracking-widest">PDA UPLINK</div>
                <div className="text-pda-text mt-1">{selected.online ? 'available' : 'silent'}</div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button className="btn-tac" disabled={!selected.online} onClick={() => openCompose(selected.id)}>
                Send message
              </button>
              <button className="btn-tac" disabled={!selected.position} onClick={() => usePda.getState().setTab('map')}>
                Show on map
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-pda-muted">No contact selected.</div>
        )}
      </div>
    </div>
  )
}
