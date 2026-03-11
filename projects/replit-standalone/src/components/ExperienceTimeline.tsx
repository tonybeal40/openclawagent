export type ExperienceItem = {
  company: string
  role: string
  period: string
  summary: string
}

type ExperienceTimelineProps = {
  items: ExperienceItem[]
}

export function ExperienceTimeline({ items }: ExperienceTimelineProps) {
  return (
    <div className="timeline">
      {items.map((item) => (
        <article key={item.company} className="timeline-item">
          <div className="timeline-item__rail" aria-hidden="true">
            <span />
          </div>
          <div className="timeline-item__content">
            <div className="timeline-item__topline">
              <p>{item.period}</p>
              <h3>{item.company}</h3>
            </div>
            <h4>{item.role}</h4>
            <p>{item.summary}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
