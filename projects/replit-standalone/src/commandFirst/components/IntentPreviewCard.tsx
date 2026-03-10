import { getClarifierQuestions } from '../intentParser'
import type { BuildIntent } from '../types'

type IntentPreviewCardProps = {
  intent: BuildIntent
  onGeneratePlan?: () => void
}

export function IntentPreviewCard({ intent, onGeneratePlan }: IntentPreviewCardProps) {
  const clarifiers = getClarifierQuestions(intent)

  return (
    <section className="intent-preview-card" aria-label="Intent preview">
      <header>
        <p className="eyebrow">Intent preview</p>
        <div className="intent-preview-meta">
          <span className="pill muted">Platform: {intent.platform}</span>
          <span className="pill muted">Confidence: {Math.round(intent.confidence * 100)}%</span>
          {onGeneratePlan && (
            <button className="ghost-btn" type="button" onClick={onGeneratePlan}>
              Generate build plan
            </button>
          )}
        </div>
      </header>

      <div className="intent-preview-body">
        <h3>{intent.goal || 'Add a bit more detail to generate an intent.'}</h3>

        <div>
          <h4>Key features</h4>
          {intent.keyFeatures.length > 0 ? (
            <ul>
              {intent.keyFeatures.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          ) : (
            <p>No features detected yet.</p>
          )}
        </div>

        <div>
          <h4>Constraints</h4>
          {intent.constraints.length > 0 ? (
            <ul>
              {intent.constraints.map((constraint) => (
                <li key={constraint}>{constraint}</li>
              ))}
            </ul>
          ) : (
            <p>No hard constraints detected yet.</p>
          )}
        </div>

        <div>
          <h4>Clarifier questions</h4>
          {clarifiers.length > 0 ? (
            <ul>
              {clarifiers.map((question) => (
                <li key={question.field}>{question.question}</li>
              ))}
            </ul>
          ) : (
            <p>Looks complete enough for day-2 scaffolding.</p>
          )}
        </div>
      </div>
    </section>
  )
}
