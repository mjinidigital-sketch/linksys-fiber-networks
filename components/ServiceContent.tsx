'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { RichTextRenderer } from '@/components/ui/rich-text-renderer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, ArrowLeft, ArrowRight, ArrowUpRight, Layers, Code2 } from 'lucide-react'
import { getServiceJsonLd, getBreadcrumbJsonLd } from '@/lib/structured-data'

import { WebsiteContent } from '@/lib/types/content'

interface ServiceContentProps {
  id: string
  initialData?: WebsiteContent | null
}

export function ServiceContent({ id, initialData }: ServiceContentProps) {
  const { content, loading } = useWebsiteContent(initialData)

  if (!content || loading) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background animate-pulse">
        <div className="h-16 w-full border-b border-border/40 bg-card/20" />
        <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 mt-12 pb-20 w-full space-y-6">
          <div className="h-10 w-64 bg-muted/30 rounded-lg" />
          <div className="h-80 bg-muted/20 rounded-2xl w-full" />
        </main>
      </div>
    )
  }

  const service = content.services?.items?.find((s) => s.id === id)
  const relatedServices = (content.services?.items || [])
    .filter((s) => s.id !== service?.id)
    .slice(0, 3)

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col w-full">
        <Navbar navigation={content.navigation} general={content.general} />
        <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 mt-6 pb-20 w-full">
          <div className="py-24 text-center space-y-4">
            <Layers className="mx-auto size-12 text-muted-foreground/50" aria-hidden="true" />
            <h1 className="text-2xl font-bold">Service Not Found</h1>
            <p className="text-sm text-muted-foreground">
              This service does not exist or has been removed.
            </p>
            <Link href="/services">
              <Button variant="outline" className="rounded-xl">
                <ArrowLeft className="size-4 mr-1.5" aria-hidden="true" /> Back to Services
              </Button>
            </Link>
          </div>
          <Footer footer={content.footer} general={content.general} />
        </main>
      </div>
    )
  }

  const serviceJsonLd = getServiceJsonLd(service, content)
  const breadcrumbJsonLd = getBreadcrumbJsonLd(
    [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: service.title, path: `/services/${service.id}` },
    ],
    content
  )

  const authorAvatarSrc = content.general.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400'

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Schema.org JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Navbar navigation={content.navigation} general={content.general} />

      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 mt-6 pb-20 w-full">
        <article className="mx-auto max-w-4xl py-12 sm:py-16">
        {/* Back Link */}
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to all services
        </Link>

        {/* Service Header */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            {service.popular && (
              <Badge variant="default" className="text-xs font-semibold px-3 py-1">
                Most Popular
              </Badge>
            )}
            {service.price && (
              <Badge variant="outline" className="text-xs font-mono font-bold">
                {service.price}
              </Badge>
            )}
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 p-4 text-primary shrink-0" aria-hidden="true">
              <Code2 className="size-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                {service.title}
              </h1>
              {service.summary && (
                <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
                  {service.summary}
                </p>
              )}
            </div>
          </div>

          {/* Overview Description */}
          <div className="border-y border-border py-5">
            <p className="text-base text-muted-foreground leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Features Checklist */}
          {service.features && service.features.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                What&apos;s Included
              </p>
              <ul className="grid gap-2.5 sm:grid-cols-2 list-none p-0">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA Row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl bg-primary/5 border border-primary/20 p-5">
            <div className="flex-1">
              <p className="font-semibold text-sm">Ready to get started?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Investment: <span className="font-bold text-foreground">{service.price || 'Custom scope'}</span>
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25 shrink-0"
            >
              Inquire Now <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </header>

        {/* Detailed Service Content (Rich Text) */}
        {service.content && (
          <section className="mt-12" aria-label="Scope and deliverables">
            <h2 className="text-xl font-bold tracking-tight mb-6 border-b border-border pb-4">
              Scope &amp; Deliverables
            </h2>
            <RichTextRenderer content={service.content} />
          </section>
        )}

        {/* Footer */}
        <footer className="mt-16 border-t border-border pt-12 space-y-12">
          {/* Author Bio */}
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="size-16 shrink-0 overflow-hidden rounded-2xl border border-primary/30 shadow-lg relative">
                <Image
                  src={authorAvatarSrc}
                  alt={content.general.displayName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <p className="font-bold text-lg">{content.general.displayName}</p>
                <p className="text-xs font-mono text-primary uppercase tracking-wider">{content.general.role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {content.general.shortBio}
                </p>
                <div className="pt-2">
                  <Link href="/contact">
                    <Button size="sm" className="rounded-xl text-xs font-semibold">
                      Let&apos;s Work Together <ArrowRight className="size-3.5 ml-1" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Other Services */}
          {relatedServices.length > 0 && (
            <nav aria-label="Other services">
              <h2 className="text-xl font-bold tracking-tight mb-6">Other Services</h2>
              <ul className="grid gap-4 sm:grid-cols-3 list-none p-0">
                {relatedServices.map((rel) => (
                  <li key={rel.id}>
                    <Link
                      href={`/services/${rel.id}`}
                      className="group rounded-3xl border border-border bg-card p-5 hover:border-primary/50 transition-all hover:shadow-xl space-y-3 block"
                    >
                      <div className="rounded-xl bg-primary/10 p-2.5 text-primary w-fit" aria-hidden="true">
                        <Code2 className="size-4" />
                      </div>
                      <h3 className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">
                        {rel.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {rel.description}
                      </p>
                      {rel.price && (
                        <p className="text-xs font-mono font-bold text-primary">{rel.price}</p>
                      )}
                      <div className="flex items-center gap-1 text-xs font-semibold text-primary pt-1" aria-hidden="true">
                        <span>View service</span>
                        <ArrowUpRight className="size-3" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </footer>
      </article>

      <Footer footer={content.footer} general={content.general} />
      </main>
    </div>
  )
}
