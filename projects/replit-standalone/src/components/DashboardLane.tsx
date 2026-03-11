import type { ReactNode } from 'react'

import type { MissionCard } from './DashboardCard'

export type LaneDefinition = {
  id: string
  title: string
  accent: string
  cards: MissionCard[]
}

type DashboardLaneProps = {
  lane: LaneDefinition
  children: ReactNode
}

export function DashboardLane({ lane, children }: DashboardLaneProps) {
  return (
    <section className={`lane-column ${lane.accent}`}>
      <header className="lane-column__header">
        <div>
          <h2>{lane.title}</h2>
          <p>{lane.cards.length} cards</p>
        </div>
        <span className="lane-column__count">{lane.cards.length}</span>
      </header>
      <div className="lane-column__cards">{children}</div>
    </section>
  )
}
