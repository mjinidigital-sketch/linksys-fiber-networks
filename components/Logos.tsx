'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { LogosContent } from '@/lib/types/content'

const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: 'easeOut' },
  },
}

interface LogosProps {
  logos?: LogosContent
}

export function Logos({ logos }: LogosProps) {
  const reduceMotion = useReducedMotion()
  if (!logos) return null

  return (
    <motion.section
      initial={reduceMotion ? false : 'hidden'}
      whileInView={reduceMotion ? undefined : 'visible'}
      viewport={{ once: true, amount: 0.2 }}
      variants={reveal}
      className="py-4"
      aria-labelledby="logos-title"
    >
      <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            {logos.sectionLabel}
          </p>
          <h2 id="logos-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {logos.title}
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          {logos.subtitle}
        </p>
      </div>
      <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-border bg-card sm:grid-cols-4 lg:grid-cols-8">
        {logos.items.map((logo, index) => (
          <div
            key={logo}
            className="flex min-h-24 items-center justify-center border-b border-r border-border px-3 text-center transition-colors hover:bg-secondary sm:min-h-28 lg:border-b-0 lg:last:border-r-0"
          >
            <span
              className={`font-semibold tracking-tight ${
                index % 3 === 0 ? 'font-mono' : 'font-sans'
              } text-muted-foreground transition-colors hover:text-foreground`}
            >
              {logo}
            </span>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
