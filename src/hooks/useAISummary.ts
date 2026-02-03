import type { Bill } from '../types'

interface UseAISummaryResult {
  summary: string | null
  isLoading: boolean
  error: string | null
  model: string | null
  generatedAt: string | null
}

/**
 * Hook for displaying AI summaries for bills.
 *
 * Summaries are now embedded directly in the bill data from the pipeline.
 * This hook simply extracts the ai_summary field from the bill.
 *
 * @param bill - The bill to get a summary for
 * @returns Object with summary data
 */
export function useAISummary(bill: Bill | null): UseAISummaryResult {
  if (!bill) {
    return {
      summary: null,
      isLoading: false,
      error: null,
      model: null,
      generatedAt: null,
    }
  }

  // Summaries are now embedded directly in bill data from the pipeline
  return {
    summary: bill.ai_summary || null,
    isLoading: false,
    error: null,
    model: bill.summary_model || null,
    generatedAt: null, // Generated at is now at the file level, not per-bill
  }
}
