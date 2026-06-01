import { useEffect } from 'react'
import { usePda, Faction } from '../store/pda'

type Envelope =
  | { kind: 'hello'; from: string; callsign: string; faction: Faction }
  | { kind: 'bye'; from: string }
  | { kind: 'msg'; from: string; to?: string; callsign: string; faction: Faction; text: string }

const CH_NAME = 'stalker-pda-net'

let bc: BroadcastChannel | null = null

export function getChannel() {
  if (!bc) bc = new BroadcastChannel(CH_NAME)
  return bc
}

export function sendToPda(to: string, env: Envelope) {
  try {
    const ch = getChannel()
    ch.postMessage({ ...env, to })
  } catch (e) {
    console.warn('PDA net send failed', e)
  }
}

export function broadcast(env: Envelope) {
  try {
    getChannel().postMessage(env)
  } catch (e) { console.warn('PDA net broadcast failed', e) }
}

export function usePdaNetwork() {
  const pdaId = usePda(s => s.pdaId)
  const player = usePda(s => s.player)
  const registerPda = usePda(s => s.registerPda)
  const addMessage = usePda(s => s.addMessage)

  useEffect(() => {
    const ch = getChannel()
    // announce
    broadcast({ kind: 'hello', from: pdaId, callsign: player.callsign, faction: player.faction })

    const heartbeat = setInterval(() => {
      broadcast({ kind: 'hello', from: pdaId, callsign: player.callsign, faction: player.faction })
    }, 5000)

    const onMsg = (ev: MessageEvent<Envelope & { to?: string }>) => {
      const env = ev.data
      if (!env || env.from === pdaId) return
      if (env.kind === 'hello') {
        registerPda(env.from, { callsign: env.callsign, faction: env.faction })
        // respond once so the new joiner sees us
        broadcast({ kind: 'hello', from: pdaId, callsign: player.callsign, faction: player.faction })
        return
      }
      if (env.kind === 'msg') {
        if (env.to && env.to !== pdaId) return
        registerPda(env.from, { callsign: env.callsign, faction: env.faction })
        addMessage({ from: env.from, to: 'self', text: env.text, remote: true })
        return
      }
    }
    ch.addEventListener('message', onMsg)

    const onUnload = () => broadcast({ kind: 'bye', from: pdaId })
    window.addEventListener('beforeunload', onUnload)

    return () => {
      ch.removeEventListener('message', onMsg)
      clearInterval(heartbeat)
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [pdaId, player.callsign, player.faction, registerPda, addMessage])
}
