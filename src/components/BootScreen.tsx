import { useEffect, useState } from 'react'
import { usePda } from '../store/pda'

const LINES = [
  '> bios v3.21  loaded',
  '> integrity check ........... OK',
  '> memory bank A ............ 4096 KB',
  '> memory bank B ............ 4096 KB',
  '> battery cell .............. 84%',
  '> GPS uplink ................ acquired',
  '> radio modem ............... locked  119.4 MHz',
  '> faction handshake ......... [LONERS]',
  '> psy-shield filter ......... nominal',
  '> last sync ................. 03:17 ago',
  '> mounting /zone/cordon ..... OK',
  '> handshake operator ........ [SIDOROVICH]',
  '> launching personal digital assistant ...',
]

export function BootScreen() {
  const setBooted = usePda(s => s.setBooted)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (step >= LINES.length) {
      const t = setTimeout(() => setBooted(true), 350)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStep(s => s + 1), 110 + Math.random() * 90)
    return () => clearTimeout(t)
  }, [step, setBooted])

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col p-6 font-mono text-pda-amber pda-screen scanlines vignette">
      <div className="text-pda-amberHot text-2xl tracking-[0.3em] amber-glow">
        PDA-3M / FIELD UNIT
      </div>
      <div className="text-pda-muted text-xs mt-1 tracking-widest">
        ZONE OPERATIONS HANDHELD · firmware 3.21.7-anomaly
      </div>
      <div className="hr-amber my-3" />
      <div className="flex-1 text-pda-text text-sm leading-6">
        {LINES.slice(0, step).map((l, i) => (
          <div key={i} className="amber-glow">
            <span className="text-pda-amber">{l}</span>
          </div>
        ))}
        {step < LINES.length && (
          <div className="text-pda-amberHot">
            {LINES[step]}<span className="animate-blip">_</span>
          </div>
        )}
      </div>
      <div className="text-pda-muted text-xs tracking-widest mt-3">
        © Spektrum Defense Systems / Repurposed Civilian Unit / Property of THE ZONE
      </div>
    </div>
  )
}
