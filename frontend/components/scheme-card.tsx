'use client'

import { motion } from 'framer-motion'
import { ExternalLink, CheckCircle2, Building2, Target, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GovernmentScheme } from '@/lib/types'

interface SchemeCardProps {
  scheme: GovernmentScheme
  index: number
}

export function SchemeCard({ scheme, index }: SchemeCardProps) {
  const getMatchColor = (score: number) => {
    if (score >= 70) return 'text-green-400'
    if (score >= 40) return 'text-gold'
    return 'text-muted-foreground'
  }

  const getMatchLabel = (score: number) => {
    if (score >= 70) return 'Excellent Match'
    if (score >= 40) return 'Good Match'
    return 'Potential Match'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="glass rounded-2xl overflow-hidden group"
    >
      {/* Header with match score */}
      <div className="relative p-6 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground group-hover:text-gold transition-colors">
              {scheme.name}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>{scheme.ministry}</span>
            </div>
          </div>
          
          {scheme.matchScore && (
            <div className="flex flex-col items-end">
              <div className={`text-3xl font-bold ${getMatchColor(scheme.matchScore)}`}>
                {scheme.matchScore}%
              </div>
              <span className={`text-xs ${getMatchColor(scheme.matchScore)}`}>
                {getMatchLabel(scheme.matchScore)}
              </span>
            </div>
          )}
        </div>

        {/* Category badge */}
        <div className="mt-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
            <Target className="w-3 h-3" />
            {scheme.category}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="p-6 pt-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {scheme.description}
        </p>

        {/* Benefits */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-gold" />
            Key Benefits
          </h4>
          <ul className="space-y-1.5">
            {scheme.benefits.slice(0, 3).map((benefit, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Eligibility */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">
            Eligibility Criteria
          </h4>
          <ul className="space-y-1">
            {scheme.eligibility.slice(0, 3).map((criteria, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {criteria}
              </li>
            ))}
          </ul>
        </div>

        {/* Apply button */}
        <div className="mt-6">
          <Button
            asChild
            className="w-full bg-gold hover:bg-gold/90 text-accent-foreground font-semibold"
          >
            <a href={scheme.applicationUrl} target="_blank" rel="noopener noreferrer">
              Apply Now
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
