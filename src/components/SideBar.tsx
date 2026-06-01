import { usePda, Tab } from '../store/pda'
import {
  IconMap, IconTasks, IconContacts, IconMessages,
  IconJournal, IconRadio, IconStats, IconPower
} from './Icons'

interface Item { id: Tab; label: string; Icon: React.FC<{ size?: number }> }

const ITEMS: Item[] = [
  { id: 'map', label: 'Map', Icon: IconMap },
  { id: 'tasks', label: 'Tasks', Icon: IconTasks },
  { id: 'contacts', label: 'Contacts', Icon: IconContacts },
  { id: 'messages', label: 'Messages', Icon: IconMessages },
  { id: 'journal', label: 'Journal', Icon: IconJournal },
  { id: 'radio', label: 'Radio', Icon: IconRadio },
  { id: 'stats', label: 'Stats', Icon: IconStats },
  { id: 'settings', label: 'Setup', Icon: IconPower }
]

export function SideBar() {
  const tab = usePda(s => s.tab)
  const setTab = usePda(s => s.setTab)
  const messages = usePda(s => s.messages)
  const unread = messages.filter(m => !m.read && m.to === 'self').length

  return (
    <aside
      className="pda-side shrink-0 flex flex-col border-r border-pda-border bg-pda-frame overflow-y-auto"
    >
      {ITEMS.map(({ id, label, Icon }) => {
        const active = tab === id
        const badge = id === 'messages' && unread > 0 ? unread : null
        return (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative flex flex-col items-center justify-center gap-0.5 sm:gap-1 py-2.5 sm:py-3
              text-[9px] sm:text-[10px] tracking-[0.15em] uppercase border-b border-pda-border
              transition-colors
              ${active
                ? 'text-pda-amberHot bg-[#241d10] amber-glow'
                : 'text-pda-muted hover:text-pda-amber hover:bg-pda-panel'}`}
            title={label}
          >
            <Icon size={20} />
            <span className="leading-none">{label}</span>
            {active && (
              <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-pda-amber shadow-[0_0_8px_#ffb13b]" />
            )}
            {badge !== null && (
              <span className="absolute top-1 right-1 sm:right-2 bg-pda-orange text-black text-[9px] px-1 leading-3 font-bold">
                {badge}
              </span>
            )}
          </button>
        )
      })}
      <div className="mt-auto p-2 text-[9px] text-pda-dim text-center border-t border-pda-border">
        v3.21
      </div>
    </aside>
  )
}
