'use client'

import { useState, useEffect } from 'react'
import {
  Sparkles,
  Save,
  Upload,
  ExternalLink,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  RotateCcw,
} from 'lucide-react'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ContentHeader } from '@/components/admin/ContentHeader'
import { ImageUploader } from '@/components/ui/image-uploader'
import { HeroContent, HeroSlide } from '@/lib/types/content'

// Normalize stored images to {url, alt} objects (backward compat with plain strings)
function toSlideObj(img: string | HeroSlide, index: number): HeroSlide {
  if (typeof img === 'string') return { url: img, alt: `Hero showcase image ${index + 1}` }
  return { url: img.url || '', alt: img.alt || '' }
}
function getSlideUrl(img: string | HeroSlide): string {
  return typeof img === 'string' ? img : img.url
}

const DEFAULT_SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551808525-51a94da548ce?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520869562399-e772f042f422?q=80&w=1200&auto=format&fit=crop',
]

export default function HeroComponentPage() {
  const { content, saving, lastSaved, updateSection } = useWebsiteContent()
  const { toast } = useToast()

  const heroData: HeroContent = content?.hero || {
    badge: 'Senior Full Stack & Systems Engineer',
    titleLine1: 'Engineering High-Performance',
    titleHighlight1: 'Web Systems',
    titleLine2: 'With Scalable',
    titleHighlight2: 'Cloud Architecture',
    bio: 'Specializing in reactive full-stack web applications, real-time database architecture, and polished developer experiences.',
    primaryCtaText: 'View Selected Work',
    primaryCtaLink: '#projects',
    secondaryCtaText: 'Get in Touch',
    secondaryCtaLink: '#contact',
    locationText: 'Nairobi, Kenya (Available Worldwide / Remote)',
    avatarUrl: '/images/avatar.jpg',
    statusCardLabel: 'Current Focus',
    statusCardText: 'Building Real-time Reactive Web Apps',
    statusCardHighlight: 'Open to High-Impact Opportunities',
    images: DEFAULT_SAMPLE_IMAGES,
  }

  const [formData, setFormData] = useState<HeroContent>(heroData)
  const [newImageUrl, setNewImageUrl] = useState('')

  useEffect(() => {
    if (content?.hero) {
      setFormData({
        ...content.hero,
        images: content.hero.images || [],
      })
    }
  }, [content?.hero])

  const handleSave = async () => {
    const res = await updateSection('hero', formData)
    if (res.success) {
      toast({ title: 'Hero section saved', description: 'Hero configuration updated successfully.' })
    }
  }

  const handleAddUploadedImage = (url: string) => {
    if (!url) return
    const currentImages = (formData.images || []) as (string | HeroSlide)[]
    setFormData({
      ...formData,
      images: [...currentImages, { url, alt: '' }],
    })
    toast({
      title: 'Picture Added',
      description: 'Image added to hero carousel slides.',
    })
  }

  const handleAddUrlImage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newImageUrl.trim()) return
    const currentImages = (formData.images || []) as (string | HeroSlide)[]
    setFormData({
      ...formData,
      images: [...currentImages, { url: newImageUrl.trim(), alt: '' }],
    })
    setNewImageUrl('')
    toast({
      title: 'Picture URL Added',
      description: 'Image added to hero carousel slides.',
    })
  }

  const handleRemoveImage = (indexToRemove: number) => {
    const currentImages = (formData.images || []) as (string | HeroSlide)[]
    const updated = currentImages.filter((_, idx) => idx !== indexToRemove)
    setFormData({
      ...formData,
      images: updated,
    })
  }

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const currentImages = [...((formData.images || []) as (string | HeroSlide)[])]
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= currentImages.length) return

    const temp = currentImages[index]
    currentImages[index] = currentImages[targetIndex]
    currentImages[targetIndex] = temp

    setFormData({
      ...formData,
      images: currentImages,
    })
  }

  const handleUpdateSlideAlt = (index: number, alt: string) => {
    const currentImages = [...((formData.images || []) as (string | HeroSlide)[])]
    const existing = currentImages[index]
    const url = getSlideUrl(existing)
    currentImages[index] = { url, alt }
    setFormData({ ...formData, images: currentImages })
  }

  const handleResetDefaultImages = () => {
    setFormData({
      ...formData,
      images: [...DEFAULT_SAMPLE_IMAGES],
    })
    toast({
      title: 'Default Images Restored',
      description: 'Hero carousel loaded with the 4 default showcase photos.',
    })
  }

  const imagesList = ((formData.images || []) as (string | HeroSlide)[]).map(toSlideObj)

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Hero Section Component"
        description="Customize the main headline, glowing keywords, intro biography, call-to-action buttons, carousel photos, and floating status card."
        badge="Hero Section"
        saving={saving}
        lastSaved={lastSaved}
        liveRoute="/"
        onSave={handleSave}
      />

      {/* ── Carousel Pictures & Thumbnails Section (Full Width) ── */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ImageIcon className="size-4 text-primary" />
                Hero Carousel Pictures & Thumbnails
              </CardTitle>
              <CardDescription className="text-xs">
                Upload showcase pictures for the hero slider. Reorder, preview thumbnails, and customize slides.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetDefaultImages}
                className="text-xs h-8"
              >
                <RotateCcw className="size-3.5 mr-1" />
                Load Defaults
              </Button>
              {imagesList.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData({ ...formData, images: [] })}
                  className="text-xs h-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3.5 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-2 space-y-6">
          {/* Thumbnails Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-xs font-semibold text-foreground">
                Current Slides ({imagesList.length} {imagesList.length === 1 ? 'picture' : 'pictures'})
              </Label>
              {imagesList.length === 0 && (
                <span className="text-[11px] text-amber-500 font-medium">
                  Currently displaying default system pictures on live site
                </span>
              )}
            </div>

            {imagesList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imagesList.map((slide, idx) => (
                  <div
                    key={`${slide.url}-${idx}`}
                    className="group relative overflow-hidden rounded-xl border border-border/80 bg-muted/20 p-2 transition-all hover:border-primary/50 hover:shadow-lg space-y-2"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                      <img
                        src={slide.url}
                        alt={slide.alt || `Slide thumbnail ${idx + 1}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/600x400/1e293b/ffffff?text=Image+Not+Found'
                        }}
                      />

                      {/* Slide Index Badge */}
                      <div className="absolute top-2 left-2 z-10">
                        <Badge
                          variant={idx === 0 ? 'default' : 'secondary'}
                          className="text-[10px] font-mono px-2 py-0.5 shadow-sm backdrop-blur-md"
                        >
                          {idx === 0 ? '★ Slide 1 (Cover)' : `Slide ${idx + 1}`}
                        </Badge>
                      </div>

                      {/* External Link */}
                      <a
                        href={slide.url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute top-2 right-2 z-10 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/90"
                        title="View Full Size"
                      >
                        <ExternalLink className="size-3" />
                      </a>

                      {/* Hover Action Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={idx === 0}
                          onClick={() => handleMoveImage(idx, 'left')}
                          className="size-8 p-0 rounded-full"
                          title="Move earlier (left)"
                        >
                          <ChevronLeft className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveImage(idx)}
                          className="size-8 p-0 rounded-full"
                          title="Delete slide"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={idx === imagesList.length - 1}
                          onClick={() => handleMoveImage(idx, 'right')}
                          className="size-8 p-0 rounded-full"
                          title="Move later (right)"
                        >
                          <ChevronRight className="size-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Alt Text input */}
                    <div className="px-1 space-y-1">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Alt Text</Label>
                      <Input
                        value={slide.alt}
                        onChange={(e) => handleUpdateSlideAlt(idx, e.target.value)}
                        placeholder={`e.g. Fiber cables in Molo CBD`}
                        className="text-xs h-7"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-card/30">
                <ImageIcon className="mx-auto size-10 text-muted-foreground/60 mb-2" />
                <p className="text-sm font-semibold text-foreground">No Custom Slides Uploaded</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  Upload pictures below to create your custom hero showcase. If left empty, the site automatically uses the 4 default network showcase pictures.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetDefaultImages}
                  className="mt-4 text-xs"
                >
                  <RotateCcw className="size-3.5 mr-1.5" />
                  Load 4 Default Images as Starting Point
                </Button>
              </div>
            )}
          </div>

          {/* Upload New Picture / Add URL Box */}
          <div className="rounded-xl border border-border/80 bg-muted/10 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="size-4 text-primary" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Upload New Picture to Carousel
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Convex Storage Drag & Drop Image Uploader */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Direct File Upload (Convex Storage)
                </Label>
                <ImageUploader
                  onChange={(uploadedUrl) => {
                    if (uploadedUrl) {
                      handleAddUploadedImage(uploadedUrl)
                    }
                  }}
                  placeholder="Drop or click to upload picture directly"
                  aspectRatio="video"
                />
              </div>

              {/* URL Input Form */}
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground block">
                  Or Add Picture via Web URL
                </Label>
                <form onSubmit={handleAddUrlImage} className="space-y-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="text-xs"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newImageUrl.trim()}
                    className="w-full text-xs"
                  >
                    <Plus className="size-3.5 mr-1" />
                    Add Picture to Slides
                  </Button>
                </form>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Tip: Upload high-resolution images (recommended 1200×900 or 16:9 / 4:3 ratio) for optimal rendering across desktop and mobile screens.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Headline & Bio */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-bold">Headline & Badge</CardTitle>
              <CardDescription className="text-xs">The primary impact banner text visible above the fold.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2 space-y-4">
              <div>
                <Label className="text-xs">Badge Tagline</Label>
                <Input
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. Senior Full Stack & Systems Engineer"
                  className="mt-1 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Title Line 1 (Standard)</Label>
                  <Input
                    value={formData.titleLine1}
                    onChange={(e) => setFormData({ ...formData, titleLine1: e.target.value })}
                    placeholder="Engineering High-Performance"
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Highlight 1 (Gradient / Colored)</Label>
                  <Input
                    value={formData.titleHighlight1}
                    onChange={(e) => setFormData({ ...formData, titleHighlight1: e.target.value })}
                    placeholder="Web Systems"
                    className="mt-1 text-sm font-semibold text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Title Line 2 (Standard)</Label>
                  <Input
                    value={formData.titleLine2}
                    onChange={(e) => setFormData({ ...formData, titleLine2: e.target.value })}
                    placeholder="With Scalable"
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Highlight 2 (Gradient / Colored)</Label>
                  <Input
                    value={formData.titleHighlight2}
                    onChange={(e) => setFormData({ ...formData, titleHighlight2: e.target.value })}
                    placeholder="Cloud Architecture"
                    className="mt-1 text-sm font-semibold text-primary"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Introduction Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Short paragraph describing your expertise..."
                  className="mt-1 text-sm"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-xs">Location & Availability String</Label>
                <Input
                  value={formData.locationText}
                  onChange={(e) => setFormData({ ...formData, locationText: e.target.value })}
                  placeholder="Nairobi, Kenya (Available Worldwide / Remote)"
                  className="mt-1 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons & Links */}
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-bold">Call to Action Buttons</CardTitle>
              <CardDescription className="text-xs">Primary and secondary action buttons rendered in the hero.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 rounded-xl border border-border/70 p-3.5 bg-muted/10">
                  <p className="text-xs font-semibold text-primary">Primary Button</p>
                  <div>
                    <Label className="text-xs">Button Label</Label>
                    <Input
                      value={formData.primaryCtaText}
                      onChange={(e) => setFormData({ ...formData, primaryCtaText: e.target.value })}
                      placeholder="View Selected Work"
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Target Link</Label>
                    <Input
                      value={formData.primaryCtaLink}
                      onChange={(e) => setFormData({ ...formData, primaryCtaLink: e.target.value })}
                      placeholder="/projects or #projects"
                      className="mt-1 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2 rounded-xl border border-border/70 p-3.5 bg-muted/10">
                  <p className="text-xs font-semibold text-muted-foreground">Secondary Button</p>
                  <div>
                    <Label className="text-xs">Button Label</Label>
                    <Input
                      value={formData.secondaryCtaText}
                      onChange={(e) => setFormData({ ...formData, secondaryCtaText: e.target.value })}
                      placeholder="Get in Touch"
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Target Link</Label>
                    <Input
                      value={formData.secondaryCtaLink}
                      onChange={(e) => setFormData({ ...formData, secondaryCtaLink: e.target.value })}
                      placeholder="/contact or #contact"
                      className="mt-1 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Avatar & Floating Status Card */}
        <div className="space-y-6">
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-bold">Hero Avatar Image</CardTitle>
              <CardDescription className="text-xs">Portrait avatar displayed when avatar layout is enabled.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <ImageUploader
                value={formData.avatarUrl || ''}
                onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
                placeholder="Upload or paste avatar image URL"
              />
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/60">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-bold">Floating Status Card</CardTitle>
              <CardDescription className="text-xs">Interactive badge overlay shown on top of the carousel.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2 space-y-3">
              <div>
                <Label className="text-xs">Status Label</Label>
                <Input
                  value={formData.statusCardLabel}
                  onChange={(e) => setFormData({ ...formData, statusCardLabel: e.target.value })}
                  placeholder="Current Focus"
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Main Status Text</Label>
                <Input
                  value={formData.statusCardText}
                  onChange={(e) => setFormData({ ...formData, statusCardText: e.target.value })}
                  placeholder="Building Real-time Reactive Web Apps"
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Highlight Subtext</Label>
                <Input
                  value={formData.statusCardHighlight}
                  onChange={(e) => setFormData({ ...formData, statusCardHighlight: e.target.value })}
                  placeholder="Open to High-Impact Opportunities"
                  className="mt-1 text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
