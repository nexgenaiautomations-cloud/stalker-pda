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

export function TopTabs() {
  const tab = usePda(s => s.tab)
  const setTab = usePda(s => s.setTab)
  const unread = usePda(s => s.messages.filter(m => !m.read && m.to === 'self').length)

  return (
    <nav className="flex overflow-x-auto border-b border-pda-border bg-pda-frame shrink-0">
      {ITEMS.map(({ id, label, Icon }) => {
        const active = tab === id
        const badge = id === 'messages' && unread > 0 ? unread : null
        return (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative shrink-0 flex flex-col items-center justify-center gap-0.5
              px-3 sm:px-4 py-1.5 sm:py-2 border-r border-pda-border
              text-[10px] tracking-[0.15em] uppercase transition-colors
              ${active
                ? 'text-pda-amberHot bg-[#241d10] amber-glow'
                : 'text-pda-muted hover:text-pda-amber hover:bg-pda-panel'}`}
            title={label}
          >
            <Icon size={18} />
            <span className="leading-none">{label}</span>
            {active && (
              <span className="absolute left-2 right-2 bottom-0 h-[2px] bg-pda-amber shadow-[0_0_6px_#ffb13b]" />
            )}
            {badge !== null && (
              <span className="absolute top-0.5 right-1 bg-pda-orange text-black text-[9px] px-1 leading-3 font-bold">
                {badge}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
