import { useEffect } from 'react'
import { usePda } from './store/pda'
import { BootScreen } from './components/BootScreen'
import { StatusBar } from './components/StatusBar'
import { SideBar } from './components/SideBar'
import { PlayerPanel } from './components/PlayerPanel'
import { MapTab } from './tabs/MapTab'
import { TasksTab } from './tabs/TasksTab'
import { ContactsTab } from './tabs/ContactsTab'
import { MessagesTab } from './tabs/MessagesTab'
import { JournalTab } from './tabs/JournalTab'
import { RadioTab } from './tabs/RadioTab'
import { StatsTab } from './tabs/StatsTab'
import { SettingsTab } from './tabs/SettingsTab'
import { usePdaNetwork } from './net/pdaNetwork'

export default function App() {
  const booted = usePda(s => s.booted)
  const tab = usePda(s => s.tab)
  usePdaNetwork()

  // simulated incoming chatter
  useEffect(() => {
    if (!booted) return
    const i = setInterval(() => {
      // small random ambient effect — wobble heading slightly
      const player = usePda.getState().player
      usePda.getState().setPlayerPos(player.position, (player.heading + (Math.random() - 0.5) * 4 + 360) % 360)
    }, 4000)
    return () => clearInterval(i)
  }, [booted])

  return (
    <div className="pda-viewport">
      <div className="pda-frame">
        <div className="pda-bezel pda-screen scanlines vignette animate-flicker bg-pda-bg">
          {!booted && <BootScreen />}
          {booted && (
            <div className="flex flex-col h-full">
              <StatusBar />
              <div className="flex flex-1 overflow-hidden">
                <SideBar />
                <main className="flex-1 overflow-hidden flex flex-col relative min-w-0">
                  {tab === 'map' && <MapTab />}
                  {tab === 'tasks' && <TasksTab />}
                  {tab === 'contacts' && <ContactsTab />}
                  {tab === 'messages' && <MessagesTab />}
                  {tab === 'journal' && <JournalTab />}
                  {tab === 'radio' && <RadioTab />}
                  {tab === 'stats' && <StatsTab />}
                  {tab === 'settings' && <SettingsTab />}
                </main>
                <div className="hidden lg:flex">
                  <PlayerPanel />
                </div>
              </div>
            </div>
          )}
        </div>
        <span className="pda-screw" style={{ top: 4, left: 4 }} />
        <span className="pda-screw" style={{ top: 4, right: 4 }} />
        <span className="pda-screw" style={{ bottom: 4, left: 4 }} />
        <span className="pda-screw" style={{ bottom: 4, right: 4 }} />
      </div>
    </div>
  )
}
