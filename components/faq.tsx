'use client'

import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { FaqContent } from '@/lib/types/content'

interface FAQProps {
  faqs?: FaqContent
}

export default function FAQ({ faqs }: FAQProps) {
  // Sort by order field, fall back gracefully
  const items = [...(faqs?.items ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const leftItems = items.slice(0, Math.ceil(items.length / 2))
  const rightItems = items.slice(Math.ceil(items.length / 2))

  if (!items.length) return null

  return (
    <section className="relative overflow-hidden border-b pb-20">
      {/* Subtle radial background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,hsl(var(--primary)/0.08),transparent)]"
      />

      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <p className="font-mono text-md uppercase tracking-[0.2em] text-secondary">
            {faqs?.sectionLabel ?? 'Got questions?'}
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {faqs?.title ?? 'Frequently Asked Questions'}
          </h2>
          {faqs?.subtitle && (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {faqs.subtitle}
            </p>
          )}
        </div>

        {/* Two-column accordion grid */}
        <div className="grid gap-x-12 md:grid-cols-2">
          <FaqColumn items={leftItems} />
          <FaqColumn items={rightItems} />
        </div>
      </div>
    </section>
  )
}

function FaqColumn({ items }: { items: FaqContent['items'] }) {
  if (!items.length) return null

  return (
    <Accordion>
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger
            className={cn(
              'py-5 text-base font-semibold leading-snug text-foreground',
              'hover:text-primary hover:no-underline'
            )}
          >
            <span className="flex-1 text-left">{item.question}</span>
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
