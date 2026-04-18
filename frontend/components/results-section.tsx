'use client'

import { motion } from 'framer-motion'
import { Gem, RotateCcw, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SchemeCard } from './scheme-card'
import type { GovernmentScheme } from '@/lib/types'
import { useState } from 'react'

interface ResultsSectionProps {
  schemes: GovernmentScheme[]
  onReset: () => void
  /** Shown when results come from client-side fallback instead of the API. */
  fallbackNotice?: string
  /** Overall AI summary from the backend (Gemini), when available. */
  aiSummary?: string | null
}

const CATEGORIES = [
  'All',
  'Recommended Matches',
  'Housing',
  'Financial Inclusion',
  'Insurance',
  'Agriculture',
  'Business & Entrepreneurship',
  'Healthcare',
  'Savings & Investment',
  'Pension & Retirement',
  'Education & Skill Development',
  'Welfare',
  'Disability Welfare'
]

export function ResultsSection({ schemes, onReset, fallbackNotice, aiSummary }: ResultsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredSchemes = selectedCategory === 'All'
    ? schemes
    : schemes.filter(s => s.category === selectedCategory)

  const topSchemes = filteredSchemes.filter(s => (s.matchScore || 0) >= 40)
  const otherSchemes = filteredSchemes.filter(s => (s.matchScore || 0) < 40)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto px-4 pb-16"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold mb-4"
        >
          <Gem className="w-5 h-5 text-gold" />
          <span className="font-semibold text-gold">Treasure Found!</span>
        </motion.div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Your Personalized Schemes
        </h2>
        <p className="text-muted-foreground mt-2">
          We found {schemes.length} government schemes that match your profile
        </p>
        {fallbackNotice ? (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-400 max-w-2xl mx-auto">
            {fallbackNotice}
          </p>
        ) : null}
        {aiSummary ? (
          <p className="mt-6 text-base text-foreground/90 max-w-3xl mx-auto leading-relaxed glass rounded-xl px-5 py-4 border border-border/60">
            {aiSummary}
          </p>
        ) : null}
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filter by category</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => {
            const count = category === 'All' 
              ? schemes.length 
              : schemes.filter(s => s.category === category).length
            
            if (count === 0 && category !== 'All') return null

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {category} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Top Matches */}
      {topSchemes.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Best Matches for You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topSchemes.map((scheme, index) => (
              <SchemeCard key={scheme.id} scheme={scheme} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Other Schemes */}
      {otherSchemes.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Other Relevant Schemes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherSchemes.map((scheme, index) => (
              <SchemeCard key={scheme.id} scheme={scheme} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {filteredSchemes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No schemes found in this category.</p>
        </div>
      )}

      {/* Reset Button */}
      <div className="text-center mt-12">
        <Button
          variant="outline"
          onClick={onReset}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Start New Search
        </Button>
      </div>
    </motion.div>
  )
}
