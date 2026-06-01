// Captures the browser's beforeinstallprompt event so the Settings tab can
// programmatically trigger PWA install. Notifies listeners via a window event.

type BIPEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BIPEvent | null = null
let installed = false

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as BIPEvent
    window.dispatchEvent(new Event('pda-install-changed'))
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    installed = true
    window.dispatchEvent(new Event('pda-install-changed'))
  })
}

export function canInstall() {
  return deferred !== null
}

export function isInstalled() {
  if (installed) return true
  if (typeof window === 'undefined') return false
  // standalone heuristics
  // @ts-ignore
  const standaloneIOS = window.navigator.standalone === true
  const standaloneMQ = window.matchMedia?.('(display-mode: standalone)').matches
  return Boolean(standaloneIOS || standaloneMQ)
}

export async function triggerInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferred) return 'unavailable'
  try {
    await deferred.prompt()
    const choice = await deferred.userChoice
    if (choice.outcome === 'accepted') {
      deferred = null
      window.dispatchEvent(new Event('pda-install-changed'))
    }
    return choice.outcome
  } catch {
    return 'unavailable'
  }
}

export function onInstallChange(cb: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('pda-install-changed', cb)
  return () => window.removeEventListener('pda-install-changed', cb)
}
