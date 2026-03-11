export type ResultItem = string

type ResultsSectionProps = {
  items: ResultItem[]
}

export function ResultsSection({ items }: ResultsSectionProps) {
  return (
    <div className="results-panel">
      <div className="results-panel__summary">
        <p className="section-eyebrow">Operational outcomes</p>
        <h3>Commercial teams perform better when the operating model is visible, measured, and repeatable.</h3>
        <p>
          Tony&apos;s focus is practical: stronger pipeline discipline, cleaner reporting, and better GTM coordination
          across leaders and frontline teams.
        </p>
      </div>

      <ul className="results-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
