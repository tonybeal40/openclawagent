const metrics = [
  { value: 'RevOps', label: 'Strategy, systems, and process alignment' },
  { value: 'Forecasting', label: 'Operational rigor for predictable growth' },
  { value: 'Enablement', label: 'Better execution from frontline teams' },
]

export function HeroSection() {
  return (
    <section id="home" className="hero-section">
      <div className="hero-copy">
        <p className="section-eyebrow">TonyBeal.net</p>
        <h1>Revenue operations leadership that turns process into growth leverage.</h1>
        <p className="hero-copy__lead">
          Tony Beal helps organizations tighten GTM systems, improve forecast confidence, and build sales operations
          that support execution instead of slowing it down.
        </p>
        <div className="hero-actions">
          <a className="button button--primary" href="#contact">
            Start a conversation
          </a>
          <a className="button button--secondary" href="#results">
            View results
          </a>
        </div>
      </div>

      <aside className="hero-panel" aria-label="Positioning summary">
        <p className="hero-panel__label">Positioning</p>
        <h2>RevOps, Sales Ops, and business development with an operator&apos;s mindset.</h2>
        <p>
          Built for founders, executives, and commercial teams that need clearer revenue infrastructure, sharper
          accountability, and better decision support.
        </p>

        <div className="hero-metrics">
          {metrics.map((metric) => (
            <div key={metric.value} className="hero-metric">
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
      </aside>
    </section>
  )
}
