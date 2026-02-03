export interface StatusHistory {
  date: string
  status: string
}

export interface Bill {
  doc_number: string
  caption: string
  sponsors: string | string[]
  committees: string | string[]
  status_history: StatusHistory[]
  first_reader_summary?: string
  summary?: string
  versions?: Array<{
    version: string
    date: string
    url: string
  }>
  // AI-generated summary fields
  ai_summary?: string
  summary_status?: 'pending' | 'generating' | 'complete' | 'failed'
  summary_model?: string
  summary_generated_at?: string
}

export interface FilterState {
  search: string
  type: string
  issues: string[]
  sponsor: string
  status: string
  dateFrom: string
  dateTo: string
  summarySearch: string
  sortBy: string
}
