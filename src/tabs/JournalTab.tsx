import { useState } from 'react'
import { usePda, JournalEntry } from '../store/pda'
import { IconPlus, IconTrash, IconStar } from '../components/Icons'

const TYPES: JournalEntry['type'][] = ['note', 'log', 'rumor', 'discovery']

export function JournalTab() {
  const { journal, addJournal, updateJournal, deleteJournal, player, setTab } = usePda()
  const [filter, setFilter] = useState<'all' | JournalEntry['type']>('all')
  const list = filter === 'all' ? journal : journal.filter(j => j.type === filter)
  const [selectedId, setSelectedId] = useState<string | null>(journal[0]?.id ?? null)
  const selected = list.find(j => j.id === selectedId) ?? list[0]

  const [draftTitle, setDraftTitle] = useState('')
  const [draftBody, setDraftBody] = useState('')
  const [draftType, setDraftType] = useState<JournalEntry['type']>('note')

  const create = () => {
    if (!draftTitle.trim()) return
    addJournal({
      title: draftTitle.trim(),
      body: draftBody.trim(),
      type: draftType,
      location: { ...player.position }
    })
    setDraftTitle(''); setDraftBody('')
  }

  return (
    <div className="flex flex-1">
      <div className="w-[340px] border-r border-pda-border flex flex-col">
        <div className="panel-header px-3 py-2 text-xs flex justify-between">
          <span>Journal</span>
          <span className="text-pda-muted">{journal.length}</span>
        </div>
        <div className="flex flex-wrap gap-1 p-2 border-b border-pda-rule">
          {(['all', ...TYPES] as const).map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`text-[10px] tracking-widest uppercase px-2 py-1 border
                ${filter === t ? 'border-pda-borderHot text-pda-amberHot bg-pda-panel2'
                                : 'border-pda-rule text-pda-dim hover:text-pda-muted'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {list.map(j => {
            const active = selected?.id === j.id
            return (
              <button key={j.id} onClick={() => setSelectedId(j.id)}
                className={`w-full text-left px-3 py-3 border-b border-pda-rule
                  ${active ? 'row-active' : 'row-hover'}`}>
                <div className="flex items-center gap-2">
                  {j.pinned && <span className="text-pda-amberHot">★</span>}
                  <span className="text-[10px] tracking-widest uppercase text-pda-amber">{j.type}</span>
                </div>
                <div className="text-pda-text mt-1 text-sm leading-snug">{j.title}</div>
                <div className="text-[10px] text-pda-muted mt-1">{new Date(j.ts).toLocaleString()}</div>
              </button>
            )
          })}
          {list.length === 0 && (
            <div className="p-4 text-pda-muted text-xs">No entries.</div>
          )}
        </div>

        {/* Quick new entry */}
        <div className="border-t border-pda-border p-2 space-y-2 bg-pda-panel">
          <div className="text-[10px] text-pda-muted tracking-widest uppercase">New entry</div>
          <input value={draftTitle} onChange={e => setDraftTitle(e.target.value)}
                 placeholder="Title" className="w-full text-sm" />
          <textarea value={draftBody} onChange={e => setDraftBody(e.target.value)}
                    placeholder="Body" rows={2} className="w-full text-sm" />
          <div className="flex gap-1">
            {TYPES.map(t => (
              <button key={t} onClick={() => setDraftType(t)}
                className={`text-[10px] tracking-widest uppercase px-2 py-1 border
                  ${draftType === t ? 'border-pda-borderHot text-pda-amberHot bg-pda-panel2'
                                    : 'border-pda-rule text-pda-dim hover:text-pda-muted'}`}>
                {t}
              </button>
            ))}
            <button className="btn-tac ml-auto flex items-center gap-1" onClick={create}>
              <IconPlus size={12} /> Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="panel-header px-3 py-2 text-xs">Entry</div>
        {selected ? (
          <div className="p-6 overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-pda-amberHot tracking-widest amber-glow text-lg">
                  {selected.title.toUpperCase()}
                </div>
                <div className="text-pda-muted text-xs mt-1 tracking-widest">
                  {selected.type.toUpperCase()} · {new Date(selected.ts).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-tac flex items-center gap-1"
                  onClick={() => updateJournal(selected.id, { pinned: !selected.pinned })}>
                  <IconStar size={12} /> {selected.pinned ? 'Unpin' : 'Pin'}
                </button>
                <button className="btn-tac flex items-center gap-1"
                  onClick={() => { deleteJournal(selected.id); setSelectedId(null) }}>
                  <IconTrash size={12} /> Delete
                </button>
              </div>
            </div>
            <div className="hr-amber my-4" />
            <p className="text-pda-text whitespace-pre-wrap leading-relaxed">{selected.body || '— empty —'}</p>

            {selected.location && (
              <div className="panel-sunken p-3 mt-6 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-pda-muted tracking-widest">PIN COORDINATES</div>
                  <div className="text-pda-text mt-1">
                    N {selected.location.lat.toFixed(4)} · E {selected.location.lng.toFixed(4)}
                  </div>
                </div>
                <button className="btn-tac" onClick={() => setTab('map')}>Show on map</button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-pda-muted">No entry selected.</div>
        )}
      </div>
    </div>
  )
}
