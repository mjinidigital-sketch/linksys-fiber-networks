'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { StatsContent } from '@/lib/types/content'
import { sectionReveal, staggerContainer, scalePop, headingReveal, viewport } from '@/lib/motion'

const Stats = ({ stats }: { stats?: StatsContent }) => {
  const reduceMotion = useReducedMotion()
  const items = stats?.items ?? []
  if (!items.length) return null

  const container = staggerContainer(0.1, 0.05)

  return (
    <motion.div
      className="border-b pb-20"
      initial={reduceMotion ? false : 'hidden'}
      whileInView={reduceMotion ? undefined : 'visible'}
      viewport={viewport.default}
      variants={sectionReveal}
    >
      <div className="mx-auto w-full max-w-(--breakpoint-xl)">
        {stats?.sectionLabel && (
          <motion.p
            variants={headingReveal}
            className="font-mono text-base uppercase tracking-[0.2em] text-accent-foreground mb-4"
          >
            {stats.sectionLabel}
          </motion.p>
        )}
        <motion.h2
          variants={headingReveal}
          className="font-bold text-4xl md:text-5xl"
        >
          {stats?.title || "The impact we've made so far"}
        </motion.h2>
        {stats?.subtitle && (
          <motion.p
            variants={headingReveal}
            className="mt-4.5 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            {stats.subtitle}
          </motion.p>
        )}

        <motion.div
          className="mt-6 grid justify-center gap-x-10 gap-y-16 sm:mt-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          variants={container}
        >
          {items.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              variants={scalePop}
              className="bg-accent-foreground/5 rounded-2xl p-8 border border-secondary/30"
              whileHover={reduceMotion ? {} : { y: -4, scale: 1.02, transition: { duration: 0.2 } }}
            >
              <span className="font-bold text-4xl tracking-tight md:text-6xl text-primary dark:text-accent-foreground">
                {item.value}
              </span>
              <hr className="my-3 h-1 bg-secondary w-1/2" />
              <p className="font-medium text-lg">{item.label}</p>
              <p className="mt-2 text-muted-foreground text-xs">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Stats
