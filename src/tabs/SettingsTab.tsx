import { useEffect, useState } from 'react'
import { usePda } from '../store/pda'
import { canInstall, isInstalled, onInstallChange, triggerInstall } from '../pwa/install'

const LIVE_URL = 'https://stalker-pda.vercel.app'
const GH_URL = 'https://github.com/nexgenaiautomations-cloud/stalker-pda'

export function SettingsTab() {
  const { pdaId, player, knownPdas } = usePda()
  const [installable, setInstallable] = useState(canInstall())
  const [installed, setInstalled] = useState(isInstalled())
  const [copied, setCopied] = useState<string | null>(null)
  const [resetConfirm, setResetConfirm] = useState(false)

  useEffect(() => {
    return onInstallChange(() => {
      setInstallable(canInstall())
      setInstalled(isInstalled())
    })
  }, [])

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 1400)
    } catch { /* ignore */ }
  }

  const install = async () => {
    const r = await triggerInstall()
    if (r === 'unavailable') {
      alert('Install not available in this browser. On iOS: Share → Add to Home Screen. On Chrome/Edge: address-bar install icon.')
    }
  }

  const resetData = () => {
    if (!resetConfirm) { setResetConfirm(true); return }
    localStorage.removeItem('stalker-pda')
    location.reload()
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="panel-header px-3 py-2 text-xs">Settings</div>

      <div className="p-4 sm:p-6 space-y-6 max-w-2xl">

        {/* PWA install */}
        <section>
          <div className="text-[10px] tracking-[0.2em] text-pda-muted mb-2">PWA</div>
          <div className="panel-sunken p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-pda-amberHot tracking-widest amber-glow">
                  {installed ? 'INSTALLED' : 'INSTALL TO HOME SCREEN'}
                </div>
                <div className="text-pda-muted text-xs mt-1 leading-relaxed">
                  Run the PDA full-screen, offline-capable, like a native app.
                </div>
              </div>
              <button
                className="btn-tac whitespace-nowrap"
                onClick={install}
                disabled={installed}
              >
                {installed ? 'Active' : installable ? 'Install' : 'How to install'}
              </button>
            </div>
            {!installed && !installable && (
              <div className="mt-3 text-xs text-pda-muted leading-relaxed">
                <div><span className="text-pda-amber">iOS Safari:</span> Share → Add to Home Screen</div>
                <div><span className="text-pda-amber">Chrome / Edge desktop:</span> address-bar install icon</div>
                <div><span className="text-pda-amber">Android Chrome:</span> menu → Add to Home screen</div>
              </div>
            )}
          </div>
        </section>

        {/* Links */}
        <section>
          <div className="text-[10px] tracking-[0.2em] text-pda-muted mb-2">LINKS</div>
          <div className="space-y-2">
            <LinkRow label="Live PWA" url={LIVE_URL} onCopy={() => copy('live', LIVE_URL)} copied={copied === 'live'} />
            <LinkRow label="GitHub" url={GH_URL} onCopy={() => copy('gh', GH_URL)} copied={copied === 'gh'} />
          </div>
        </section>

        {/* Identity */}
        <section>
          <div className="text-[10px] tracking-[0.2em] text-pda-muted mb-2">DEVICE</div>
          <div className="panel-sunken p-4 text-xs space-y-1.5">
            <Row k="PDA ID" v={pdaId} />
            <Row k="Operator" v={player.callsign} />
            <Row k="Zone" v={player.zoneName} />
            <Row k="Position" v={`N ${player.position.lat.toFixed(4)} · E ${player.position.lng.toFixed(4)}`} />
            <Row k="Known remote PDAs" v={String(Object.keys(knownPdas).length)} />
          </div>
        </section>

        {/* Reset */}
        <section>
          <div className="text-[10px] tracking-[0.2em] text-pda-muted mb-2">DATA</div>
          <div className="panel-sunken p-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-pda-amber">Reset PDA</div>
              <div className="text-pda-muted text-xs mt-1">
                Clears all tasks, messages, journal, contacts back to seed.
              </div>
            </div>
            <button className="btn-tac" onClick={resetData}>
              {resetConfirm ? 'Tap again to confirm' : 'Reset'}
            </button>
          </div>
        </section>

        <div className="text-[10px] text-pda-dim tracking-widest text-center pt-4">
          PDA-3M · firmware 3.21.7-anomaly · v0.1
        </div>
      </div>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-pda-muted uppercase tracking-widest text-[10px]">{k}</span>
      <span className="text-pda-text break-all text-right">{v}</span>
    </div>
  )
}

function LinkRow({ label, url, onCopy, copied }: { label: string; url: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="panel-sunken p-3 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="text-[10px] tracking-widest text-pda-muted">{label.toUpperCase()}</div>
        <a href={url} target="_blank" rel="noreferrer"
           className="text-pda-amber amber-glow hover:text-pda-amberHot break-all text-sm">
          {url}
        </a>
      </div>
      <button className="btn-tac shrink-0" onClick={onCopy}>{copied ? 'Copied' : 'Copy'}</button>
    </div>
  )
}
