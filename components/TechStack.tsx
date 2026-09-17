'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { TechStackContent } from '@/lib/types/content'

const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: 'easeOut' },
  },
}

interface TechStackProps {
  techStack?: TechStackContent
}

export function TechStack({ techStack }: TechStackProps) {
  const reduceMotion = useReducedMotion()
  if (!techStack) return null

  return (
    <motion.section
      initial={reduceMotion ? false : 'hidden'}
      whileInView={reduceMotion ? undefined : 'visible'}
      viewport={{ once: true, amount: 0.2 }}
      variants={reveal}
      id="about"
      className="border-y border-border py-8 md:-mt-8"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="font-mono text-xl font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {techStack.sectionLabel}
        </p>
        <span className="text-sm text-muted-foreground">{techStack.subtitle}</span>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Technology stack">
        {techStack.items.map((technology) => (
          <span
            key={technology}
            className="rounded-full border border-border bg-secondary px-3 py-1.5 font-mono text-xs text-secondary-foreground transition-colors hover:border-primary/50"
          >
            {technology}
          </span>
        ))}
      </div>
    </motion.section>
  )
}
