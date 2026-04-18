import type { GovernmentScheme } from '@/lib/types'

/** Map UI income range to a representative annual income (INR) for the backend filter. */
export function incomeRangeToAnnualInr(range: string): number {
  const map: Record<string, number> = {
    'Below 1 Lakh': 50_000,
    '1-2.5 Lakhs': 175_000,
    '2.5-5 Lakhs': 375_000,
    '5-10 Lakhs': 750_000,
    '10-18 Lakhs': 1_400_000,
    'Above 18 Lakhs': 2_000_000,
  }
  return map[range] ?? 300_000
}

/** Map UI occupation labels to backend OccupationEnum-style strings. */
export function mapOccupation(label: string): string {
  const m: Record<string, string> = {
    Student: 'student',
    Farmer: 'farmer',
    'Self-Employed': 'self-employed',
    'Private Sector Employee': 'salaried',
    'Government Employee': 'salaried',
    'Business Owner': 'businessman',
    'Daily Wage Worker': 'labour',
    Homemaker: 'other',
    Unemployed: 'unemployed',
    Retired: 'other',
    Other: 'other',
  }
  return m[label] ?? 'other'
}

/** Map UI social category to backend category strings. */
export function mapCategory(label: string): string {
  const s = label.trim()
  if (!s) return 'general'
  if (s.startsWith('General')) return 'general'
  if (s.includes('EWS')) return 'EWS'
  if (s.includes('SC')) return 'SC'
  if (s.includes('ST')) return 'ST'
  if (s.includes('OBC')) return 'OBC'
  if (s.includes('Minority')) return 'minority'
  if (s.toLowerCase().includes('women')) return 'women'
  return 'general'
}

function splitDetailText(text: string): string[] {
  const parts = text
    .split(/\n|•|;/)
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.length ? parts : text ? [text] : ['—']
}

export interface RecommendApiScheme {
  name: string
  reason?: string
  benefits?: string
  eligibility?: string
  apply_link?: string
}

/** Map POST /schemes/recommend items into UI GovernmentScheme cards. */
function asApiString(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return v.map(String).join('; ')
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

export function mapRecommendationToGovernmentScheme(
  raw: RecommendApiScheme,
  index: number
): GovernmentScheme {
  const benefitsStr = asApiString(raw.benefits)
  const eligibilityStr = asApiString(raw.eligibility)
  return {
    id: `rec-${index}-${raw.name.replace(/\s+/g, '-').slice(0, 40)}`,
    name: raw.name,
    description: raw.reason || benefitsStr || '—',
    eligibility: splitDetailText(eligibilityStr),
    benefits: splitDetailText(benefitsStr),
    ministry: 'Government of India',
    category: 'Recommended Matches',
    targetGroup: [],
    applicationUrl:
      raw.apply_link && String(raw.apply_link) !== '#' ? String(raw.apply_link) : '#',
    matchScore: Math.max(45, 88 - index * 6),
  }
}
