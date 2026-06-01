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
    <div className="w-screen h-screen flex items-center justify-center bg-black p-2 sm:p-6">
      {/* Outer device frame */}
      <div className="relative w-full h-full max-w-[1400px] max-h-[900px]
                      rounded-md bg-pda-frame border border-pda-borderHot/40
                      shadow-[0_0_60px_rgba(255,160,60,0.08)]">
        {/* Inner bezel */}
        <div className="absolute inset-3 rounded-sm border border-pda-border bg-pda-bg overflow-hidden pda-screen scanlines vignette animate-flicker">
          {!booted && <BootScreen />}
          {booted && (
            <div className="flex flex-col h-full">
              <StatusBar />
              <div className="flex flex-1 overflow-hidden">
                <SideBar />
                <main className="flex-1 overflow-hidden flex flex-col relative">
                  {tab === 'map' && <MapTab />}
                  {tab === 'tasks' && <TasksTab />}
                  {tab === 'contacts' && <ContactsTab />}
                  {tab === 'messages' && <MessagesTab />}
                  {tab === 'journal' && <JournalTab />}
                  {tab === 'radio' && <RadioTab />}
                  {tab === 'stats' && <StatsTab />}
                </main>
                <PlayerPanel />
              </div>
            </div>
          )}
        </div>
        {/* Frame screws */}
        <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-pda-borderHot/30" />
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pda-borderHot/30" />
        <span className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-pda-borderHot/30" />
        <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-pda-borderHot/30" />
      </div>
    </div>
  )
}
