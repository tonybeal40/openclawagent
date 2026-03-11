export type AvailabilityStatus = 'Online' | 'Focus' | 'In Review' | 'Away'

export type AvailabilityItem = {
  name: string
  role: string
  status: AvailabilityStatus
  detail: string
}

export type QuickStat = {
  label: string
  value: string
}

type OfficeSidebarProps = {
  availability: AvailabilityItem[]
  stats: QuickStat[]
}

export function OfficeSidebar({ availability, stats }: OfficeSidebarProps) {
  return (
    <aside className="office-sidebar">
      <div className="sidebar-panel">
        <header className="sidebar-panel__header">
          <p className="eyebrow">Office Panel</p>
          <h2>Team Availability</h2>
        </header>
        <div className="availability-list">
          {availability.map((member) => (
            <article key={member.name} className="availability-card">
              <div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
              <span className={`availability-pill status-${member.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {member.status}
              </span>
              <small>{member.detail}</small>
            </article>
          ))}
        </div>
      </div>

      <div className="sidebar-panel">
        <header className="sidebar-panel__header">
          <p className="eyebrow">Snapshot</p>
          <h2>Quick Stats</h2>
        </header>
        <div className="stats-grid">
          {stats.map((stat) => (
            <article key={stat.label} className="stat-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </div>
      </div>
    </aside>
  )
}
