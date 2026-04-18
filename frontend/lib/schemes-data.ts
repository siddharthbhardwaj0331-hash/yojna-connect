import type { GovernmentScheme } from './types'

export const governmentSchemes: GovernmentScheme[] = [
  {
    id: 'pmay',
    name: 'Pradhan Mantri Awas Yojana (PMAY)',
    description: 'Housing for All mission providing affordable housing to urban and rural poor with interest subsidy on home loans.',
    eligibility: ['Annual income up to 18 lakhs', 'First-time home buyers', 'No pucca house ownership'],
    benefits: ['Interest subsidy up to 6.5%', 'Subsidy amount up to 2.67 lakhs', 'Affordable EMIs'],
    ministry: 'Ministry of Housing and Urban Affairs',
    category: 'Housing',
    targetGroup: ['Low Income', 'Middle Income', 'EWS', 'LIG'],
    applicationUrl: 'https://pmaymis.gov.in/'
  },
  {
    id: 'pmjdy',
    name: 'Pradhan Mantri Jan Dhan Yojana',
    description: 'Financial inclusion program ensuring access to banking services with zero balance accounts.',
    eligibility: ['Indian citizen', 'Age 10 years and above', 'No existing bank account'],
    benefits: ['Zero balance account', 'RuPay debit card', 'Accidental insurance of 2 lakhs', 'Overdraft facility up to 10,000'],
    ministry: 'Ministry of Finance',
    category: 'Financial Inclusion',
    targetGroup: ['All Citizens', 'Rural', 'Urban Poor'],
    applicationUrl: 'https://pmjdy.gov.in/'
  },
  {
    id: 'pmsby',
    name: 'Pradhan Mantri Suraksha Bima Yojana',
    description: 'Accidental death and disability insurance scheme with minimal premium.',
    eligibility: ['Age 18-70 years', 'Bank account holder', 'Aadhaar linked'],
    benefits: ['2 lakh accidental death cover', '1 lakh partial disability', 'Premium only Rs 20/year'],
    ministry: 'Ministry of Finance',
    category: 'Insurance',
    targetGroup: ['All Citizens', 'Working Class'],
    applicationUrl: 'https://financialservices.gov.in/insurance-divisions/Government-Sponsored-Socially-Oriented-Insurance-Schemes/Pradhan-Mantri-Suraksha-Bima-Yojana(PMSBY)'
  },
  {
    id: 'pmjjby',
    name: 'Pradhan Mantri Jeevan Jyoti Bima Yojana',
    description: 'Life insurance scheme offering coverage for death due to any reason.',
    eligibility: ['Age 18-50 years', 'Bank account holder', 'Aadhaar linked'],
    benefits: ['2 lakh life cover', 'Premium Rs 436/year', 'Covers death due to any reason'],
    ministry: 'Ministry of Finance',
    category: 'Insurance',
    targetGroup: ['All Citizens', 'Working Class'],
    applicationUrl: 'https://financialservices.gov.in/insurance-divisions/Government-Sponsored-Socially-Oriented-Insurance-Schemes/Pradhan-Mantri-Jeevan-Jyoti-Bima-Yojana(PMJJBY)'
  },
  {
    id: 'pmkisan',
    name: 'PM-KISAN Samman Nidhi',
    description: 'Direct income support to farmers providing Rs 6,000 per year in three installments.',
    eligibility: ['Small and marginal farmers', 'Land ownership records', 'Not receiving pension'],
    benefits: ['Rs 6,000 per year', 'Direct bank transfer', 'Three installments of Rs 2,000'],
    ministry: 'Ministry of Agriculture',
    category: 'Agriculture',
    targetGroup: ['Farmers', 'Rural'],
    applicationUrl: 'https://pmkisan.gov.in/'
  },
  {
    id: 'mudra',
    name: 'Pradhan Mantri MUDRA Yojana',
    description: 'Micro-finance loans for small businesses and entrepreneurs without collateral.',
    eligibility: ['Non-corporate small businesses', 'Valid business plan', 'No existing bank loan default'],
    benefits: ['Loans up to 10 lakhs', 'No collateral required', 'Three categories: Shishu, Kishore, Tarun'],
    ministry: 'Ministry of Finance',
    category: 'Business & Entrepreneurship',
    targetGroup: ['Entrepreneurs', 'Small Business', 'Self-Employed'],
    applicationUrl: 'https://www.mudra.org.in/'
  },
  {
    id: 'ayushman',
    name: 'Ayushman Bharat PM-JAY',
    description: 'World\'s largest health insurance scheme providing Rs 5 lakh health cover per family.',
    eligibility: ['BPL families', 'SECC database inclusion', 'No existing health insurance'],
    benefits: ['Rs 5 lakh health cover', 'Cashless treatment', '1,500+ procedures covered'],
    ministry: 'Ministry of Health and Family Welfare',
    category: 'Healthcare',
    targetGroup: ['BPL Families', 'Low Income', 'Rural'],
    applicationUrl: 'https://pmjay.gov.in/'
  },
  {
    id: 'sukanya',
    name: 'Sukanya Samriddhi Yojana',
    description: 'Savings scheme for girl child with attractive interest rates and tax benefits.',
    eligibility: ['Girl child below 10 years', 'Indian resident', 'Only 2 accounts per family'],
    benefits: ['High interest rate (8%+)', 'Tax benefits under 80C', 'Partial withdrawal for education'],
    ministry: 'Ministry of Finance',
    category: 'Savings & Investment',
    targetGroup: ['Girl Child', 'Parents'],
    applicationUrl: 'https://www.indiapost.gov.in/Financial/pages/content/sukanya-samriddhi-accounts.aspx'
  },
  {
    id: 'pmegp',
    name: 'PM Employment Generation Programme',
    description: 'Credit-linked subsidy for setting up new micro-enterprises.',
    eligibility: ['Age above 18 years', 'VIII pass for projects above 10 lakhs', 'New unit only'],
    benefits: ['Subsidy up to 35% in urban areas', 'Up to 25% in rural areas', 'Project cost up to 50 lakhs'],
    ministry: 'Ministry of MSME',
    category: 'Business & Entrepreneurship',
    targetGroup: ['Entrepreneurs', 'Unemployed Youth', 'Women'],
    applicationUrl: 'https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp'
  },
  {
    id: 'nps',
    name: 'National Pension System',
    description: 'Voluntary retirement savings scheme with government co-contribution for eligible subscribers.',
    eligibility: ['Indian citizen aged 18-70', 'Valid KYC documents', 'Active bank account'],
    benefits: ['Government co-contribution', 'Tax benefits up to 2 lakhs', 'Flexible investment choices'],
    ministry: 'Ministry of Finance',
    category: 'Pension & Retirement',
    targetGroup: ['All Citizens', 'Working Class', 'Self-Employed'],
    applicationUrl: 'https://www.npscra.nsdl.co.in/'
  },
  {
    id: 'standup',
    name: 'Stand Up India',
    description: 'Bank loans between 10 lakh to 1 crore for SC/ST and women entrepreneurs.',
    eligibility: ['SC/ST or Women', 'Age above 18', 'New enterprise only'],
    benefits: ['Loans from 10 lakh to 1 crore', 'Composite loan for land, building, equipment', '7-year repayment tenure'],
    ministry: 'Ministry of Finance',
    category: 'Business & Entrepreneurship',
    targetGroup: ['SC/ST', 'Women', 'Entrepreneurs'],
    applicationUrl: 'https://www.standupmitra.in/'
  },
  {
    id: 'pmuy',
    name: 'Pradhan Mantri Ujjwala Yojana',
    description: 'Free LPG connections to women from BPL households.',
    eligibility: ['Women from BPL families', 'No existing LPG connection', 'Age above 18 years'],
    benefits: ['Free LPG connection', 'First refill free', 'EMI option for stove'],
    ministry: 'Ministry of Petroleum and Natural Gas',
    category: 'Welfare',
    targetGroup: ['BPL Families', 'Women', 'Rural'],
    applicationUrl: 'https://www.pmuy.gov.in/'
  },
  {
    id: 'skill',
    name: 'Pradhan Mantri Kaushal Vikas Yojana',
    description: 'Skill development and certification scheme for youth.',
    eligibility: ['Indian national', 'Age 15-45 years', 'Aadhaar card'],
    benefits: ['Free skill training', 'Industry-recognized certification', 'Monetary reward on completion'],
    ministry: 'Ministry of Skill Development',
    category: 'Education & Skill Development',
    targetGroup: ['Youth', 'Unemployed', 'Students'],
    applicationUrl: 'https://www.pmkvyofficial.org/'
  },
  {
    id: 'scholarship',
    name: 'National Scholarship Portal Schemes',
    description: 'Various central and state scholarships for students.',
    eligibility: ['Students in recognized institutions', 'Family income criteria', 'Academic merit'],
    benefits: ['Tuition fee coverage', 'Maintenance allowance', 'Book grant'],
    ministry: 'Ministry of Education',
    category: 'Education & Skill Development',
    targetGroup: ['Students', 'SC/ST/OBC', 'Minorities'],
    applicationUrl: 'https://scholarships.gov.in/'
  },
  {
    id: 'disability',
    name: 'Assistance to Disabled Persons (ADIP)',
    description: 'Scheme for providing aids and appliances to persons with disabilities.',
    eligibility: ['Person with disability', 'Monthly income below Rs 20,000', 'Valid disability certificate'],
    benefits: ['Free aids and appliances', 'Prosthetics and orthotics', 'Assistive devices'],
    ministry: 'Ministry of Social Justice',
    category: 'Disability Welfare',
    targetGroup: ['Persons with Disabilities'],
    applicationUrl: 'https://disabilityaffairs.gov.in/content/page/adip.php'
  },
  {
    id: 'widow',
    name: 'Indira Gandhi National Widow Pension',
    description: 'Monthly pension for widows from BPL families.',
    eligibility: ['Widow aged 40-79 years', 'BPL family', 'Not receiving other pension'],
    benefits: ['Rs 300 per month (central)', 'Additional state contribution', 'Direct bank transfer'],
    ministry: 'Ministry of Rural Development',
    category: 'Pension & Retirement',
    targetGroup: ['Widows', 'Women', 'BPL Families'],
    applicationUrl: 'https://nsap.nic.in/'
  },
  {
    id: 'oldage',
    name: 'Indira Gandhi National Old Age Pension',
    description: 'Monthly pension for senior citizens from BPL families.',
    eligibility: ['Age 60 years and above', 'BPL family', 'Not receiving other pension'],
    benefits: ['Rs 200-500 per month', 'Additional state contribution', 'Direct bank transfer'],
    ministry: 'Ministry of Rural Development',
    category: 'Pension & Retirement',
    targetGroup: ['Senior Citizens', 'BPL Families'],
    applicationUrl: 'https://nsap.nic.in/'
  },
  {
    id: 'maternity',
    name: 'Pradhan Mantri Matru Vandana Yojana',
    description: 'Cash incentive for pregnant and lactating mothers.',
    eligibility: ['Pregnant women', 'First live birth', 'Age 19 years and above'],
    benefits: ['Rs 5,000 in three installments', 'Additional Rs 6,000 under JSY', 'Nutrition support'],
    ministry: 'Ministry of Women and Child Development',
    category: 'Healthcare',
    targetGroup: ['Pregnant Women', 'New Mothers'],
    applicationUrl: 'https://pmmvy.wcd.gov.in/'
  }
]

export const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
]

export const OCCUPATIONS = [
  'Student',
  'Farmer',
  'Self-Employed',
  'Private Sector Employee',
  'Government Employee',
  'Business Owner',
  'Daily Wage Worker',
  'Homemaker',
  'Unemployed',
  'Retired',
  'Other'
]

export const INCOME_RANGES = [
  'Below 1 Lakh',
  '1-2.5 Lakhs',
  '2.5-5 Lakhs',
  '5-10 Lakhs',
  '10-18 Lakhs',
  'Above 18 Lakhs'
]

export const SOCIAL_CATEGORIES = [
  'General',
  'EWS (Economically Weaker Section)',
  'SC (Scheduled Caste)',
  'ST (Scheduled Tribe)',
  'OBC (Other Backward Class)',
  'Minority',
  'Women (all categories)'
]

export const EDUCATION_LEVELS = [
  'No Formal Education',
  'Primary (Class 1-5)',
  'Middle (Class 6-8)',
  'Secondary (Class 9-10)',
  'Higher Secondary (Class 11-12)',
  'Graduate',
  'Post Graduate',
  'Doctorate'
]

export const MARITAL_STATUS = [
  'Single',
  'Married',
  'Widowed',
  'Divorced',
  'Separated'
]

export const DISABILITY_OPTIONS = [
  'No Disability',
  'Visual Impairment',
  'Hearing Impairment',
  'Locomotor Disability',
  'Mental Illness',
  'Multiple Disabilities',
  'Other'
]
