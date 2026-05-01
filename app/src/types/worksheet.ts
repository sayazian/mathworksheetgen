export type WorksheetVisibility = 'private' | 'public'

export interface WorksheetContent {
  title: string
  subtitle: string
  problems: string[]
  answers: string[]
  explanations: string[]
}

export interface WorksheetRecord {
  id: string
  topic: string
  visibility: WorksheetVisibility
  content: WorksheetContent
  createdAt: string
  editToken?: string
}
