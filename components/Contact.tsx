'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { ArrowUpRight, Mail, Phone, MessageCircle } from 'lucide-react'
import { ContactContent } from '@/lib/types/content'

const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: 'easeOut' },
  },
}

interface ContactProps {
  contact?: ContactContent
  phone?: string
}

export function Contact({ contact, phone }: ContactProps) {
  const reduceMotion = useReducedMotion()
  if (!contact) return null

  // Format phone for tel: and WhatsApp links (strip spaces)
  const rawPhone = phone?.replace(/\s+/g, '') || ''
  const waPhone = rawPhone.replace('+', '')

  return (
    <motion.section
      initial={reduceMotion ? false : 'hidden'}
      whileInView={reduceMotion ? undefined : 'visible'}
      viewport={{ once: true, amount: 0.2 }}
      variants={reveal}
      id="contact"
      className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-primary-foreground sm:px-12 sm:py-20"
      aria-labelledby="contact-title"
    >
      <div className="relative z-10 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
          {contact.sectionLabel}
        </p>
        <h2 id="contact-title" className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
          {contact.title}
        </h2>
        <p className="mt-5 max-w-lg text-base leading-7 text-primary-foreground/75">
          {contact.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`mailto:${contact.email}`}
            id="contact-email-btn"
            className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-3 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5 shadow-lg"
          >
            <Mail className="size-4" />
            {contact.ctaText}
            <ArrowUpRight className="size-4" />
          </a>
          {rawPhone && (
            <>
              <a
                href={`tel:${rawPhone}`}
                id="contact-call-btn"
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-foreground/20 hover:-translate-y-0.5"
              >
                <Phone className="size-4" />
                {phone}
              </a>
              <a
                href={`https://wa.me/${waPhone}`}
                target="_blank"
                rel="noreferrer"
                id="contact-whatsapp-btn"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1ebe5d] hover:-translate-y-0.5 shadow-lg"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            </>
          )}
        </div>
      </div>
      <div
        className="pointer-events-none absolute -right-20 -top-32 size-96 rounded-full border border-primary-foreground/20"
        aria-hidden="true"
      />
    </motion.section>
  )
}
