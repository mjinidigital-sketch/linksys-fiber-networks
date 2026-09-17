'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Zap, Smile, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeaturesContent } from '@/lib/types/content'
import { sectionReveal, staggerContainer, itemReveal, headingReveal, viewport } from '@/lib/motion'

const Features = ({ features }: { features?: FeaturesContent }) => {
  const reduceMotion = useReducedMotion()
  const items = features?.items ?? []

  if (!items.length) return null

  const containerVariants = staggerContainer(0.08, 0.1)

  return (
    <motion.div
      className="flex max-w-7xl flex-col"
      initial={reduceMotion ? false : 'hidden'}
      whileInView={reduceMotion ? undefined : 'visible'}
      viewport={viewport.default}
      variants={sectionReveal}
    >
      {/* Header */}
      <motion.h2
        variants={headingReveal}
        className="text-pretty text-left font-bold text-4xl md:text-5xl"
      >
        {features?.title || 'Designed to scale'}
      </motion.h2>
      <motion.p
        variants={headingReveal}
        className="mt-3 text-left text-muted-foreground text-xl -tracking-[0.01em] sm:text-2xl"
      >
        {features?.subtitle || 'Spend less time configuring and more time creating'}
      </motion.p>

      {/* Grid */}
      <motion.div
        className="mt-12 grid grid-cols-1 bg-card sm:grid-cols-2 lg:grid-cols-3 rounded-xl overflow-hidden"
        variants={containerVariants}
      >
        {/* Label row */}
        <motion.div
          variants={itemReveal}
          className="flex h-16 items-center border px-6 font-medium text-lg sm:col-span-2 md:col-span-1 text-secondary"
        >
          <Smile className="mr-4 text-accent-foreground" />
          {features?.sectionLabel || 'Features that make you happy'}
        </motion.div>
        <div className="-mr-px hidden h-16 border bg-[repeating-linear-gradient(315deg,var(--muted)_0,var(--muted)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed md:block lg:col-span-2" />

        {items.map((feature, index) => {
          const Icon = (feature.icon && (LucideIcons as any)[feature.icon]) || Zap
          return (
            <motion.div
              key={feature.id || index}
              variants={itemReveal}
              className="-mt-px -mr-px border border-border/75 px-5 pt-7 pb-5"
              whileHover={reduceMotion ? {} : { y: -3, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/7 text-primary dark:bg-primary/10">
                  <Icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-xl tracking-[-0.005em]">
                  {feature.title}
                </h3>
              </div>
              <p className="mt-4 text-foreground/80">{feature.description}</p>
              <Button
                className="mt-6 bg-white/10"
                variant="outline"
                render={<Link href="#" target="_blank" />}
                nativeButton={false}
              >
                Learn more <ArrowUpRight className="text-secondary" />
              </Button>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}

export default Features
