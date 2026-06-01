import { usePda, factionClass, factionLabel } from '../store/pda'
import { IconPin, IconCheck, IconStar } from '../components/Icons'

export function TasksTab() {
  const {
    tasks, contacts, selectedTaskId, selectTask, trackTask, completeTask,
    setTab, setMapFocus
  } = usePda()
  const selected = tasks.find(t => t.id === selectedTaskId) ?? tasks[0]
  const giver = selected ? contacts.find(c => c.id === selected.giver) : null

  return (
    <div className="flex flex-1">
      {/* List */}
      <div className="w-[340px] border-r border-pda-border flex flex-col">
        <div className="panel-header px-3 py-2 text-xs flex justify-between">
          <span>Tasks</span>
          <span className="text-pda-muted">
            {tasks.filter(t => t.status === 'active').length} active
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {tasks.map(t => {
            const g = contacts.find(c => c.id === t.giver)
            const active = selected?.id === t.id
            return (
              <button
                key={t.id}
                onClick={() => selectTask(t.id)}
                className={`w-full text-left px-3 py-3 border-b border-pda-rule
                  ${active ? 'row-active' : 'row-hover'}`}
              >
                <div className="flex items-center gap-2">
                  {t.tracked && <span className="text-pda-amberHot text-xs">★</span>}
                  <span className={`text-xs uppercase tracking-widest
                    ${t.status === 'active' ? 'text-pda-amber'
                      : t.status === 'completed' ? 'text-pda-green' : 'text-pda-red'}`}>
                    {t.status}
                  </span>
                </div>
                <div className="text-pda-text mt-1 text-sm leading-snug">{t.title}</div>
                <div className="text-[10px] text-pda-muted mt-1 tracking-widest uppercase">
                  {g?.callsign} · <span className={factionClass[t.faction]}>{factionLabel[t.faction]}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="panel-header px-3 py-2 text-xs">Task brief</div>
        {selected ? (
          <div className="p-6 overflow-y-auto">
            <div className="text-pda-amberHot tracking-widest amber-glow text-lg">
              {selected.title.toUpperCase()}
            </div>
            <div className="text-pda-muted text-xs mt-1 tracking-widest">
              ISSUED BY {giver?.callsign ?? '???'} · <span className={factionClass[selected.faction]}>{factionLabel[selected.faction]}</span>
            </div>
            <div className="hr-amber my-4" />
            <p className="text-pda-text leading-relaxed">{selected.description}</p>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="panel-sunken p-3">
                <div className="text-[10px] text-pda-muted tracking-widest">REWARD</div>
                <div className="text-pda-amber mt-1">{selected.reward}</div>
              </div>
              <div className="panel-sunken p-3">
                <div className="text-[10px] text-pda-muted tracking-widest">TARGET</div>
                <div className="text-pda-text mt-1">
                  {selected.target
                    ? `N ${selected.target.lat.toFixed(4)} · E ${selected.target.lng.toFixed(4)}`
                    : '— unknown —'}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button className="btn-tac flex items-center gap-2"
                onClick={() => trackTask(selected.id, !selected.tracked)}>
                <IconStar size={14} />
                {selected.tracked ? 'Untrack' : 'Track'}
              </button>
              <button className="btn-tac flex items-center gap-2"
                disabled={!selected.target}
                onClick={() => {
                  if (selected.target) setMapFocus({ position: selected.target, zoom: 16 })
                  setTab('map')
                }}>
                <IconPin size={14} />
                Show on map
              </button>
              {selected.status === 'active' && (
                <button className="btn-tac flex items-center gap-2"
                  onClick={() => completeTask(selected.id)}>
                  <IconCheck size={14} />
                  Mark complete
                </button>
              )}
              {giver && (
                <button className="btn-tac" onClick={() => usePda.getState().openCompose(giver.id)}>
                  Message giver
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-pda-muted">No task selected.</div>
        )}
      </div>
    </div>
  )
}
