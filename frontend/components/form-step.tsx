'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FormStep, UserProfile } from '@/lib/types'
import { STEP_LABELS } from '@/lib/types'
import {
  STATES,
  OCCUPATIONS,
  INCOME_RANGES,
  SOCIAL_CATEGORIES,
  EDUCATION_LEVELS,
  MARITAL_STATUS,
  DISABILITY_OPTIONS
} from '@/lib/schemes-data'

interface FormStepProps {
  step: FormStep
  profile: UserProfile
  onUpdate: (field: keyof UserProfile, value: string) => void
  onNext: () => void | Promise<void>
  onPrev: () => void
  isFirst: boolean
  isLast: boolean
}

const GENDER_OPTIONS = ['Male', 'Female', 'Other']

export function FormStepComponent({
  step,
  profile,
  onUpdate,
  onNext,
  onPrev,
  isFirst,
  isLast
}: FormStepProps) {

  const value = profile[step]

  const getOptions = (): string[] => {
    switch (step) {
      case 'gender': return GENDER_OPTIONS
      case 'state': return STATES
      case 'occupation': return OCCUPATIONS
      case 'income': return INCOME_RANGES
      case 'category': return SOCIAL_CATEGORIES
      case 'education': return EDUCATION_LEVELS
      case 'maritalStatus': return MARITAL_STATUS
      case 'disabilities': return DISABILITY_OPTIONS
      default: return []
    }
  }

  const canProceed = () => {
    if (step === 'age') {
      const age = parseInt(value, 10)
      return age > 0 && age < 120
    }
    if (step === 'disabilities') return true
    return !!value
  }

  const renderInput = () => {
    if (step === 'age') {
      return (
        <div className="space-y-4">
          <Label>Enter your age</Label>
          <Input
            type="number"
            value={value}
            onChange={(e) => onUpdate(step, e.target.value)}
          />
        </div>
      )
    }

    const options = getOptions()

    return (
      <div className="space-y-4">
        <Label>Select your {STEP_LABELS[step]}</Label>

        <div className="grid grid-cols-2 gap-3">
          {options.map((option) => {
            const selected = value === option

            return (
              <button
                key={option}
                type="button"
                onClick={() => onUpdate(step, option)}
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  background: selected ? "#FFD700" : "#222",
                  color: selected ? "#000" : "#fff",
                  fontWeight: selected ? "bold" : "normal",
                  transform: selected ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.2s ease"
                }}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-xl mx-auto p-6"
      >
        <form onSubmit={(e) => { e.preventDefault(); onNext() }}>

          <h2 className="text-xl font-bold mb-4">
            {STEP_LABELS[step]}
          </h2>

          {renderInput()}

          <div className="flex justify-between mt-6">
            <Button type="button" onClick={onPrev} disabled={isFirst}>
              <ChevronLeft /> Prev
            </Button>

            <Button
              type="submit"
              disabled={!canProceed()}
            >
              {isLast ? 'Get Results' : 'Next'}
              <ChevronRight />
            </Button>
          </div>

        </form>
      </motion.div>
    </AnimatePresence>
  )
}