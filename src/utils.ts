import type { Bill } from './types'

export const issueKeywords: Record<string, string[]> = {
  'gun-control': [
    'firearm',
    'gun',
    'weapon',
    'ammunition',
    'concealed carry',
    'background check',
    'safe storage',
  ],
  lgbtqia: [
    'lgbtq',
    'same-sex',
    'transgender',
    'gender identity',
    'sexual orientation',
    'drag',
    'non-binary',
  ],
  healthcare: [
    'healthcare',
    'health',
    'medicaid',
    'medicare',
    'insurance',
    'prescription',
    'mental health',
    'welfare',
    'disability',
  ],
  education: ['school', 'education', 'university', 'college', 'student', 'teacher', 'curriculum'],
  environment: [
    'environment',
    'climate',
    'renewable',
    'energy',
    'pollution',
    'conservation',
    'wildlife',
  ],
  'criminal-justice': [
    'crime',
    'prison',
    'jail',
    'sentencing',
    'parole',
    'police',
    'law enforcement',
    'prosecution',
  ],
  taxes: ['tax', 'revenue', 'budget', 'fiscal', 'finance', 'income'],
  immigration: ['immigration', 'immigrant', 'border', 'visa', 'citizenship', 'alien'],
  'voting-rights': ['vote', 'voting', 'election', 'registration', 'franchise', 'ballot'],
  reproductive: [
    'abortion',
    'reproductive',
    'pregnancy',
    'contraception',
    'planned parenthood',
    'roe',
    'fetal',
  ],
  'workers-rights': [
    'labor',
    'union',
    'worker',
    'wage',
    'employment',
    'overtime',
    'minimum wage',
    'workplace',
  ],
  'gun-violence': [
    'gun violence',
    'mass shooting',
    'shooting',
    'assault weapon',
    'magazine',
    'red flag',
    'threat assessment',
  ],
}

export function getBillIssue(bill: Bill): string | null {
  const sponsorsStr = Array.isArray(bill.sponsors) ? bill.sponsors.join(' ') : bill.sponsors || ''
  const committeesStr = Array.isArray(bill.committees) ? bill.committees.join(' ') : bill.committees || ''
  const text =
    `${bill.caption} ${sponsorsStr} ${committeesStr} ${bill.first_reader_summary || ''}`.toLowerCase()

  for (const [issue, keywords] of Object.entries(issueKeywords)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return issue
    }
  }

  return null
}

export function getLatestStatus(bill: Bill): string {
  if (!bill.status_history || bill.status_history.length === 0) {
    return 'Unknown'
  }

  const sortedHistory = [...bill.status_history].sort((a, b) => {
    const dateA = new Date(a.date || 0)
    const dateB = new Date(b.date || 0)
    return dateA.getTime() - dateB.getTime()
  })

  return sortedHistory[sortedHistory.length - 1].status
}

export function generateBillTags(bill: Bill): string[] {
  const sponsorsStr = Array.isArray(bill.sponsors) ? bill.sponsors.join(' ') : bill.sponsors || ''
  const committeesStr = Array.isArray(bill.committees) ? bill.committees.join(' ') : bill.committees || ''
  const text =
    `${bill.caption} ${sponsorsStr} ${committeesStr} ${bill.first_reader_summary || ''}`.toLowerCase()
  const tags = new Set<string>()

  for (const [, keywords] of Object.entries(issueKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        tags.add(keyword)
      }
    }
  }

  const tagArray = Array.from(tags).slice(0, 4)
  return tagArray.length > 0 ? tagArray : ['General']
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return 'N/A'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export function exportToCSV(bill: Bill): void {
  const headers = ['Field', 'Value']
  const rows = [
    ['Bill Number', bill.doc_number],
    ['Caption', bill.caption],
    ['Sponsors', Array.isArray(bill.sponsors) ? bill.sponsors.join(', ') : bill.sponsors || ''],
    ['Committees', Array.isArray(bill.committees) ? bill.committees.join(', ') : bill.committees || ''],
    ['Latest Status', getLatestStatus(bill)],
    ['Summary', bill.first_reader_summary || 'N/A'],
  ]

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${bill.doc_number}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToJSON(bill: Bill): void {
  const dataStr = JSON.stringify(bill, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${bill.doc_number}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Normalize sponsor names to "First Last" format
 * Handles formats like:
 * - "LAST, FIRST" → "First Last"
 * - "LAST, FIRST MIDDLE" → "First Middle Last"
 * - "First Last" → "First Last" (already normalized)
 */
export function normalizeSponsorName(name: string): string {
  if (!name || name.trim() === '') return ''
  
  const trimmed = name.trim()
  
  // Check if name contains comma (LAST, FIRST format)
  if (trimmed.includes(',')) {
    const [lastName, firstPart] = trimmed.split(',').map(part => part.trim())
    
    // Capitalize properly
    const capitalizeWord = (word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    
    const firstNames = firstPart.split(/\s+/).map(capitalizeWord).join(' ')
    const lastNameCap = lastName.split(/\s+/).map(capitalizeWord).join(' ')
    
    return `${firstNames} ${lastNameCap}`
  }
  
  // Already in "First Last" format, just capitalize properly
  return trimmed.split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Extract and normalize all sponsors from a bill
 * Returns array of normalized sponsor names
 */
export function getSponsorNames(bill: Bill): string[] {
  const sponsors = Array.isArray(bill.sponsors) 
    ? bill.sponsors 
    : bill.sponsors 
      ? [bill.sponsors]
      : []
  
  return sponsors
    .filter(s => s && s.trim() !== '')
    .map(normalizeSponsorName)
}
