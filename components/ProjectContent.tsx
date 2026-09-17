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
import { GithubIcon } from '@/components/ui/icons'
import { getProjectJsonLd, getBreadcrumbJsonLd } from '@/lib/structured-data'
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  ArrowUpRight,
  Briefcase,
  ArrowRight
} from 'lucide-react'

import { WebsiteContent } from '@/lib/types/content'

interface ProjectContentProps {
  id: string
  initialData?: WebsiteContent | null
}

export function ProjectContent({ id, initialData }: ProjectContentProps) {
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

  const project = content.projects?.items?.find((p) => p.id === id || p.link === id)
  const relatedProjects = (content.projects?.items || [])
    .filter((p) => p.id !== project?.id)
    .slice(0, 3)

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col w-full">
        <Navbar navigation={content.navigation} general={content.general} />
        <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 mt-6 pb-20 w-full">
          <div className="py-24 text-center space-y-4">
            <Briefcase className="mx-auto size-12 text-muted-foreground/50" aria-hidden="true" />
            <h1 className="text-2xl font-bold">Project Not Found</h1>
            <p className="text-sm text-muted-foreground">
              This project does not exist or has been removed.
            </p>
            <Link href="/projects">
              <Button variant="outline" className="rounded-xl">
                <ArrowLeft className="size-4 mr-1.5" aria-hidden="true" /> Back to Projects
              </Button>
            </Link>
          </div>
          <Footer footer={content.footer} general={content.general} />
        </main>
      </div>
    )
  }

  const projectJsonLd = getProjectJsonLd(project, content)
  const breadcrumbJsonLd = getBreadcrumbJsonLd(
    [
      { name: 'Home', path: '/' },
      { name: 'Projects', path: '/projects' },
      { name: project.title, path: `/projects/${project.id}` },
    ],
    content
  )

  const authorAvatarSrc = content.general.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400'

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Schema.org JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
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
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to all projects
        </Link>

        {/* Project Header */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="default" className="text-xs font-semibold px-3 py-1">
              {project.type}
            </Badge>
            {project.category && (
              <Badge variant="outline" className="text-xs font-mono">
                {project.category}
              </Badge>
            )}
            {project.featured && (
              <Badge variant="accent" className="text-xs">
                Featured
              </Badge>
            )}
            {project.completionDate && (
              <time dateTime={project.completionDate} className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                <Calendar className="size-3.5" aria-hidden="true" />
                {project.completionDate}
              </time>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08]">
            {project.title}
          </h1>

          {project.summary && (
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-normal">
              {project.summary}
            </p>
          )}

          {/* Tags & Links Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-border py-4">
            <ul className="flex flex-wrap gap-2 list-none p-0 m-0" aria-label="Project technologies">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-secondary px-2.5 py-1 font-mono text-xs text-secondary-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 shrink-0">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  aria-label="View source code on GitHub"
                >
                  <GithubIcon className="size-3.5" aria-hidden="true" /> View Code
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  aria-label="Launch live project"
                >
                  Launch <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* Cover Image */}
          {project.image && (
            <div className="relative aspect-[1.8/1] w-full overflow-hidden rounded-3xl border border-border bg-muted shadow-2xl">
              <Image
                src={project.image}
                alt={`${project.title} project screenshot`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
          )}
        </header>

        {/* Project Rich Text Body */}
        <section className="mt-12" aria-label="Project details">
          {project.content ? (
            <RichTextRenderer content={project.content} />
          ) : (
            <div className="space-y-4">
              <p className="text-base text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </div>
          )}
        </section>

        {/* Footer CTA */}
        <footer className="mt-16 border-t border-border pt-12 space-y-12">
          {/* Author / Contact CTA */}
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
                      Start a Project Together <ArrowRight className="size-3.5 ml-1" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <nav aria-label="More projects">
              <h2 className="text-xl font-bold tracking-tight mb-6">More Projects</h2>
              <ul className="grid gap-6 sm:grid-cols-3 list-none p-0">
                {relatedProjects.map((rel) => (
                  <li key={rel.id}>
                    <Link
                      href={`/projects/${rel.id}`}
                      className="group overflow-hidden rounded-3xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-xl block"
                    >
                      {rel.image && (
                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                          <Image
                            src={rel.image}
                            alt={`${rel.title} thumbnail`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, 33vw"
                          />
                        </div>
                      )}
                      <div className="p-4 space-y-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">{rel.type}</span>
                        <h3 className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">
                          {rel.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {rel.description}
                        </p>
                        <div className="flex items-center gap-1 text-xs font-semibold text-primary pt-1" aria-hidden="true">
                          <span>View project</span>
                          <ArrowUpRight className="size-3" />
                        </div>
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
