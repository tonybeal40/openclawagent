export type ExpertiseItem = {
  title: string
  description: string
}

type ExpertiseGridProps = {
  items: ExpertiseItem[]
}

export function ExpertiseGrid({ items }: ExpertiseGridProps) {
  return (
    <div className="expertise-grid">
      {items.map((item) => (
        <article key={item.title} className="info-card">
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </article>
      ))}
    </div>
  )
}
