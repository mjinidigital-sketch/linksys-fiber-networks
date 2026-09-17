'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { PlusIcon } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { FaqContent } from '@/lib/types/content'
import { sectionReveal, staggerContainer, itemFromLeft, headingReveal, viewport } from '@/lib/motion'

interface FAQProps {
  faqs?: FaqContent
}

export default function FAQ({ faqs }: FAQProps) {
  const reduceMotion = useReducedMotion()
  const items = [...(faqs?.items ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const leftItems  = items.slice(0, Math.ceil(items.length / 2))
  const rightItems = items.slice(Math.ceil(items.length / 2))

  if (!items.length) return null

  const container = staggerContainer(0.07, 0.1)

  return (
    <motion.section
      className="relative overflow-hidden border-b pb-20"
      initial={reduceMotion ? false : 'hidden'}
      whileInView={reduceMotion ? undefined : 'visible'}
      viewport={viewport.default}
      variants={sectionReveal}
    >
      {/* Subtle radial background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,hsl(var(--primary)/0.08),transparent)]"
      />

      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <motion.p
            variants={headingReveal}
            className="font-mono text-md uppercase tracking-[0.2em] text-secondary"
          >
            {faqs?.sectionLabel ?? 'Got questions?'}
          </motion.p>
          <motion.h2
            variants={headingReveal}
            className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl"
          >
            {faqs?.title ?? 'Frequently Asked Questions'}
          </motion.h2>
          {faqs?.subtitle && (
            <motion.p
              variants={headingReveal}
              className="mt-4 text-base leading-relaxed text-muted-foreground"
            >
              {faqs.subtitle}
            </motion.p>
          )}
        </div>

        {/* Two-column staggered accordion grid */}
        <div className="grid gap-x-12 md:grid-cols-2">
          <motion.div variants={container}>
            <FaqColumn items={leftItems} reduceMotion={!!reduceMotion} />
          </motion.div>
          <motion.div variants={container}>
            <FaqColumn items={rightItems} reduceMotion={!!reduceMotion} />
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

function FaqColumn({ items, reduceMotion }: { items: FaqContent['items']; reduceMotion: boolean }) {
  if (!items.length) return null

  return (
    <Accordion>
      {items.map((item) => (
        <motion.div key={item.id} variants={itemFromLeft}>
          <AccordionItem value={item.id}>
            <AccordionTrigger
              className={cn(
                'py-5 text-base font-semibold leading-snug text-foreground',
                'hover:text-primary hover:no-underline transition-colors'
              )}
            >
              <span className="flex-1 text-left">{item.question}</span>
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        </motion.div>
      ))}
    </Accordion>
  )
}
