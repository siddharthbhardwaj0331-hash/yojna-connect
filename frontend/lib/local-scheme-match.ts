import { governmentSchemes } from '@/lib/schemes-data'
import type { GovernmentScheme, UserProfile } from '@/lib/types'
import { incomeRangeToAnnualInr, mapOccupation } from '@/lib/profile-mapping'

/**
 * Client-side fallback when the API is unreachable or returns no recommendations.
 * Scores static catalogue entries from `governmentSchemes` using the same profile fields
 * sent to the backend.
 */
export function matchSchemesLocally(profile: UserProfile): GovernmentScheme[] {
  const income = incomeRangeToAnnualInr(profile.income)
  const age = Math.min(120, Math.max(0, parseInt(profile.age, 10) || 0))
  const occKey = mapOccupation(profile.occupation)
  const occLabel = profile.occupation.toLowerCase()
  const hasDisability = profile.disabilities && profile.disabilities !== 'No Disability'
  const isFemale = profile.gender.toLowerCase() === 'female'

  const scored = governmentSchemes.map((scheme) => {
    let score = 28
    const text = `${scheme.name} ${scheme.description} ${scheme.category} ${scheme.targetGroup.join(' ')}`.toLowerCase()

    if (income <= 250_000) {
      if (text.includes('bpl') || text.includes('poor') || text.includes('low income')) score += 12
    }
    if (income >= 500_000 && income <= 1_800_000) {
      if (scheme.category === 'Housing' || scheme.id === 'pmay') score += 10
    }

    if (occKey === 'farmer' || occLabel.includes('farmer')) {
      if (scheme.category === 'Agriculture' || scheme.id === 'pmkisan') score += 22
    }
    if (occKey === 'student' || occLabel.includes('student')) {
      if (scheme.category.includes('Education') || scheme.id === 'scholarship' || scheme.id === 'skill') score += 18
    }
    if (occKey === 'unemployed' || occLabel.includes('unemployed')) {
      if (scheme.id === 'skill' || scheme.id === 'pmegp') score += 14
    }
    if (occKey === 'businessman' || occLabel.includes('business')) {
      if (scheme.category.includes('Business') || scheme.id === 'mudra' || scheme.id === 'standup') score += 14
    }
    if (occKey === 'labour' || occLabel.includes('daily wage')) {
      if (scheme.id === 'pmjdy' || scheme.id === 'pmsby') score += 10
    }

    if (profile.category.includes('SC') || profile.category.includes('ST')) {
      if (text.includes('sc') || text.includes('st') || scheme.id === 'standup') score += 8
    }
    if (profile.category.includes('EWS')) {
      if (text.includes('ews') || text.includes('poor') || text.includes('low income')) score += 6
    }
    if (profile.category.includes('OBC')) score += 4
    if (profile.category.includes('Minority')) {
      if (scheme.id === 'scholarship') score += 8
    }

    if (hasDisability && scheme.category === 'Disability Welfare') score += 25
    if (isFemale && (scheme.id === 'pmuy' || text.includes('women') || text.includes('girl'))) score += 8

    if (age >= 60 && (scheme.id === 'oldage' || scheme.category.includes('Pension'))) score += 15
    if (age <= 10 && scheme.id === 'sukanya') score += 10

    return { scheme, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ scheme, score }, i) => ({
      ...scheme,
      matchScore: Math.min(92, Math.max(42, score + (9 - i) * 2)),
    }))
}
