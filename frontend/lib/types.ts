export interface UserProfile {
  age: string
  gender: string
  state: string
  occupation: string
  income: string
  category: string
  education: string
  maritalStatus: string
  disabilities: string
}

export interface GovernmentScheme {
  id: string
  name: string
  description: string
  eligibility: string[]
  benefits: string[]
  ministry: string
  category: string
  targetGroup: string[]
  applicationUrl: string
  matchScore?: number
}

export type FormStep = 'age' | 'gender' | 'state' | 'occupation' | 'income' | 'category' | 'education' | 'maritalStatus' | 'disabilities'

export const FORM_STEPS: FormStep[] = [
  'age',
  'gender',
  'state',
  'occupation',
  'income',
  'category',
  'education',
  'maritalStatus',
  'disabilities'
]

export const STEP_LABELS: Record<FormStep, string> = {
  age: 'Your Age',
  gender: 'Gender',
  state: 'State of Residence',
  occupation: 'Occupation',
  income: 'Annual Income',
  category: 'Social Category',
  education: 'Education Level',
  maritalStatus: 'Marital Status',
  disabilities: 'Disability Status'
}
