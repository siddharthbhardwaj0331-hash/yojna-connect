'use client'

import { motion } from 'framer-motion'
import { Ship } from 'lucide-react'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-8">
      <div className="flex items-center justify-between mb-2 text-sm">
        <span className="text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-gold font-medium">
          {Math.round(progress)}% Complete
        </span>
      </div>
      
      <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 text-gold"
          initial={{ left: 0 }}
          animate={{ left: `calc(${progress}% - 12px)` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Ship className="w-6 h-6 drop-shadow-lg" />
        </motion.div>
      </div>

      {/* Island markers */}
      <div className="relative mt-1 h-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full transition-colors duration-300 ${
              i <= currentStep ? 'bg-gold' : 'bg-muted'
            }`}
            style={{ left: `${((i + 1) / totalSteps) * 100}%`, transform: 'translateX(-50%)' }}
          />
        ))}
      </div>
    </div>
  )
}
