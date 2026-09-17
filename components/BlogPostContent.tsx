'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { RichTextRenderer } from '@/components/ui/rich-text-renderer'
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  BookOpen,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/toast'
import { getBlogPostJsonLd, getBreadcrumbJsonLd } from '@/lib/structured-data'
import { CommentsSection } from '@/components/CommentsSection'

import { WebsiteContent } from '@/lib/types/content'

interface BlogPostContentProps {
  slug: string
  initialData?: WebsiteContent | null
}

export function BlogPostContent({ slug, initialData }: BlogPostContentProps) {
  const router = useRouter()
  const { content, loading } = useWebsiteContent(initialData)
  const [copied, setCopied] = useState(false)

  if (!content || loading) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background animate-pulse">
        <div className="h-16 w-full border-b border-border/40 bg-card/20" />
        <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 mt-12 pb-20 w-full space-y-6">
          <div className="h-10 w-3/4 bg-muted/30 rounded-lg" />
          <div className="h-6 w-1/2 bg-muted/20 rounded-md" />
          <div className="h-96 bg-muted/20 rounded-2xl w-full" />
        </main>
      </div>
    )
  }

  const post = content.blog?.posts?.find((p) => p.slug === slug || p.id === slug)
  const relatedPosts = (content.blog?.posts || []).filter((p) => p.id !== post?.id && p.published).slice(0, 2)

  const handleShareTwitter = () => {
    if (!post) return
    const url = window.location.href
    const text = encodeURIComponent(`Check out "${post.title}" by ${content.general?.displayName || 'Linksys'}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank')
  }

  const handleShareLinkedIn = () => {
    const url = window.location.href
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.add({
      title: 'Link Copied',
      description: 'Article link copied to clipboard.',
      type: 'success',
    })
    setTimeout(() => setCopied(false), 2500)
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col w-full">
        <Navbar navigation={content.navigation} general={content.general} />
        <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 mt-6 pb-20 w-full">
          <div className="py-24 text-center space-y-4">
            <BookOpen className="mx-auto size-12 text-muted-foreground/50" aria-hidden="true" />
            <h1 className="text-2xl font-bold">Article Not Found</h1>
            <p className="text-sm text-muted-foreground">The article you are looking for does not exist or has been unpublished.</p>
            <Link href="/blog">
              <Button variant="outline" className="rounded-xl">
                <ArrowLeft className="size-4 mr-1.5" aria-hidden="true" /> Back to Blog
              </Button>
            </Link>
          </div>
          <Footer footer={content.footer} general={content.general} />
        </main>
      </div>
    )
  }

  const articleJsonLd = getBlogPostJsonLd(post, content)
  const breadcrumbJsonLd = getBreadcrumbJsonLd(
    [
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
      { name: post.title, path: `/blog/${post.slug || post.id}` },
    ],
    content
  )

  const authorAvatarSrc = content.general.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400'

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Schema.org JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
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
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to all articles
        </Link>

        {/* Article Meta Header */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="default" className="text-xs font-semibold px-3 py-1">
              {post.category}
            </Badge>
            <time dateTime={post.date} className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <Calendar className="size-3.5" aria-hidden="true" />
              {post.date}
            </time>
            <span className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <Clock className="size-3.5" aria-hidden="true" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08]">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-normal">
              {post.excerpt}
            </p>
          )}

          {/* Author Block & Share Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-border py-4">
            <address className="flex items-center gap-3 not-italic">
              <div className="size-10 overflow-hidden rounded-full border border-border bg-muted relative shrink-0">
                <Image
                  src={authorAvatarSrc}
                  alt={content.general.displayName}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{content.general.displayName}</p>
                <p className="text-[11px] text-muted-foreground">{content.general.role}</p>
              </div>
            </address>

            <div className="flex items-center gap-2" role="group" aria-label="Share this article">
              <span className="text-[11px] font-mono text-muted-foreground mr-1">Share:</span>
              {/* X / Twitter */}
              <button
                onClick={handleShareTwitter}
                className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Share on X (Twitter)"
              >
                <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.252 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
                </svg>
              </button>
              {/* LinkedIn */}
              <button
                onClick={handleShareLinkedIn}
                className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Share on LinkedIn"
              >
                <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
              <button
                onClick={handleCopyLink}
                className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Copy article link"
              >
                {copied ? <Check className="size-3.5 text-emerald-500" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative aspect-[1.8/1] w-full overflow-hidden rounded-3xl border border-border bg-muted shadow-2xl">
              <Image
                src={post.coverImage}
                alt={`Cover image for ${post.title}`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
          )}
        </header>

        {/* Article Rich Text Body */}
        <section className="mt-12" aria-label="Article content">
          {post.content ? (
            <RichTextRenderer content={post.content} />
          ) : (
            <div className="p-8 text-center border border-dashed rounded-3xl text-muted-foreground text-sm">
              <p>No content has been written for this article yet.</p>
            </div>
          )}
        </section>

        {/* Article End Card */}
        <footer className="mt-16 border-t border-border pt-12 space-y-12">
          {/* Author Bio Box */}
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
                      Get in touch with Victor <ArrowRight className="size-3.5 ml-1" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Comments and Likes Section */}
          <CommentsSection postId={post.slug || post.id} />

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <nav aria-label="More articles">
              <h2 className="text-xl font-bold tracking-tight mb-6">More Articles</h2>
              <ul className="grid gap-6 sm:grid-cols-2 list-none p-0">
                {relatedPosts.map((rPost) => (
                  <li key={rPost.id}>
                    <Link
                      href={`/blog/${rPost.slug}`}
                      className="group block rounded-3xl border border-border bg-card p-5 hover:border-primary/50 transition-all hover:shadow-xl space-y-3"
                    >
                      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                        <span className="text-primary font-semibold">{rPost.category}</span>
                        <span aria-hidden="true">•</span>
                        <span>{rPost.readTime}</span>
                      </div>
                      <h3 className="text-base font-bold group-hover:text-primary transition-colors line-clamp-2">
                        {rPost.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {rPost.excerpt}
                      </p>
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
