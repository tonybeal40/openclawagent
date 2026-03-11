import type { PropsWithChildren } from 'react'

type SectionProps = PropsWithChildren<{
  id: string
  eyebrow: string
  title: string
  intro: string
}>

export function Section({ id, eyebrow, title, intro, children }: SectionProps) {
  return (
    <section id={id} className="content-section">
      <div className="section-heading">
        <p className="section-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="section-intro">{intro}</p>
      </div>
      {children}
    </section>
  )
}
