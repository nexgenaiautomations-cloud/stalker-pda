import { useEffect, useMemo, useRef, useState } from 'react'
import { usePda, factionClass, factionLabel } from '../store/pda'

const CHATTER: Record<string, string[]> = {
  r1: [
    '... a flash near the radar. Avoid the area ...',
    '... Bloodsucker pack tracked west of the swamps ...',
    '... emission incoming. Twelve hours.  ...'
  ],
  r2: [
    '... fresh job at Sidorovich. Decent pay ...',
    '... rookies trading shotgun shells, two-for-one ...',
    '... stash dropped at the broken truck, hurry ...'
  ],
  r3: [
    '... patrol Bravo report. Three contacts. Engaging ...',
    '... general Voronin requests sitrep ...',
    '... mutant cull at Rostok scheduled 04:00 ...'
  ],
  r4: [
    '... freedom forever. Crank the volume ...',
    '... another duty convoy gets it tonight ...',
    '... Lukash on the mic. Stand tall ...'
  ],
  r5: [
    'beep. beep. beep. ... data burst received ...',
    'telemetry nominal. anomaly density: rising ...',
    'beep. beep. carrier hold ...'
  ],
  r6: [
    '... the path is bright ...',
    '... walk into the light ...',
    '... silence is the answer ...'
  ]
}

export function RadioTab() {
  const { stations, activeStationId, setActiveStation } = usePda()
  const active = stations.find(s => s.id === activeStationId) ?? null

  // ticker for chatter
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!active) return
    const i = setInterval(() => setTick(t => t + 1), 3200)
    return () => clearInterval(i)
  }, [active])

  const log = useMemo(() => {
    if (!active) return []
    const pool = CHATTER[active.id] ?? ['... static ...']
    const out: string[] = []
    for (let i = 0; i < 8; i++) {
      out.push(pool[(tick + i) % pool.length])
    }
    return out
  }, [tick, active])

  // visualizer
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!; let raf = 0
    const draw = () => {
      const W = c.width = c.clientWidth, H = c.height = c.clientHeight
      ctx.clearRect(0, 0, W, H)
      ctx.strokeStyle = '#ffb13b'
      ctx.lineWidth = 1.4
      ctx.beginPath()
      const baseAmp = active ? 12 : 3
      for (let x = 0; x < W; x++) {
        const y = H / 2 +
          Math.sin(x * 0.06 + Date.now() * 0.005) * baseAmp +
          Math.sin(x * 0.21 + Date.now() * 0.011) * baseAmp * 0.5 +
          (Math.random() - 0.5) * (active ? 4 : 1)
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.stroke()
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [active])

  return (
    <div className="flex flex-1">
      <div className="w-[300px] border-r border-pda-border flex flex-col">
        <div className="panel-header px-3 py-2 text-xs flex justify-between">
          <span>Frequencies</span>
          <span className="text-pda-muted">{stations.length} ch</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {stations.map(s => {
            const a = activeStationId === s.id
            return (
              <button key={s.id} onClick={() => setActiveStation(a ? null : s.id)}
                className={`w-full text-left px-3 py-3 border-b border-pda-rule
                  ${a ? 'row-active' : 'row-hover'}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${a ? 'bg-pda-amberHot animate-blip' : 'bg-pda-dim'}`} />
                  <span className="text-pda-amber tracking-widest">{s.freq} MHz</span>
                </div>
                <div className={`text-sm mt-1 ${s.faction ? factionClass[s.faction] : 'text-pda-text'}`}>{s.name}</div>
                {s.faction && (
                  <div className="text-[10px] text-pda-muted tracking-widest mt-0.5">
                    {factionLabel[s.faction]} channel
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="panel-header px-3 py-2 text-xs">Radio</div>
        <div className="p-4 border-b border-pda-rule">
          <div className="text-[10px] text-pda-muted tracking-widest">NOW TUNED</div>
          <div className="text-pda-amberHot text-2xl tracking-widest amber-glow mt-1">
            {active ? `${active.freq} MHz` : '— OFFLINE —'}
          </div>
          <div className={`text-sm mt-1 ${active?.faction ? factionClass[active.faction] : 'text-pda-text'}`}>
            {active ? active.name : 'No carrier'}
          </div>
          <div className="text-pda-muted text-xs mt-1">{active?.description}</div>
          <div className="mt-3 h-20 border border-pda-rule bg-pda-bg">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>
          <div className="flex gap-2 mt-3">
            <button className="btn-tac" disabled={!active} onClick={() => setActiveStation(null)}>
              {active ? 'Off' : 'Standby'}
            </button>
            <div className="ml-auto text-[10px] text-pda-muted tracking-widest self-center">
              signal {active ? 'NOMINAL' : '—'}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
          {active ? log.map((l, i) => (
            <div key={i} className="text-pda-text mb-1 amber-glow">
              <span className="text-pda-muted">[{String(i).padStart(2, '0')}]</span> {l}
            </div>
          )) : (
            <div className="text-pda-muted text-xs">Select a frequency to listen.</div>
          )}
        </div>
      </div>
    </div>
  )
}
