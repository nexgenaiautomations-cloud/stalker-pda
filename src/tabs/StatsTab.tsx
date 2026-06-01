import { usePda, rankLabel, factionLabel } from '../store/pda'

const stat = (label: string, value: string | number) => (
  <div className="panel-sunken px-3 py-2 flex justify-between">
    <span className="text-pda-muted tracking-widest text-[10px] uppercase">{label}</span>
    <span className="text-pda-text">{value}</span>
  </div>
)

export function StatsTab() {
  const { player, tasks, messages, journal, contacts } = usePda()
  const completed = tasks.filter(t => t.status === 'completed').length
  const active = tasks.filter(t => t.status === 'active').length
  const knownFactions = new Set(contacts.map(c => c.faction)).size

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="panel-header px-3 py-2 text-xs">Ranking & Stats</div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {stat('Callsign', player.callsign)}
        {stat('Faction', factionLabel[player.faction])}
        {stat('Rank', rankLabel[player.rank])}
        {stat('Reputation', player.reputation > 0 ? '+' + player.reputation : player.reputation)}
        {stat('Funds', `${player.rubles.toLocaleString()} RU`)}
        {stat('Zone', player.zoneName)}
      </div>

      <div className="text-[10px] text-pda-muted tracking-[0.2em] mt-6">OPERATIONAL</div>
      <div className="grid grid-cols-2 gap-3 mt-2">
        {stat('Tasks · active', active)}
        {stat('Tasks · completed', completed)}
        {stat('Journal entries', journal.length)}
        {stat('Messages', messages.length)}
        {stat('Known contacts', contacts.length)}
        {stat('Known factions', knownFactions)}
      </div>

      <div className="text-[10px] text-pda-muted tracking-[0.2em] mt-6">VITALS SNAPSHOT</div>
      <div className="grid grid-cols-2 gap-3 mt-2">
        {stat('Health', `${player.health}%`)}
        {stat('Stamina', `${player.stamina}%`)}
        {stat('Radiation', `${player.radiation}%`)}
        {stat('Psy', `${player.psy}%`)}
      </div>
    </div>
  )
}
