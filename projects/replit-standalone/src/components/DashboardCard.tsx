export type PriorityLevel = 'Low' | 'Med' | 'High'

export type MissionCard = {
  id: string
  title: string
  owner: string
  priority: PriorityLevel
  dueDate: string
}

type DashboardCardProps = {
  card: MissionCard
}

export function DashboardCard({ card }: DashboardCardProps) {
  return (
    <article className="mission-card">
      <div className="mission-card__top">
        <span className={`priority-badge priority-${card.priority.toLowerCase()}`}>{card.priority}</span>
        <span className="due-chip">Due {card.dueDate}</span>
      </div>
      <h3>{card.title}</h3>
      <div className="mission-card__footer">
        <div className="owner-avatar" aria-label={`Owner ${card.owner}`}>
          {card.owner}
        </div>
        <span className="owner-caption">Owner</span>
      </div>
    </article>
  )
}
