'use client'

import { motion } from 'framer-motion'
import { Compass, Anchor } from 'lucide-react'

export function Header() {
  return (
    <header className="relative py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="text-gold"
          >
            <Compass className="w-10 h-10" />
          </motion.div>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="text-foreground">Yojna</span>
              <span className="text-gold"> AI</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Navigate Your Path to Government Benefits
            </p>
          </div>

          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-primary"
          >
            <Anchor className="w-8 h-8" />
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center text-muted-foreground mt-6 max-w-2xl mx-auto text-balance"
        >
          Set sail on your journey to discover government schemes tailored just for you. 
          Answer a few questions and let AI chart your course to the treasures you deserve.
        </motion.p>
      </div>
    </header>
  )
}
