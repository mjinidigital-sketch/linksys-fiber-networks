'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion, type Variants, type PanInfo } from 'framer-motion'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Code2,
  Mail,
  MapPin,
  Sparkles,
  Globe,
  ChevronLeft,
  ChevronRight,
  Wifi,
} from 'lucide-react'
import Link from 'next/link'
import { HeroContent, HeroSlide, SocialLink } from '@/lib/types/content'

// Normalize a slide entry — supports both legacy plain-string URLs and new {url,alt} objects
function normalizeSlide(slide: string | HeroSlide, index: number): HeroSlide {
  if (typeof slide === 'string') return { url: slide, alt: `Hero showcase image ${index + 1}` }
  return { url: slide.url, alt: slide.alt || `Hero showcase image ${index + 1}` }
}

const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: 'easeOut' },
  },
}

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 280, damping: 28, mass: 0.8 },
      opacity: { duration: 0.35, ease: 'easeOut' },
      scale: { duration: 0.35, ease: 'easeOut' },
    },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.96,
    transition: {
      x: { type: 'spring', stiffness: 280, damping: 28, mass: 0.8 },
      opacity: { duration: 0.3, ease: 'easeIn' },
      scale: { duration: 0.3, ease: 'easeIn' },
    },
  }),
}

const reducedMotionVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

const DEFAULT_CAROUSEL_IMAGES = [
  'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551808525-51a94da548ce?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520869562399-e772f042f422?q=80&w=1200&auto=format&fit=crop',
]

const DEFAULT_HERO: HeroContent = {
  badge: 'Linksys Fiber Networks Molo',
  titleLine1: 'High-Speed Fiber &',
  titleHighlight1: 'Internet Solutions',
  titleLine2: 'Powering Molo &',
  titleHighlight2: 'Surrounding Environs',
  bio: 'Experience dependable high-speed fiber internet, enterprise LAN cabling, and smart CCTV installations tailored for homes and businesses.',
  primaryCtaText: 'View Packages',
  primaryCtaLink: '/packages',
  secondaryCtaText: 'Contact Support',
  secondaryCtaLink: '/contact',
  locationText: 'Generis Hotel Building, Molo CBD, Nakuru County',
  avatarUrl: '/images/avatar.jpg',
  statusCardLabel: 'Network Status',
  statusCardText: '99.9% Uptime Guarantee',
  statusCardHighlight: 'Active in Molo',
  images: DEFAULT_CAROUSEL_IMAGES,
}

export interface HeroProps {
  hero?: HeroContent
  socials?: SocialLink[]
}

export function Hero({
  hero,
  socials = [],
}: HeroProps) {
  const reduceMotion = useReducedMotion()

  const h: HeroContent = {
    ...DEFAULT_HERO,
    ...(hero || {}),
  }

  // Carousel images with fallback — normalised to {url, alt} objects
  const slides: HeroSlide[] =
    h.images && h.images.length > 0
      ? h.images.map(normalizeSlide)
      : DEFAULT_CAROUSEL_IMAGES.map(normalizeSlide)

  const [[currentIndex, direction], setPage] = useState<[number, number]>([0, 0])
  const [isPaused, setIsPaused] = useState(false)
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({})

  const paginate = useCallback(
    (newDirection: number) => {
      setPage(([prevIndex]) => {
        const nextIndex = (prevIndex + newDirection + slides.length) % slides.length
        return [nextIndex, newDirection]
      })
    },
    [slides.length]
  )

  const goToSlide = (index: number) => {
    setPage(([prevIndex]) => [index, index > prevIndex ? 1 : -1])
  }

  // Auto-advance
  useEffect(() => {
    if (isPaused || slides.length <= 1) return
    const interval = setInterval(() => {
      paginate(1)
    }, 4800)
    return () => clearInterval(interval)
  }, [currentIndex, isPaused, slides.length, paginate])

  // Drag & Swipe gesture handling
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const swipeConfidenceThreshold = 10000
    const swipePower = Math.abs(info.offset.x) * info.velocity.x
    if (swipePower < -swipeConfidenceThreshold || info.offset.x < -60) {
      paginate(1)
    } else if (swipePower > swipeConfidenceThreshold || info.offset.x > 60) {
      paginate(-1)
    }
  }

  const currentSlide = slides[currentIndex]
  const currentImage = currentSlide?.url

  return (
    <motion.section
      initial={reduceMotion ? false : 'hidden'}
      whileInView={reduceMotion ? undefined : 'visible'}
      viewport={{ once: true, amount: 0.15 }}
      variants={reveal}
      className="relative overflow-hidden grid items-center gap-10 mt-2 order-b border-secondary/30 lg:grid-cols-12 lg:gap-12"
      aria-label="Introduction"
    >
      {/* ── Background Subtle SVG Pattern & Fiber Optic Waves ── */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* Soft atmospheric ambient glow */}
        <div
          className="absolute -top-24 left-0 w-[550px] h-[400px] rounded-full blur-[120px] opacity-35 dark:opacity-20 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at center, rgba(3, 74, 113, 0.4) 0%, rgba(13, 164, 245, 0.15) 45%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[450px] rounded-full blur-[130px] opacity-25 dark:opacity-15 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at center, rgba(119, 192, 65, 0.35) 0%, rgba(3, 74, 113, 0.1) 50%, transparent 70%)',
          }}
        />

        {/* SVG Decorative Canvas */}
        <svg
          className="absolute inset-0 w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft Elliptical Mask for the grid pattern so it softly fades toward edges */}
            <radialGradient id="hero-mask-grad" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <mask id="hero-grid-mask">
              <rect width="100%" height="100%" fill="url(#hero-mask-grad)" />
            </mask>

            {/* Subtle Tech Grid Pattern */}
            <pattern
              id="hero-tech-pattern"
              width="36"
              height="36"
              patternUnits="userSpaceOnUse"
            >
              {/* Vertex connection dot */}
              <circle cx="18" cy="18" r="0.9" className="fill-foreground/15 dark:fill-white/20" />
              {/* Subtle crosshair lines */}
              <line x1="18" y1="14" x2="18" y2="22" stroke="currentColor" strokeWidth="0.5" className="stroke-foreground/10 dark:stroke-white/10" />
              <line x1="14" y1="18" x2="22" y2="18" stroke="currentColor" strokeWidth="0.5" className="stroke-foreground/10 dark:stroke-white/10" />
            </pattern>
          </defs>

          {/* Masked Micro-Grid Pattern */}
          <rect
            width="100%"
            height="100%"
            fill="url(#hero-tech-pattern)"
            mask="url(#hero-grid-mask)"
          />
        </svg>
      </div>

      {/* Left Column: Content */}
      <div className="relative z-10 lg:col-span-6 flex flex-col justify-center">
        {h.badge && (
          <p className="mb-4 inline-flex items-center gap-2 self-start rounded-full border border-secondary/80 bg-secondary/10 px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-secondary sm:text-xs">
            <Sparkles className="size-3.5 text-secondary shrink-0" aria-hidden="true" />
            {h.badge}
          </p>
        )}

        <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl">
          {h.titleLine1} <span className="text-accent-foreground dark:text-secondary">{h.titleHighlight1}</span>{' '}
          {h.titleLine2} <span className="text-accent-foreground dark:text-secondary">{h.titleHighlight2}</span>
        </h1>

        <p className="mt-4 max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
          {h.bio}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={h.primaryCtaLink || '/packages'}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            {h.primaryCtaText || 'Explore Packages'}
            <ArrowUpRight
              className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
          <Link
            href={h.secondaryCtaLink || '/contact'}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-secondary bg-background/80 px-6 py-3.5 text-sm font-semibold backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card hover:text-primary active:translate-y-0"
          >
            {h.secondaryCtaText || 'Contact Support'}
            <Mail className="size-4 text-secondary" aria-hidden="true" />
          </Link>
        </div>

        {/* Location & Social Nav */}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          {h.locationText && (
            <span className="inline-flex items-center gap-2 font-medium">
              <MapPin className="size-4 text-secondary shrink-0" aria-hidden="true" />
              {h.locationText}
            </span>
          )}

          {socials && socials.length > 0 && (
            <>
              {socials.map((soc) => (
                <span key={soc.id} className="inline-flex items-center gap-3">
                  <span className="h-4 w-px bg-border/60" aria-hidden="true" />
                  <a
                    href={soc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                    aria-label={soc.label || soc.platform}
                  >
                    {soc.platform.toLowerCase().includes('github') ? (
                      <Code2 className="size-4 text-secondary" aria-hidden="true" />
                    ) : soc.platform.toLowerCase().includes('linkedin') ? (
                      <BriefcaseBusiness className="size-4 text-secondary" aria-hidden="true" />
                    ) : (
                      <Globe className="size-4 text-secondary" aria-hidden="true" />
                    )}
                    {soc.label || soc.platform}
                  </a>
                </span>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Right Column: Image Carousel */}
      <div className="relative z-10 lg:col-span-6 w-full">
        {/* Subtle Ambient Backlight Glow */}
        <div
          className="absolute -inset-2 rounded-xl bg-gradient-to-tr from-primary/30 via-primary/10 to-transparent blur-2xl opacity-60 pointer-events-none -z-10"
          aria-hidden="true"
        />

        {/* Carousel Viewport Container */}
        <div
          className="group relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-square overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xl transition-all"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Hero Image Showcase"
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') paginate(-1)
            if (e.key === 'ArrowRight') paginate(1)
          }}
        >
          {/* Framer Motion Animated Slide */}
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={reduceMotion ? reducedMotionVariants : slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag={reduceMotion ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.65}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 size-full cursor-grab active:cursor-grabbing overflow-hidden"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${currentIndex + 1} of ${slides.length}`}
            >
              {currentImage && !failedImages[currentIndex] ? (
                <Image
                  src={currentImage}
                  alt={currentSlide?.alt || `Hero showcase image ${currentIndex + 1}`}
                  fill
                  priority={currentIndex === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  onError={() =>
                    setFailedImages((prev) => ({ ...prev, [currentIndex]: true }))
                  }
                  className="size-full object-cover select-none pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-card to-primary/10 rounded-xl">
                  <Wifi className="size-16 text-primary animate-pulse" />
                  <span className="mt-3 font-mono text-sm text-muted-foreground">
                    Linksys Fiber Connectivity
                  </span>
                </div>
              )}


              {/* ── Subtle multi-layer overlay ───────────────────────────── */}

              {/* 1. Radial vignette — darkens corners/edges only, centre stays clear */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.28) 100%)',
                }}
              />

              {/* 2. Soft bottom scrim — keeps slide counter & dots readable */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.32) 0%, transparent 100%)',
                }}
              />

              {/* 3. Whisper brand tint — unifies images with site palette */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-[0.12] bg-primary rounded-xl"
              />

            </motion.div>
          </AnimatePresence>

          {/* Slide Counter Pill (Top Right) */}
          {slides.length > 1 && (
            <div className="absolute top-3 right-3 z-20 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-mono font-medium text-white/95 backdrop-blur-md border border-white/15 select-none shadow-sm">
              {currentIndex + 1} / {slides.length}
            </div>
          )}

          {/* Left Navigation Arrow */}
          {slides.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                paginate(-1)
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/15 opacity-0 transition-all duration-200 group-hover:opacity-100 focus:opacity-100 hover:bg-black/70 hover:scale-105 active:scale-95 shadow-md"
              aria-label="Previous image slide"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
          )}

          {/* Right Navigation Arrow */}
          {slides.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                paginate(1)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/15 opacity-0 transition-all duration-200 group-hover:opacity-100 focus:opacity-100 hover:bg-black/70 hover:scale-105 active:scale-95 shadow-md"
              aria-label="Next image slide"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          )}

          {/* Bottom Indicators Dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-md border border-white/15 shadow-sm">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToSlide(i)
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? 'w-6 bg-white shadow-sm'
                      : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === currentIndex ? 'true' : 'false'}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating Status Card Over Corner */}
        {h.statusCardLabel && (
          <div className="absolute -bottom-4 -left-2 sm:-left-6 z-20 rounded-xl border border-border/80 bg-card/80 px-4 py-3 shadow-xl backdrop-blur-md flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {h.statusCardLabel}
              </p>
              <p className="mt-0.5 text-xs sm:text-sm font-semibold text-foreground">
                {h.statusCardText}{' '}
                <span className="text-primary">{h.statusCardHighlight}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  )
}
