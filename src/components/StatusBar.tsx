import { useEffect, useState } from 'react'
import { usePda, rankLabel, factionLabel } from '../store/pda'
import { IconBattery, IconSignal } from './Icons'

function fmtTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10).replace(/-/g, '.')
}

export function StatusBar() {
  const player = usePda(s => s.player)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(i)
  }, [])

  return (
    <div className="pda-statusbar flex items-center px-2 sm:px-3 text-[10px] sm:text-xs tracking-widest border-b border-pda-border bg-gradient-to-b from-[#1f1a10] to-[#15110a]">
      <div className="text-pda-amber amber-glow flex items-center gap-1.5 sm:gap-3 min-w-0">
        <span className="text-pda-amberHot">PDA-3M</span>
        <span className="text-pda-muted hidden sm:inline">|</span>
        <span className="truncate max-w-[120px] sm:max-w-none">{player.callsign}</span>
        <span className="text-pda-muted hidden md:inline">·</span>
        <span className="hidden md:inline">{rankLabel[player.rank]}</span>
        <span className="text-pda-muted hidden md:inline">·</span>
        <span className="hidden md:inline">{factionLabel[player.faction]}</span>
      </div>
      <div className="flex-1 text-center text-pda-text hidden md:block">
        <span className="text-pda-muted">ZONE://</span>
        <span className="text-pda-amber amber-glow">{player.zoneName.toUpperCase()}</span>
        <span className="text-pda-muted ml-3 hidden lg:inline">N {player.position.lat.toFixed(4)}</span>
        <span className="text-pda-muted ml-2 hidden lg:inline">E {player.position.lng.toFixed(4)}</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-3 ml-auto">
        <span className="text-pda-text hidden sm:inline">{fmtDate(now)}</span>
        <span className="text-pda-amber amber-glow">{fmtTime(now)}</span>
        <span className="flex items-center gap-1 text-pda-text hidden sm:flex"><IconSignal size={14} /> 4</span>
        <span className="flex items-center gap-1 text-pda-text"><IconBattery size={16} /> 84%</span>
      </div>
    </div>
  )
}
