'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion'
import {
  Sparkles,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Grid,
  Layers,
  Wifi,
  ShieldCheck,
  Server
} from 'lucide-react'
import { GalleryContent, GalleryImage, GallerySection } from '@/lib/types/content'
import { Button } from './ui/button'

const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  {
    src: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop',
    alt: 'High-speed Fiber Optic Splicing & Trunk Cabling',
    title: 'Fiber Cable Splicing',
    category: 'Fiber Optics',
    description: 'Precision fusion splicing on core optical fiber links powering high-speed internet in Molo CBD.'
  },
  {
    src: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
    alt: 'Server Rack & Core Networking Switches',
    title: 'Core Server Operations',
    category: 'Datacenter',
    description: 'High-capacity Gigabit routing equipment and redundant distribution switches maintaining 99.9% uptime.'
  },
  {
    src: 'https://images.unsplash.com/photo-1551808525-51a94da548ce?q=80&w=1200&auto=format&fit=crop',
    alt: 'Long-Range Wireless Access Point & Antenna',
    title: 'Point-to-Point Wireless Towers',
    category: 'Wireless & WiFi',
    description: 'Wireless radio access points delivering high-throughput broadband to outlying estates around Molo.'
  },
  {
    src: 'https://images.unsplash.com/photo-1520869562399-e772f042f422?q=80&w=1200&auto=format&fit=crop',
    alt: 'Smart CCTV Camera Installation & Network Monitoring',
    title: 'IP CCTV Security System',
    category: 'CCTV & Security',
    description: '4K Ultra-HD security surveillance with remote mobile viewing installed for local commercial hubs.'
  },
  {
    src: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop',
    alt: 'Field Technicians Deploying Overhead Fiber Connections',
    title: 'Last-Mile Home Installation',
    category: 'Field Team',
    description: 'Our dedicated certified installation team dropping fiber cable to residential premises in Tayari & Moto.'
  },
  {
    src: 'https://images.unsplash.com/photo-1551703599-6b3e8379aa8c?q=80&w=1200&auto=format&fit=crop',
    alt: 'Structured LAN Cabling & Patch Panels',
    title: 'Structured Office Cabling',
    category: 'Fiber Optics',
    description: 'Neat Cat6 enterprise cabling and patch panel termination for office spaces in Molo Town.'
  }
]

export interface GalleryProps {
  gallery?: GalleryContent
  sections?: GallerySection[]
  images?: (GalleryImage | string)[]
  sectionLabel?: string
  title?: string
  subtitle?: string
}

function normalizeImage(item: GalleryImage | string, index: number): GalleryImage {
  if (typeof item === 'string') {
    return {
      src: item,
      alt: `Showcase image ${index + 1}`,
      title: `Showcase Photo ${index + 1}`,
      category: 'General'
    }
  }
  return {
    src: item.src || (item as any).url || '',
    alt: item.alt || `Showcase image ${index + 1}`,
    title: item.title || `Photo ${index + 1}`,
    category: item.category || 'General',
    description: item.description
  }
}

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}

export function Gallery({
  gallery,
  sections,
  images,
  sectionLabel,
  title,
  subtitle
}: GalleryProps) {
  const reduceMotion = useReducedMotion()

  // Resolve content props with fallbacks
  const labelText = sectionLabel || gallery?.sectionLabel || 'Photo Showcase'
  const mainTitle = title || gallery?.title || 'Network & Field Operations'
  const titleHighlight = gallery?.titleHighlight || 'Gallery'
  const subText =
    subtitle ||
    gallery?.subtitle ||
    'Explore our installation projects, network infrastructure, and field deployments across Molo and its environs.'

  // Extract all images into a clean unified list
  let rawImages: (GalleryImage | string)[] = []
  if (images && images.length > 0) {
    rawImages = images
  } else if (gallery?.images && gallery.images.length > 0) {
    rawImages = gallery.images
  } else if (sections && sections.length > 0) {
    rawImages = sections.flatMap((sec) => sec.images || [])
  } else if (gallery?.sections && gallery.sections.length > 0) {
    rawImages = gallery.sections.flatMap((sec) => sec.images || [])
  }

  const normalizedImages: GalleryImage[] =
    rawImages.length > 0
      ? rawImages.map(normalizeImage)
      : DEFAULT_GALLERY_IMAGES

  // Extract unique categories for filter tabs
  const customCategories = gallery?.categories || []
  const existingCategories = Array.from(
    new Set(normalizedImages.map((img) => img.category || 'General'))
  ).filter(Boolean)

  const allCategories = ['All', ...Array.from(new Set([...customCategories.filter(c => c !== 'All'), ...existingCategories]))]

  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({})

  // Filtered list based on selected category tab
  const filteredImages = normalizedImages.filter((img) => {
    if (activeCategory === 'All') return true
    return (img.category || 'General').toLowerCase() === activeCategory.toLowerCase()
  })

  // Lightbox keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev === null ? 0 : (prev - 1 + filteredImages.length) % filteredImages.length))
      }
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % filteredImages.length))
      }
    },
    [lightboxIndex, filteredImages.length]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const activeImage = lightboxIndex !== null ? filteredImages[lightboxIndex] : null

  return (
    <motion.section
      initial={reduceMotion ? false : 'hidden'}
      whileInView={reduceMotion ? undefined : 'visible'}
      viewport={{ once: true, amount: 0.15 }}
      variants={revealVariants}
      className="relative overflow-hidden py-16 sm:py-24 border-b border-secondary/30"
      aria-label="Photo Gallery"
    >
      {/* ── Background Subtle Tech Grid & Ambient Glow ── */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 overflow-hidden select-none"
        aria-hidden="true"
      >
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] rounded-full blur-[140px] opacity-25 dark:opacity-15 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at center, rgba(3, 74, 113, 0.4) 0%, rgba(13, 164, 245, 0.15) 50%, transparent 75%)'
          }}
        />

        <svg className="absolute inset-0 w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="gallery-mask-grad" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <mask id="gallery-grid-mask">
              <rect width="100%" height="100%" fill="url(#gallery-mask-grad)" />
            </mask>
            <pattern id="gallery-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" className="fill-foreground/15 dark:fill-white/15" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gallery-grid-pattern)" mask="url(#gallery-grid-mask)" />
        </svg>
      </div>

      <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-left max-w-3xl space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-secondary/80 bg-secondary/10 px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-secondary">
            <Sparkles className="size-3.5 text-secondary shrink-0" aria-hidden="true" />
            {labelText}
          </p>

          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            {mainTitle}{' '}
            <span className="text-accent-foreground dark:text-secondary relative inline-block">
              {titleHighlight}
              <span className="absolute bottom-1 left-0 -z-10 h-2 w-full bg-primary/20 rounded-full" aria-hidden="true" />
            </span>
          </h2>

          <p className="text-pretty text-base text-muted-foreground sm:text-lg">
            {subText}
          </p>
        </div>

        {/* Category Filter Tabs */}
        {allCategories.length > 1 && (
          <div className="mt-8 mb-10 flex flex-wrap items-left justify-left gap-2">
            {allCategories.map((category) => {
              const isActive = activeCategory.toLowerCase() === category.toLowerCase()
              return (
                <Button
                  key={category}
                  type="button"
                  size="lg"
                  onClick={() => setActiveCategory(category)}
                  className={`relative rounded-full px-6 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105'
                      : 'bg-card border border-secondary text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span>{category}</span>
                </Button>
              )
            })}
          </div>
        )}

        {/* Gallery Grid */}
        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image, index) => {
              const hasFailed = failedImages[index]
              return (
                <motion.div
                  key={`${image.src}-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35 }}
                  className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 aspect-[4/3] cursor-pointer"
                  onClick={() => setLightboxIndex(index)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${image.title || 'image'}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setLightboxIndex(index)
                    }
                  }}
                >
                  {!hasFailed ? (
                    <Image
                      src={image.src}
                      alt={image.alt || image.title || 'Gallery showcase image'}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={() => setFailedImages((prev) => ({ ...prev, [index]: true }))}
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-4 text-center">
                      <ImageIcon className="size-12 text-primary/60 mb-2 animate-pulse" />
                      <span className="text-xs font-semibold text-foreground">{image.title}</span>
                      <span className="text-[10px] text-muted-foreground mt-1">Linksys Fiber Showcase</span>
                    </div>
                  )}

                  {/* Dark scrim gradient overlay on hover */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90"
                  />

                  {/* Category Pill Tag (Top Left) */}
                  {image.category && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="rounded-full bg-black/50 px-2.5 py-1 font-mono text-[10px] font-semibold text-white/90 backdrop-blur-md border border-white/20 shadow-xs">
                        {image.category}
                      </span>
                    </div>
                  )}

                  {/* Zoom Indicator Icon (Top Right) */}
                  <div className="absolute top-3 right-3 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-md hover:scale-110 transition-transform">
                      <Maximize2 className="size-4" />
                    </span>
                  </div>

                  {/* Bottom Text Content Overlay */}
                  <div className="absolute inset-x-0 bottom-0 z-10 p-4 transform translate-y-1 transition-transform duration-300 group-hover:translate-y-0">
                    <h3 className="text-base font-bold text-white line-clamp-1">
                      {image.title}
                    </h3>
                    {image.description && (
                      <p className="mt-1 text-xs text-white/80 line-clamp-2 leading-relaxed">
                        {image.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {filteredImages.length === 0 && (
          <div className="my-12 rounded-2xl border border-dashed border-border p-12 text-center">
            <ImageIcon className="mx-auto size-10 text-muted-foreground/40 mb-3" />
            <p className="text-base font-semibold">No images available in this category</p>
            <p className="text-xs text-muted-foreground mt-1">Select another filter tab above.</p>
          </div>
        )}
      </div>

      {/* ── Interactive Lightbox Modal ── */}
      <AnimatePresence>
        {lightboxIndex !== null && activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label="Image Lightbox"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Main Lightbox Content Box */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative max-w-5xl w-full overflow-hidden rounded-3xl border border-white/15 bg-zinc-950/90 shadow-2xl flex flex-col max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Header Bar inside Lightbox */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-black/40">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-primary/20 px-2.5 py-0.5 font-mono text-xs font-semibold text-primary border border-primary/30">
                    {activeImage.category || 'Gallery'}
                  </span>
                  <span className="font-mono text-xs text-white/60">
                    {lightboxIndex + 1} of {filteredImages.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close Lightbox"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Image Viewport */}
              <div className="relative flex-1 min-h-[320px] max-h-[68vh] w-full flex items-center justify-center bg-black/60 overflow-hidden p-2">
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt || activeImage.title || 'Lightbox photo'}
                  fill
                  priority
                  className="object-contain size-full select-none"
                  sizes="100vw"
                />

                {/* Left Navigation Arrow */}
                {filteredImages.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setLightboxIndex(
                        (lightboxIndex - 1 + filteredImages.length) % filteredImages.length
                      )
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex size-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-black/90 hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                )}

                {/* Right Navigation Arrow */}
                {filteredImages.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setLightboxIndex((lightboxIndex + 1) % filteredImages.length)
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex size-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-black/90 hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                )}
              </div>

              {/* Bottom Caption Bar */}
              <div className="border-t border-white/10 px-6 py-4 bg-zinc-950/80">
                <h3 className="text-lg font-bold text-white">
                  {activeImage.title}
                </h3>
                {activeImage.description && (
                  <p className="mt-1 text-sm text-zinc-300 leading-relaxed">
                    {activeImage.description}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

export const GalleryComponent = Gallery
export default Gallery
