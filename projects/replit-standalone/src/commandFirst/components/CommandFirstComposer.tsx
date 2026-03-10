import { useMemo, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'

import { parseBuildIntent } from '../intentParser'
import { starterPrompts } from '../starterPrompts'
import type { BuildIntent } from '../types'

type CommandFirstComposerProps = {
  onIntentChange: (intent: BuildIntent) => void
}

const DEFAULT_PROMPT = starterPrompts[0]

export function CommandFirstComposer({ onIntentChange }: CommandFirstComposerProps) {
  const [value, setValue] = useState<string>(DEFAULT_PROMPT)
  const [pendingStarterPrompt, setPendingStarterPrompt] = useState<string | null>(null)
  const [lastParsedInput, setLastParsedInput] = useState<string>(DEFAULT_PROMPT)

  const currentIntent = useMemo(() => parseBuildIntent(value), [value])
  const hasUnparsedChanges = value.trim() !== lastParsedInput.trim()

  const commitParse = () => {
    onIntentChange(currentIntent)
    setLastParsedInput(value)
    setPendingStarterPrompt(null)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    commitParse()
  }

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      commitParse()
    }
  }

  return (
    <section className="command-first-card" aria-label="Command-first composer">
      <header>
        <p className="eyebrow">Command-first</p>
        <h2>Describe what you want to build</h2>
      </header>
      <form className="command-first-form" onSubmit={handleSubmit}>
        <textarea
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            if (pendingStarterPrompt) setPendingStarterPrompt(null)
          }}
          onKeyDown={handleTextareaKeyDown}
          rows={4}
          placeholder="I want to build this: ..."
        />

        <div className="starter-chip-group" aria-label="Starter prompts">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className={`starter-chip ${value === prompt ? 'is-selected' : ''}`}
              onClick={() => {
                setValue(prompt)
                setPendingStarterPrompt(prompt)
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="command-first-actions">
          <button className="primary-btn" type="submit">
            Parse intent
          </button>
          {pendingStarterPrompt && (
            <button className="ghost-btn" type="button" onClick={commitParse}>
              Accept starter prompt
            </button>
          )}
          <span className={`pill muted ${hasUnparsedChanges ? 'intent-status-pending' : 'intent-status-synced'}`}>
            {hasUnparsedChanges ? 'Preview pending parse' : 'Preview synced'}
          </span>
        </div>
      </form>
    </section>
  )
}
