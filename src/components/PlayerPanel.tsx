import { usePda, rankLabel, factionLabel, factionClass } from '../store/pda'

function Bar({ label, value, danger = false, max = 100 }: { label: string; value: number; danger?: boolean; max?: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[10px] tracking-widest uppercase mb-1">
        <span className="text-pda-muted">{label}</span>
        <span className={danger ? 'text-pda-red' : 'text-pda-text'}>{Math.round(value)}</span>
      </div>
      <div className="stat-bar">
        <span style={{ width: `${pct}%`, background: danger ? 'linear-gradient(90deg,#ff8a3b,#ff3a2b)' : undefined }} />
      </div>
    </div>
  )
}

export function PlayerPanel() {
  const player = usePda(s => s.player)
  return (
    <aside className="w-[260px] shrink-0 flex flex-col border-l border-pda-border bg-pda-panel">
      <div className="panel-header px-3 py-2 text-xs">Operator</div>
      <div className="p-3 border-b border-pda-rule">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 border border-pda-borderHot bg-pda-panel2 grid place-items-center text-pda-amber text-xl amber-glow">
            {player.callsign.slice(0, 1)}
          </div>
          <div>
            <div className="text-pda-amberHot tracking-widest amber-glow text-sm">{player.callsign}</div>
            <div className={`text-xs ${factionClass[player.faction]}`}>{factionLabel[player.faction]}</div>
            <div className="text-pda-muted text-xs">{rankLabel[player.rank]}</div>
          </div>
        </div>
        <div className="flex justify-between mt-3 text-xs">
          <span className="text-pda-muted">Reputation</span>
          <span className="text-pda-text">{player.reputation > 0 ? '+' : ''}{player.reputation}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-pda-muted">Funds</span>
          <span className="text-pda-amber">{player.rubles.toLocaleString()} RU</span>
        </div>
      </div>

      <div className="p-3 border-b border-pda-rule">
        <div className="text-[10px] tracking-[0.2em] text-pda-muted mb-2">VITALS</div>
        <Bar label="Health" value={player.health} danger={player.health < 30} />
        <Bar label="Stamina" value={player.stamina} />
        <Bar label="Radiation" value={player.radiation} danger={player.radiation > 30} />
        <Bar label="Bleeding" value={player.bleeding} danger={player.bleeding > 0} />
        <Bar label="Psy" value={player.psy} danger={player.psy > 50} />
      </div>

      <div className="p-3 border-b border-pda-rule">
        <div className="text-[10px] tracking-[0.2em] text-pda-muted mb-2">CONDITION</div>
        <Bar label="Hunger" value={100 - player.hunger} />
        <Bar label="Thirst" value={100 - player.thirst} />
        <Bar label="Rest" value={100 - player.sleep} />
      </div>

      <div className="p-3 text-xs text-pda-muted">
        <div className="flex justify-between"><span>Coordinates</span></div>
        <div className="text-pda-text mt-1 amber-glow">
          N {player.position.lat.toFixed(5)}<br />
          E {player.position.lng.toFixed(5)}
        </div>
        <div className="flex justify-between mt-3"><span>Heading</span><span className="text-pda-text">{player.heading.toFixed(0)}°</span></div>
      </div>
    </aside>
  )
}
