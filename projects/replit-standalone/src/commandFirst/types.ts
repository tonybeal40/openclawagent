export type BuildPlatform = 'web' | 'mobile' | 'desktop' | 'api' | 'unknown'

export type BuildIntent = {
  rawInput: string
  goal: string
  platform: BuildPlatform
  audience?: string
  keyFeatures: string[]
  constraints: string[]
  missingFields: string[]
  confidence: number
}

export type ClarifierQuestion = {
  field: string
  question: string
  importance: 'high' | 'medium' | 'low'
}
