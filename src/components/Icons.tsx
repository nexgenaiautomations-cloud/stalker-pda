import React from 'react'

const I = ({ children, size = 18 }: { children: React.ReactNode; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
       stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter">
    {children}
  </svg>
)

export const IconMap = (p: { size?: number }) => (
  <I size={p.size}>
    <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z" />
    <path d="M9 4v14M15 6v14" />
  </I>
)

export const IconTasks = (p: { size?: number }) => (
  <I size={p.size}>
    <path d="M4 5h16v14H4z" />
    <path d="M7 9h10M7 13h10M7 17h6" />
  </I>
)

export const IconContacts = (p: { size?: number }) => (
  <I size={p.size}>
    <circle cx="9" cy="9" r="3" />
    <path d="M3 19c0-3 3-5 6-5s6 2 6 5" />
    <path d="M15 7h6M15 11h6M15 15h4" />
  </I>
)

export const IconMessages = (p: { size?: number }) => (
  <I size={p.size}>
    <path d="M3 5h18v12H7l-4 4V5z" />
    <path d="M7 9h10M7 13h6" />
  </I>
)

export const IconJournal = (p: { size?: number }) => (
  <I size={p.size}>
    <path d="M5 3h12l2 2v16H5z" />
    <path d="M8 7h8M8 11h8M8 15h6" />
  </I>
)

export const IconRadio = (p: { size?: number }) => (
  <I size={p.size}>
    <path d="M3 9h18v10H3z" />
    <path d="M3 9l13-4" />
    <circle cx="17" cy="14" r="2" />
    <path d="M6 14h6" />
  </I>
)

export const IconStats = (p: { size?: number }) => (
  <I size={p.size}>
    <path d="M4 20V8M10 20V4M16 20v-8M22 20V12" />
  </I>
)

export const IconPower = (p: { size?: number }) => (
  <I size={p.size}>
    <path d="M12 3v8" />
    <path d="M7.5 6.5a7 7 0 109 0" />
  </I>
)

export const IconSignal = (p: { size?: number }) => (
  <I size={p.size}>
    <path d="M3 20h2v-3H3zM8 20h2v-7H8zM13 20h2v-11h-2zM18 20h2V5h-2z" fill="currentColor" stroke="none"/>
  </I>
)

export const IconBattery = (p: { size?: number }) => (
  <I size={p.size}>
    <path d="M2 8h17v8H2z" />
    <path d="M20 11v2h2v-2z" fill="currentColor" stroke="none" />
    <path d="M4 10h11v4H4z" fill="currentColor" stroke="none" />
  </I>
)

export const IconPin = (p: { size?: number }) => (
  <I size={p.size}>
    <path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z" />
    <circle cx="12" cy="9" r="2.5" />
  </I>
)

export const IconSend = (p: { size?: number }) => (
  <I size={p.size}>
    <path d="M3 12l18-8-7 18-3-7-8-3z" />
  </I>
)

export const IconPlus = (p: { size?: number }) => (
  <I size={p.size}>
    <path d="M12 4v16M4 12h16" />
  </I>
)

export const IconTrash = (p: { size?: number }) => (
  <I size={p.size}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </I>
)

export const IconCheck = (p: { size?: number }) => (
  <I size={p.size}>
    <path d="M4 12l5 5 11-12" />
  </I>
)

export const IconStar = (p: { size?: number }) => (
  <I size={p.size}>
    <path d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
  </I>
)
