import { useEffect, useMemo, useRef, useState } from 'react'
import { usePda, factionClass, factionLabel } from '../store/pda'
import { IconSend } from '../components/Icons'
import { sendToPda } from '../net/pdaNetwork'

function fmtClock(ts: number) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function MessagesTab() {
  const {
    contacts, messages, composeTo, openCompose, addMessage, markMessagesRead,
    knownPdas, pdaId, player
  } = usePda()

  const threads = useMemo(() => {
    const m = new Map<string, { id: string; label: string; faction?: string; remote?: boolean; lastTs: number; unread: number }>()
    contacts.forEach(c => {
      const cm = messages.filter(x => x.from === c.id || x.to === c.id)
      if (cm.length > 0) {
        const lastTs = Math.max(...cm.map(x => x.ts))
        const unread = cm.filter(x => !x.read && x.to === 'self').length
        m.set(c.id, { id: c.id, label: c.callsign, faction: c.faction, lastTs, unread })
      }
    })
    Object.entries(knownPdas).forEach(([id, info]) => {
      const cm = messages.filter(x => x.from === id || x.to === id)
      const lastTs = cm.length ? Math.max(...cm.map(x => x.ts)) : info.lastSeen
      const unread = cm.filter(x => !x.read && x.to === 'self').length
      m.set(id, { id, label: info.callsign + ' [pda]', faction: info.faction, remote: true, lastTs, unread })
    })
    return Array.from(m.values()).sort((a, b) => b.lastTs - a.lastTs)
  }, [contacts, messages, knownPdas])

  const activeId = composeTo ?? threads[0]?.id ?? null
  const active = activeId ? (contacts.find(c => c.id === activeId) ?? (knownPdas[activeId] ? { id: activeId, callsign: knownPdas[activeId].callsign, faction: knownPdas[activeId].faction, remote: true } : null)) : null
  const isRemote = active && 'remote' in active && (active as any).remote

  const thread = useMemo(() => {
    if (!activeId) return []
    return messages.filter(m => m.from === activeId || m.to === activeId).sort((a, b) => a.ts - b.ts)
  }, [messages, activeId])

  useEffect(() => { if (activeId) markMessagesRead(activeId) }, [activeId, markMessagesRead])

  const [text, setText] = useState('')
  const scroll = useRef<HTMLDivElement>(null)
  useEffect(() => {
    scroll.current?.scrollTo({ top: scroll.current.scrollHeight })
  }, [thread.length])

  const send = () => {
    if (!text.trim() || !activeId) return
    addMessage({ from: 'self', to: activeId, text: text.trim() })
    if (isRemote) {
      sendToPda(activeId, { kind: 'msg', from: pdaId, callsign: player.callsign, faction: player.faction, text: text.trim() })
    } else {
      // simulated NPC auto-reply
      const c = contacts.find(x => x.id === activeId)
      if (c) {
        setTimeout(() => {
          const replies = [
            'Copy that, stalker.',
            'Roger. Watch your back.',
            'I\'ll mark it on my PDA.',
            'Acknowledged. Out.',
            'Understood. Sending coordinates.',
            'Get to me when you can.'
          ]
          addMessage({ from: c.id, to: 'self', text: replies[Math.floor(Math.random() * replies.length)] })
        }, 900 + Math.random() * 1200)
      }
    }
    setText('')
  }

  return (
    <div className="flex flex-1">
      <div className="w-[300px] border-r border-pda-border flex flex-col">
        <div className="panel-header px-3 py-2 text-xs flex justify-between">
          <span>Threads</span>
          <span className="text-pda-muted">{threads.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 && <div className="p-4 text-pda-muted text-xs">No threads.</div>}
          {threads.map(t => {
            const a = activeId === t.id
            return (
              <button key={t.id} onClick={() => openCompose(t.id)}
                className={`w-full text-left px-3 py-3 border-b border-pda-rule
                  ${a ? 'row-active' : 'row-hover'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${t.faction ? factionClass[t.faction as keyof typeof factionClass] : 'text-pda-text'}`}>{t.label}</span>
                  {t.unread > 0 && <span className="bg-pda-orange text-black text-[9px] px-1.5 leading-3 font-bold">{t.unread}</span>}
                </div>
                <div className="text-[10px] text-pda-muted tracking-widest mt-0.5">{fmtClock(t.lastTs)}</div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="panel-header px-3 py-2 text-xs flex justify-between">
          <span>
            {active ? (active as any).callsign : '— Select a thread —'}
            {active && !isRemote && (
              <span className={`ml-2 ${factionClass[(active as any).faction as keyof typeof factionClass]}`}>
                · {factionLabel[(active as any).faction as keyof typeof factionLabel]}
              </span>
            )}
            {isRemote && <span className="ml-2 text-pda-amber">· remote PDA</span>}
          </span>
          <span className="text-pda-muted">
            uplink {isRemote ? 'P2P' : 'NPC-sim'}
          </span>
        </div>
        <div ref={scroll} className="flex-1 overflow-y-auto p-4 space-y-3">
          {thread.map(m => {
            const mine = m.from === 'self'
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-3 py-2 border text-sm
                  ${mine
                    ? 'border-pda-borderHot bg-[#2a200d] text-pda-text'
                    : 'border-pda-rule bg-pda-panel-sunken text-pda-text'}`}>
                  <div className="text-[10px] text-pda-muted tracking-widest mb-1">
                    {mine ? 'YOU' : (active ? (active as any).callsign : '???')} · {fmtClock(m.ts)}
                    {m.remote && <span className="text-pda-amber ml-1">· remote</span>}
                  </div>
                  <div>{m.text}</div>
                </div>
              </div>
            )
          })}
          {thread.length === 0 && activeId && (
            <div className="text-pda-muted text-xs">No messages yet. Send something.</div>
          )}
        </div>
        <div className="border-t border-pda-border p-2 flex gap-2 bg-pda-panel">
          <input
            disabled={!activeId}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send() }}
            placeholder={activeId ? 'Transmit...' : 'Select a thread first'}
            className="flex-1 text-sm"
          />
          <button className="btn-tac flex items-center gap-2" disabled={!activeId || !text.trim()} onClick={send}>
            <IconSend size={14} /> Send
          </button>
        </div>
      </div>
    </div>
  )
}
