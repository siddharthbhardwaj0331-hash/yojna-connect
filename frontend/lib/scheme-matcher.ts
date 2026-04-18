import type { UserProfile, GovernmentScheme } from './types'
import { governmentSchemes } from './schemes-data'

export function matchSchemes(profile: UserProfile): GovernmentScheme[] {
  const age = parseInt(profile.age) || 0
  const income = profile.income
  const occupation = profile.occupation
  const category = profile.category
  const gender = profile.gender
  const maritalStatus = profile.maritalStatus
  const disabilities = profile.disabilities
  const education = profile.education

  const scoredSchemes = governmentSchemes.map((scheme) => {
    let score = 0
    const maxScore = 100

    // Age-based matching
    if (scheme.targetGroup.includes('Youth') && age >= 15 && age <= 35) {
      score += 15
    }
    if (scheme.targetGroup.includes('Senior Citizens') && age >= 60) {
      score += 20
    }
    if (scheme.targetGroup.includes('Students') && (occupation === 'Student' || age <= 25)) {
      score += 15
    }
    if (scheme.targetGroup.includes('Girl Child') && gender === 'Female' && age < 10) {
      score += 25
    }

    // Income-based matching
    const isLowIncome = ['Below 1 Lakh', '1-2.5 Lakhs', '2.5-5 Lakhs'].includes(income)
    const isBPL = income === 'Below 1 Lakh'
    
    if (scheme.targetGroup.includes('BPL Families') && isBPL) {
      score += 25
    }
    if (scheme.targetGroup.includes('Low Income') && isLowIncome) {
      score += 20
    }
    if (scheme.targetGroup.includes('Middle Income') && ['5-10 Lakhs', '10-18 Lakhs'].includes(income)) {
      score += 15
    }
    if (scheme.targetGroup.includes('EWS') && isLowIncome) {
      score += 15
    }
    if (scheme.targetGroup.includes('LIG') && ['1-2.5 Lakhs', '2.5-5 Lakhs'].includes(income)) {
      score += 15
    }

    // Occupation-based matching
    if (scheme.targetGroup.includes('Farmers') && occupation === 'Farmer') {
      score += 25
    }
    if (scheme.targetGroup.includes('Entrepreneurs') && ['Self-Employed', 'Business Owner'].includes(occupation)) {
      score += 20
    }
    if (scheme.targetGroup.includes('Small Business') && occupation === 'Business Owner') {
      score += 15
    }
    if (scheme.targetGroup.includes('Self-Employed') && occupation === 'Self-Employed') {
      score += 15
    }
    if (scheme.targetGroup.includes('Working Class') && ['Private Sector Employee', 'Government Employee', 'Daily Wage Worker'].includes(occupation)) {
      score += 15
    }
    if (scheme.targetGroup.includes('Unemployed') && occupation === 'Unemployed') {
      score += 20
    }
    if (scheme.targetGroup.includes('Unemployed Youth') && occupation === 'Unemployed' && age <= 35) {
      score += 25
    }

    // Category-based matching
    if (scheme.targetGroup.includes('SC/ST') && ['SC (Scheduled Caste)', 'ST (Scheduled Tribe)'].includes(category)) {
      score += 20
    }
    if (scheme.targetGroup.includes('Minorities') && category === 'Minority') {
      score += 15
    }
    if (scheme.targetGroup.includes('SC/ST/OBC') && ['SC (Scheduled Caste)', 'ST (Scheduled Tribe)', 'OBC (Other Backward Class)'].includes(category)) {
      score += 15
    }

    // Gender-based matching
    if (scheme.targetGroup.includes('Women') && gender === 'Female') {
      score += 20
    }
    if (scheme.targetGroup.includes('Pregnant Women') && gender === 'Female' && maritalStatus === 'Married') {
      score += 15
    }
    if (scheme.targetGroup.includes('New Mothers') && gender === 'Female' && maritalStatus === 'Married') {
      score += 10
    }
    if (scheme.targetGroup.includes('Widows') && maritalStatus === 'Widowed' && gender === 'Female') {
      score += 25
    }
    if (scheme.targetGroup.includes('Parents') && maritalStatus === 'Married') {
      score += 10
    }

    // Disability-based matching
    if (scheme.targetGroup.includes('Persons with Disabilities') && disabilities !== 'No Disability') {
      score += 30
    }

    // General schemes get base score
    if (scheme.targetGroup.includes('All Citizens')) {
      score += 10
    }
    if (scheme.targetGroup.includes('Rural') && isLowIncome) {
      score += 5
    }
    if (scheme.targetGroup.includes('Urban Poor') && isLowIncome) {
      score += 5
    }

    // Education-based bonus
    if (scheme.category === 'Education & Skill Development') {
      if (occupation === 'Student') score += 15
      if (['No Formal Education', 'Primary (Class 1-5)', 'Middle (Class 6-8)'].includes(education)) {
        score += 10
      }
    }

    // Normalize score
    const normalizedScore = Math.min(Math.round((score / maxScore) * 100), 100)

    return {
      ...scheme,
      matchScore: normalizedScore
    }
  })

  // Filter schemes with score > 0 and sort by score
  return scoredSchemes
    .filter((s) => s.matchScore && s.matchScore > 0)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
}
