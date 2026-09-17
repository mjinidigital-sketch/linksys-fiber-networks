'use client'

import { useState } from 'react'
import {
  X, Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
  Sparkles, Wrench, Globe, Compass, Mail, HelpCircle,
  Code2, Megaphone, RotateCcw, Info, Layers, Briefcase,
  LayoutTemplate, FileText, Upload, Image as ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ImageUploader } from '@/components/ui/image-uploader'
import { PageComponentBlock, ComponentBlockType } from '@/lib/types/content'

// Block types that pull from global collections — not editable per-block
const FIXED_BLOCKS = new Set<ComponentBlockType>(['projects', 'services', 'templates', 'blog', 'logos', 'careers'])

interface BlockContentEditorProps {
  block: PageComponentBlock
  globalContent: Record<string, any>
  onSave: (updatedBlock: PageComponentBlock) => void
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Field helpers
// ---------------------------------------------------------------------------

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs font-semibold text-foreground">{label}</Label>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-primary">{label}</span>
      <div className="flex-1 h-px bg-primary/20" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-editors per block type
// ---------------------------------------------------------------------------

function HeroEditor({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (key: string, val: any) => onChange({ ...data, [key]: val })
  return (
    <div className="space-y-4">
      <SectionDivider label="Badge & Headline" />
      <FieldRow label="Badge Text" hint="e.g. 'Full-stack developer'">
        <Input value={data.badge || ''} onChange={e => set('badge', e.target.value)} placeholder="Full-stack developer" className="text-sm" />
      </FieldRow>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Title Line 1">
          <Input value={data.titleLine1 || ''} onChange={e => set('titleLine1', e.target.value)} placeholder="I build" className="text-sm" />
        </FieldRow>
        <FieldRow label="Title Highlight 1">
          <Input value={data.titleHighlight1 || ''} onChange={e => set('titleHighlight1', e.target.value)} placeholder="websites & apps" className="text-sm" />
        </FieldRow>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Title Line 2">
          <Input value={data.titleLine2 || ''} onChange={e => set('titleLine2', e.target.value)} placeholder="that drive business" className="text-sm" />
        </FieldRow>
        <FieldRow label="Title Highlight 2">
          <Input value={data.titleHighlight2 || ''} onChange={e => set('titleHighlight2', e.target.value)} placeholder="growth." className="text-sm" />
        </FieldRow>
      </div>

      <SectionDivider label="Bio & Location" />
      <FieldRow label="Bio / Intro Paragraph">
        <Textarea value={data.bio || ''} onChange={e => set('bio', e.target.value)} rows={3} placeholder="Short intro about yourself..." className="text-sm resize-none" />
      </FieldRow>
      <FieldRow label="Location Text">
        <Input value={data.locationText || ''} onChange={e => set('locationText', e.target.value)} placeholder="Nairobi, Kenya" className="text-sm" />
      </FieldRow>
      <FieldRow label="Avatar URL" hint="Optional override">
        <Input value={data.avatarUrl || ''} onChange={e => set('avatarUrl', e.target.value)} placeholder="https://..." className="text-sm font-mono" />
      </FieldRow>

      <SectionDivider label="CTA Buttons" />
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Primary Button Text">
          <Input value={data.primaryCtaText || ''} onChange={e => set('primaryCtaText', e.target.value)} placeholder="See my work" className="text-sm" />
        </FieldRow>
        <FieldRow label="Primary Button Link">
          <Input value={data.primaryCtaLink || ''} onChange={e => set('primaryCtaLink', e.target.value)} placeholder="/projects" className="text-sm font-mono" />
        </FieldRow>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Secondary Button Text">
          <Input value={data.secondaryCtaText || ''} onChange={e => set('secondaryCtaText', e.target.value)} placeholder="Let's talk" className="text-sm" />
        </FieldRow>
        <FieldRow label="Secondary Button Link">
          <Input value={data.secondaryCtaLink || ''} onChange={e => set('secondaryCtaLink', e.target.value)} placeholder="/contact" className="text-sm font-mono" />
        </FieldRow>
      </div>

      <SectionDivider label="Status Card" />
      <div className="grid grid-cols-3 gap-3">
        <FieldRow label="Label">
          <Input value={data.statusCardLabel || ''} onChange={e => set('statusCardLabel', e.target.value)} placeholder="Currently crafting" className="text-sm" />
        </FieldRow>
        <FieldRow label="Text">
          <Input value={data.statusCardText || ''} onChange={e => set('statusCardText', e.target.value)} placeholder="The next big thing" className="text-sm" />
        </FieldRow>
        <FieldRow label="Highlight Char">
          <Input value={data.statusCardHighlight || ''} onChange={e => set('statusCardHighlight', e.target.value)} placeholder="." className="text-sm font-mono" />
        </FieldRow>
      </div>

      <SectionDivider label="Carousel Images" />
      <div className="space-y-3">
        {/* Existing slides — each with ImageUploader + Alt Text field */}
        {(Array.isArray(data.images) ? data.images : []).map((slide: any, i: number) => {
          // Support legacy plain-string URLs and new {url,alt} objects
          const slideUrl: string = typeof slide === 'string' ? slide : (slide?.url || '')
          const slideAlt: string = typeof slide === 'string' ? '' : (slide?.alt || '')
          const updateSlide = (field: 'url' | 'alt', val: string) => {
            const updated = [...(data.images || [])]
            updated[i] = { url: field === 'url' ? val : slideUrl, alt: field === 'alt' ? val : slideAlt }
            set('images', updated)
          }
          return (
            <div key={i} className="rounded-xl border border-border/70 bg-muted/10 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
                  {i === 0 ? '★ Cover Slide' : `Slide ${i + 1}`}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    const updated = (data.images || []).filter((_: any, idx: number) => idx !== i)
                    set('images', updated)
                  }}
                  title="Remove slide"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              {/* Image upload / preview */}
              <ImageUploader
                value={slideUrl}
                onChange={(url) => updateSlide('url', url)}
                placeholder={`Upload image for Slide ${i + 1}`}
                aspectRatio="video"
              />
              {/* Alt text input */}
              <FieldRow label="Alt Text" hint="Shown to screen readers & on image load failure">
                <Input
                  value={slideAlt}
                  onChange={(e) => updateSlide('alt', e.target.value)}
                  placeholder={`e.g. Fiber internet installation in Molo`}
                  className="text-xs"
                />
              </FieldRow>
            </div>
          )
        })}

        {/* Add new slide via file upload */}
        <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-primary">
            <Upload className="size-3" />
            Add New Slide
          </div>
          <ImageUploader
            onChange={(url) => {
              if (!url) return
              const current = Array.isArray(data.images) ? data.images : []
              set('images', [...current, { url, alt: '' }])
            }}
            placeholder="Upload or drop image to add a new slide"
            aspectRatio="video"
          />
        </div>
      </div>
    </div>
  )
}

function TechStackEditor({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const items: string[] = data.items || []
  const [newItem, setNewItem] = useState('')
  const set = (key: string, val: any) => onChange({ ...data, [key]: val })

  const addItem = () => {
    if (!newItem.trim()) return
    set('items', [...items, newItem.trim()])
    setNewItem('')
  }
  const removeItem = (i: number) => set('items', items.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-4">
      <SectionDivider label="Section Header" />
      <FieldRow label="Section Label" hint="Small uppercase label">
        <Input value={data.sectionLabel || ''} onChange={e => set('sectionLabel', e.target.value)} placeholder="Trusted toolkit" className="text-sm" />
      </FieldRow>
      <FieldRow label="Subtitle">
        <Input value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} placeholder="The tools behind the work" className="text-sm" />
      </FieldRow>

      <SectionDivider label="Technology Items" />
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-sm font-mono">{item}</div>
            <Button type="button" variant="ghost" size="icon" className="size-7 text-destructive shrink-0" onClick={() => removeItem(i)}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem())} placeholder="Add technology... (Enter to add)" className="text-sm font-mono" />
          <Button type="button" size="sm" variant="outline" onClick={addItem} className="shrink-0 gap-1">
            <Plus className="size-3.5" /> Add
          </Button>
        </div>
      </div>
    </div>
  )
}

function LogosEditor({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const items: string[] = data.items || []
  const [newItem, setNewItem] = useState('')
  const set = (key: string, val: any) => onChange({ ...data, [key]: val })

  const addItem = () => {
    if (!newItem.trim()) return
    set('items', [...items, newItem.trim()])
    setNewItem('')
  }
  const removeItem = (i: number) => set('items', items.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-4">
      <SectionDivider label="Section Header" />
      <FieldRow label="Section Label">
        <Input value={data.sectionLabel || ''} onChange={e => set('sectionLabel', e.target.value)} placeholder="Built with intention" className="text-sm" />
      </FieldRow>
      <FieldRow label="Title">
        <Input value={data.title || ''} onChange={e => set('title', e.target.value)} placeholder="Tools that move ideas forward." className="text-sm" />
      </FieldRow>
      <FieldRow label="Subtitle">
        <Textarea value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} rows={2} className="text-sm resize-none" />
      </FieldRow>

      <SectionDivider label="Logo Items" />
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-sm font-mono">{item}</div>
            <Button type="button" variant="ghost" size="icon" className="size-7 text-destructive shrink-0" onClick={() => removeItem(i)}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem())} placeholder="Add logo / tool name..." className="text-sm font-mono" />
          <Button type="button" size="sm" variant="outline" onClick={addItem} className="shrink-0 gap-1">
            <Plus className="size-3.5" /> Add
          </Button>
        </div>
      </div>
    </div>
  )
}

interface ProcessStep { id: string; stepNumber: string; title: string; description: string }

function ProcessEditor({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const steps: ProcessStep[] = data.steps || []
  const set = (key: string, val: any) => onChange({ ...data, [key]: val })

  const addStep = () => {
    const next: ProcessStep = {
      id: `proc-${Date.now()}`,
      stepNumber: String(steps.length + 1).padStart(2, '0'),
      title: '',
      description: '',
    }
    set('steps', [...steps, next])
  }

  const updateStep = (i: number, field: keyof ProcessStep, val: string) => {
    const updated = steps.map((s, idx) => idx === i ? { ...s, [field]: val } : s)
    set('steps', updated)
  }

  const removeStep = (i: number) => set('steps', steps.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-4">
      <SectionDivider label="Section Header" />
      <FieldRow label="Section Label">
        <Input value={data.sectionLabel || ''} onChange={e => set('sectionLabel', e.target.value)} placeholder="How I work" className="text-sm" />
      </FieldRow>
      <FieldRow label="Title">
        <Input value={data.title || ''} onChange={e => set('title', e.target.value)} placeholder="From rough idea to real-world impact." className="text-sm" />
      </FieldRow>

      <SectionDivider label="Process Steps" />
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={step.id} className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-primary">Step {i + 1}</span>
              <Button type="button" variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => removeStep(i)}>
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <FieldRow label="Step #">
                <Input value={step.stepNumber} onChange={e => updateStep(i, 'stepNumber', e.target.value)} placeholder="01" className="text-sm font-mono" />
              </FieldRow>
              <div className="col-span-2">
                <FieldRow label="Title">
                  <Input value={step.title} onChange={e => updateStep(i, 'title', e.target.value)} placeholder="Clarify" className="text-sm" />
                </FieldRow>
              </div>
            </div>
            <FieldRow label="Description">
              <Textarea value={step.description} onChange={e => updateStep(i, 'description', e.target.value)} rows={2} placeholder="What happens in this step..." className="text-sm resize-none" />
            </FieldRow>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addStep} className="w-full gap-1.5 text-xs">
          <Plus className="size-3.5" /> Add Step
        </Button>
      </div>
    </div>
  )
}

interface FaqItem { id: string; question: string; answer: string; order: number }

function FaqEditor({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const items: FaqItem[] = data.items || []
  const [expanded, setExpanded] = useState<number | null>(null)
  const set = (key: string, val: any) => onChange({ ...data, [key]: val })

  const addItem = () => {
    const newItem: FaqItem = {
      id: `faq-${Date.now()}`,
      question: '',
      answer: '',
      order: items.length + 1,
    }
    set('items', [...items, newItem])
    setExpanded(items.length)
  }

  const updateItem = (i: number, field: keyof FaqItem, val: string | number) => {
    const updated = items.map((item, idx) => idx === i ? { ...item, [field]: val } : item)
    set('items', updated)
  }

  const removeItem = (i: number) => {
    set('items', items.filter((_, idx) => idx !== i))
    setExpanded(null)
  }

  return (
    <div className="space-y-4">
      <SectionDivider label="Section Header" />
      <FieldRow label="Section Label">
        <Input value={data.sectionLabel || ''} onChange={e => set('sectionLabel', e.target.value)} placeholder="Got questions?" className="text-sm" />
      </FieldRow>
      <FieldRow label="Title">
        <Input value={data.title || ''} onChange={e => set('title', e.target.value)} placeholder="Frequently Asked Questions" className="text-sm" />
      </FieldRow>
      <FieldRow label="Subtitle">
        <Textarea value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} rows={2} className="text-sm resize-none" />
      </FieldRow>

      <SectionDivider label="FAQ Items" />
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={item.id} className="rounded-xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="flex w-full items-center justify-between gap-2 p-3 text-left hover:bg-muted/40 transition-colors"
            >
              <span className="text-sm font-medium text-foreground line-clamp-1">
                {item.question || <span className="text-muted-foreground italic">Untitled question {i + 1}</span>}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button type="button" onClick={e => { e.stopPropagation(); removeItem(i) }} className="rounded p-1 text-destructive hover:bg-destructive/10">
                  <Trash2 className="size-3.5" />
                </button>
                {expanded === i ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
              </div>
            </button>
            {expanded === i && (
              <div className="border-t border-border p-3 space-y-2 bg-muted/10">
                <FieldRow label="Question">
                  <Input value={item.question} onChange={e => updateItem(i, 'question', e.target.value)} placeholder="What kind of projects do you take on?" className="text-sm" />
                </FieldRow>
                <FieldRow label="Answer">
                  <Textarea value={item.answer} onChange={e => updateItem(i, 'answer', e.target.value)} rows={3} placeholder="Your answer..." className="text-sm resize-none" />
                </FieldRow>
              </div>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full gap-1.5 text-xs">
          <Plus className="size-3.5" /> Add FAQ Item
        </Button>
      </div>
    </div>
  )
}

function ContactEditor({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (key: string, val: string) => onChange({ ...data, [key]: val })
  return (
    <div className="space-y-4">
      <SectionDivider label="Section Header" />
      <FieldRow label="Section Label">
        <Input value={data.sectionLabel || ''} onChange={e => set('sectionLabel', e.target.value)} placeholder="Have a good idea?" className="text-sm" />
      </FieldRow>
      <FieldRow label="Title">
        <Input value={data.title || ''} onChange={e => set('title', e.target.value)} placeholder="Let's make it feel inevitable." className="text-sm" />
      </FieldRow>
      <FieldRow label="Subtitle">
        <Textarea value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} rows={3} placeholder="Tell me what you're building..." className="text-sm resize-none" />
      </FieldRow>

      <SectionDivider label="Contact Details" />
      <FieldRow label="Email Address">
        <Input value={data.email || ''} onChange={e => set('email', e.target.value)} placeholder="you@example.com" className="text-sm font-mono" type="email" />
      </FieldRow>
      <FieldRow label="CTA Button Text">
        <Input value={data.ctaText || ''} onChange={e => set('ctaText', e.target.value)} placeholder="Start a conversation" className="text-sm" />
      </FieldRow>
      <FieldRow label="Location">
        <Input value={data.location || ''} onChange={e => set('location', e.target.value)} placeholder="Nairobi, Kenya" className="text-sm" />
      </FieldRow>
    </div>
  )
}

function CtaBannerEditor({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (key: string, val: string) => onChange({ ...data, [key]: val })
  return (
    <div className="space-y-4">
      <SectionDivider label="Banner Content" />
      <FieldRow label="Headline">
        <Input value={data.title || ''} onChange={e => set('title', e.target.value)} placeholder="Ready to start your next project?" className="text-sm" />
      </FieldRow>
      <FieldRow label="Description">
        <Textarea value={data.description || ''} onChange={e => set('description', e.target.value)} rows={2} placeholder="Let's collaborate to build something great." className="text-sm resize-none" />
      </FieldRow>
      <SectionDivider label="Button" />
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Button Text">
          <Input value={data.ctaText || ''} onChange={e => set('ctaText', e.target.value)} placeholder="Get in Touch" className="text-sm" />
        </FieldRow>
        <FieldRow label="Button Link">
          <Input value={data.ctaLink || ''} onChange={e => set('ctaLink', e.target.value)} placeholder="/contact" className="text-sm font-mono" />
        </FieldRow>
      </div>
    </div>
  )
}

function CustomHtmlEditor({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (key: string, val: string) => onChange({ ...data, [key]: val })
  return (
    <div className="space-y-4">
      <SectionDivider label="Block Content" />
      <FieldRow label="Title">
        <Input value={data.title || ''} onChange={e => set('title', e.target.value)} placeholder="Block title" className="text-sm" />
      </FieldRow>
      <FieldRow label="Description">
        <Textarea value={data.description || ''} onChange={e => set('description', e.target.value)} rows={2} placeholder="Optional description..." className="text-sm resize-none" />
      </FieldRow>
      <FieldRow label="HTML Content" hint="Raw HTML — renders directly">
        <Textarea value={data.html || ''} onChange={e => set('html', e.target.value)} rows={8} placeholder="<p>Your custom HTML here</p>" className="text-sm font-mono resize-y" />
      </FieldRow>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Features editor
// ---------------------------------------------------------------------------

interface FeatureItem { id: string; title: string; description: string; icon?: string }

function FeaturesEditor({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const items: FeatureItem[] = data.items || []
  const [expanded, setExpanded] = useState<number | null>(null)
  const set = (key: string, val: any) => onChange({ ...data, [key]: val })

  const addItem = () => {
    const newItem: FeatureItem = { id: `feat-${Date.now()}`, title: '', description: '', icon: 'Zap' }
    set('items', [...items, newItem])
    setExpanded(items.length)
  }

  const updateItem = (i: number, field: keyof FeatureItem, val: string) => {
    set('items', items.map((item, idx) => idx === i ? { ...item, [field]: val } : item))
  }

  const removeItem = (i: number) => {
    set('items', items.filter((_, idx) => idx !== i))
    setExpanded(null)
  }

  return (
    <div className="space-y-4">
      <SectionDivider label="Section Header" />
      <FieldRow label="Section Label" hint="Small label above title">
        <Input value={data.sectionLabel || ''} onChange={e => set('sectionLabel', e.target.value)} placeholder="Features that make you happy" className="text-sm" />
      </FieldRow>
      <FieldRow label="Title">
        <Input value={data.title || ''} onChange={e => set('title', e.target.value)} placeholder="Designed to scale" className="text-sm" />
      </FieldRow>
      <FieldRow label="Subtitle">
        <Input value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} placeholder="Spend less time configuring..." className="text-sm" />
      </FieldRow>

      <SectionDivider label="Feature Items" />
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={item.id} className="rounded-xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="flex w-full items-center justify-between gap-2 p-3 text-left hover:bg-muted/40 transition-colors"
            >
              <span className="text-sm font-medium text-foreground line-clamp-1">
                {item.title || <span className="text-muted-foreground italic">Untitled feature {i + 1}</span>}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button type="button" onClick={e => { e.stopPropagation(); removeItem(i) }} className="rounded p-1 text-destructive hover:bg-destructive/10">
                  <Trash2 className="size-3.5" />
                </button>
                {expanded === i ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
              </div>
            </button>
            {expanded === i && (
              <div className="border-t border-border p-3 space-y-2 bg-muted/10">
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="Title">
                    <Input value={item.title} onChange={e => updateItem(i, 'title', e.target.value)} placeholder="Feature name" className="text-sm" />
                  </FieldRow>
                  <FieldRow label="Icon" hint="Lucide icon name">
                    <Input value={item.icon || ''} onChange={e => updateItem(i, 'icon', e.target.value)} placeholder="Zap" className="text-sm font-mono" />
                  </FieldRow>
                </div>
                <FieldRow label="Description">
                  <Textarea value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} rows={2} placeholder="What this feature does..." className="text-sm resize-none" />
                </FieldRow>
              </div>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full gap-1.5 text-xs">
          <Plus className="size-3.5" /> Add Feature
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pricing editor
// ---------------------------------------------------------------------------

interface PricingPlanItem { id: string; name: string; description: string; price: number; isRecommended: boolean; icon?: string; features: string[] }

function PricingEditor({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const plans: PricingPlanItem[] = data.plans || []
  const [expanded, setExpanded] = useState<number | null>(null)
  const set = (key: string, val: any) => onChange({ ...data, [key]: val })

  const addPlan = () => {
    const newPlan: PricingPlanItem = {
      id: `plan-${Date.now()}`, name: '', description: '', price: 0, isRecommended: false, icon: 'Zap', features: []
    }
    set('plans', [...plans, newPlan])
    setExpanded(plans.length)
  }

  const updatePlan = (i: number, field: keyof PricingPlanItem, val: any) => {
    set('plans', plans.map((p, idx) => idx === i ? { ...p, [field]: val } : p))
  }

  const removePlan = (i: number) => {
    set('plans', plans.filter((_, idx) => idx !== i))
    setExpanded(null)
  }

  const addFeature = (planIdx: number) => {
    const plan = plans[planIdx]
    updatePlan(planIdx, 'features', [...(plan.features || []), ''])
  }

  const updateFeature = (planIdx: number, featIdx: number, val: string) => {
    const plan = plans[planIdx]
    const updated = (plan.features || []).map((f, i) => i === featIdx ? val : f)
    updatePlan(planIdx, 'features', updated)
  }

  const removeFeature = (planIdx: number, featIdx: number) => {
    const plan = plans[planIdx]
    updatePlan(planIdx, 'features', (plan.features || []).filter((_, i) => i !== featIdx))
  }

  return (
    <div className="space-y-4">
      <SectionDivider label="Section Header" />
      <FieldRow label="Section Label">
        <Input value={data.sectionLabel || ''} onChange={e => set('sectionLabel', e.target.value)} placeholder="Pricing" className="text-sm" />
      </FieldRow>
      <FieldRow label="Title">
        <Input value={data.title || ''} onChange={e => set('title', e.target.value)} placeholder="Simple, transparent pricing" className="text-sm" />
      </FieldRow>
      <FieldRow label="Subtitle">
        <Textarea value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} rows={2} className="text-sm resize-none" />
      </FieldRow>

      <SectionDivider label="Pricing Plans" />
      <div className="space-y-2">
        {plans.map((plan, i) => (
          <div key={plan.id} className="rounded-xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="flex w-full items-center justify-between gap-2 p-3 text-left hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground line-clamp-1">
                  {plan.name || <span className="text-muted-foreground italic">Untitled plan {i + 1}</span>}
                </span>
                {plan.isRecommended && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono text-primary">Popular</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button type="button" onClick={e => { e.stopPropagation(); removePlan(i) }} className="rounded p-1 text-destructive hover:bg-destructive/10">
                  <Trash2 className="size-3.5" />
                </button>
                {expanded === i ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
              </div>
            </button>
            {expanded === i && (
              <div className="border-t border-border p-3 space-y-3 bg-muted/10">
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="Plan Name">
                    <Input value={plan.name} onChange={e => updatePlan(i, 'name', e.target.value)} placeholder="Pro" className="text-sm" />
                  </FieldRow>
                  <FieldRow label="Icon" hint="Lucide icon name">
                    <Input value={plan.icon || ''} onChange={e => updatePlan(i, 'icon', e.target.value)} placeholder="Zap" className="text-sm font-mono" />
                  </FieldRow>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="Price ($/mo)">
                    <Input type="number" value={plan.price} onChange={e => updatePlan(i, 'price', Number(e.target.value))} placeholder="49" className="text-sm font-mono" />
                  </FieldRow>
                  <FieldRow label="Mark as Recommended">
                    <div className="flex h-9 items-center">
                      <input
                        type="checkbox"
                        id={`recommended-${i}`}
                        checked={!!plan.isRecommended}
                        onChange={e => updatePlan(i, 'isRecommended', e.target.checked)}
                        className="size-4 rounded border-border accent-primary"
                      />
                      <label htmlFor={`recommended-${i}`} className="ml-2 text-xs text-muted-foreground">Most Popular badge</label>
                    </div>
                  </FieldRow>
                </div>
                <FieldRow label="Description">
                  <Textarea value={plan.description} onChange={e => updatePlan(i, 'description', e.target.value)} rows={2} placeholder="Best for teams..." className="text-sm resize-none" />
                </FieldRow>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Features / Bullet Points</Label>
                  {(plan.features || []).map((feat, fi) => (
                    <div key={fi} className="flex items-center gap-2">
                      <Input value={feat} onChange={e => updateFeature(i, fi, e.target.value)} placeholder="Feature description" className="text-sm" />
                      <Button type="button" variant="ghost" size="icon" className="size-7 text-destructive shrink-0" onClick={() => removeFeature(i, fi)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addFeature(i)} className="w-full gap-1 text-xs mt-1">
                    <Plus className="size-3" /> Add Feature
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addPlan} className="w-full gap-1.5 text-xs">
          <Plus className="size-3.5" /> Add Pricing Plan
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stats editor
// ---------------------------------------------------------------------------

interface StatItem { id: string; value: string; label: string; description: string }

function StatsEditor({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const items: StatItem[] = data.items || []
  const set = (key: string, val: any) => onChange({ ...data, [key]: val })

  const addItem = () => {
    set('items', [...items, { id: `stat-${Date.now()}`, value: '', label: '', description: '' }])
  }

  const updateItem = (i: number, field: keyof StatItem, val: string) => {
    set('items', items.map((item, idx) => idx === i ? { ...item, [field]: val } : item))
  }

  const removeItem = (i: number) => set('items', items.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-4">
      <SectionDivider label="Section Header" />
      <FieldRow label="Section Label">
        <Input value={data.sectionLabel || ''} onChange={e => set('sectionLabel', e.target.value)} placeholder="By the numbers" className="text-sm" />
      </FieldRow>
      <FieldRow label="Title">
        <Input value={data.title || ''} onChange={e => set('title', e.target.value)} placeholder="Results that speak" className="text-sm" />
      </FieldRow>
      <FieldRow label="Subtitle">
        <Input value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} placeholder="Real impact, real numbers" className="text-sm" />
      </FieldRow>

      <SectionDivider label="Stat Items" />
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={item.id} className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-primary">Stat {i + 1}</span>
              <Button type="button" variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => removeItem(i)}>
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldRow label="Value" hint="e.g. 50+">
                <Input value={item.value} onChange={e => updateItem(i, 'value', e.target.value)} placeholder="50+" className="text-sm font-mono" />
              </FieldRow>
              <FieldRow label="Label">
                <Input value={item.label} onChange={e => updateItem(i, 'label', e.target.value)} placeholder="Projects completed" className="text-sm" />
              </FieldRow>
            </div>
            <FieldRow label="Description">
              <Input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Short supporting detail" className="text-sm" />
            </FieldRow>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full gap-1.5 text-xs">
          <Plus className="size-3.5" /> Add Stat
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Code Block editor
// ---------------------------------------------------------------------------

interface CodeFile { id: string; filename: string; language: string; code: string }

function CodeBlockEditor({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const files: CodeFile[] = data.files || []
  const [expanded, setExpanded] = useState<number | null>(null)
  const set = (key: string, val: any) => onChange({ ...data, [key]: val })

  const addFile = () => {
    const newFile: CodeFile = { id: `file-${Date.now()}`, filename: 'index.tsx', language: 'tsx', code: '' }
    set('files', [...files, newFile])
    setExpanded(files.length)
  }

  const updateFile = (i: number, field: keyof CodeFile, val: string) => {
    set('files', files.map((f, idx) => idx === i ? { ...f, [field]: val } : f))
  }

  const removeFile = (i: number) => {
    set('files', files.filter((_, idx) => idx !== i))
    setExpanded(null)
  }

  return (
    <div className="space-y-4">
      <SectionDivider label="Code Files" />
      <p className="text-xs text-muted-foreground">Add one or more files. Each becomes a tab in the code viewer.</p>
      <div className="space-y-2">
        {files.map((file, i) => (
          <div key={file.id} className="rounded-xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="flex w-full items-center justify-between gap-2 p-3 text-left hover:bg-muted/40 transition-colors"
            >
              <span className="text-sm font-mono text-foreground line-clamp-1">
                {file.filename || <span className="text-muted-foreground italic">Untitled file {i + 1}</span>}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{file.language || 'tsx'}</span>
                <button type="button" onClick={e => { e.stopPropagation(); removeFile(i) }} className="rounded p-1 text-destructive hover:bg-destructive/10">
                  <Trash2 className="size-3.5" />
                </button>
                {expanded === i ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
              </div>
            </button>
            {expanded === i && (
              <div className="border-t border-border p-3 space-y-2 bg-muted/10">
                <div className="grid grid-cols-2 gap-2">
                  <FieldRow label="Filename">
                    <Input value={file.filename} onChange={e => updateFile(i, 'filename', e.target.value)} placeholder="index.tsx" className="text-sm font-mono" />
                  </FieldRow>
                  <FieldRow label="Language" hint="shiki lang">
                    <Input value={file.language} onChange={e => updateFile(i, 'language', e.target.value)} placeholder="tsx" className="text-sm font-mono" />
                  </FieldRow>
                </div>
                <FieldRow label="Code">
                  <Textarea
                    value={file.code}
                    onChange={e => updateFile(i, 'code', e.target.value)}
                    rows={10}
                    placeholder="// Paste your code here"
                    className="text-xs font-mono resize-y leading-relaxed"
                  />
                </FieldRow>
              </div>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addFile} className="w-full gap-1.5 text-xs">
          <Plus className="size-3.5" /> Add Code File
        </Button>
      </div>
    </div>
  )
}

function GalleryEditor({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (key: string, val: any) => onChange({ ...data, [key]: val })
  const images: any[] = data.images || []

  return (
    <div className="space-y-4">
      <SectionDivider label="Gallery Header" />
      <FieldRow label="Section Label" hint="e.g. 'Photo Showcase'">
        <Input value={data.sectionLabel || ''} onChange={e => set('sectionLabel', e.target.value)} placeholder="Photo Showcase" className="text-sm" />
      </FieldRow>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Title Main">
          <Input value={data.title || ''} onChange={e => set('title', e.target.value)} placeholder="Network & Field Operations" className="text-sm" />
        </FieldRow>
        <FieldRow label="Title Highlight">
          <Input value={data.titleHighlight || ''} onChange={e => set('titleHighlight', e.target.value)} placeholder="Gallery" className="text-sm" />
        </FieldRow>
      </div>
      <FieldRow label="Subtitle">
        <Textarea value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)} rows={2} placeholder="Description of the gallery section..." className="text-sm resize-none" />
      </FieldRow>

      <SectionDivider label="Gallery Images" />
      <div className="space-y-3">
        {images.map((img: any, i: number) => {
          const imgSrc = typeof img === 'string' ? img : (img?.src || img?.url || '')
          const imgTitle = typeof img === 'string' ? '' : (img?.title || '')
          const imgCategory = typeof img === 'string' ? '' : (img?.category || '')
          const imgAlt = typeof img === 'string' ? '' : (img?.alt || '')
          const imgDesc = typeof img === 'string' ? '' : (img?.description || '')

          const updateImg = (field: string, val: string) => {
            const updated = [...images]
            const currObj = typeof updated[i] === 'string' ? { src: updated[i] } : { ...updated[i] }
            currObj[field] = val
            updated[i] = currObj
            set('images', updated)
          }

          return (
            <div key={i} className="rounded-xl border border-border/70 bg-muted/10 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
                  Photo #{i + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    const updated = images.filter((_: any, idx: number) => idx !== i)
                    set('images', updated)
                  }}
                  title="Remove image"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              <ImageUploader
                value={imgSrc}
                onChange={(url) => updateImg('src', url)}
                placeholder={`Upload image for Photo #${i + 1}`}
                aspectRatio="video"
              />

              <div className="grid grid-cols-2 gap-2">
                <FieldRow label="Photo Title">
                  <Input value={imgTitle} onChange={e => updateImg('title', e.target.value)} placeholder="e.g. Fiber Cable Splicing" className="text-xs" />
                </FieldRow>
                <FieldRow label="Category Tag">
                  <Input value={imgCategory} onChange={e => updateImg('category', e.target.value)} placeholder="e.g. Fiber Optics, CCTV" className="text-xs" />
                </FieldRow>
              </div>

              <FieldRow label="Description">
                <Input value={imgDesc} onChange={e => updateImg('description', e.target.value)} placeholder="Short image caption..." className="text-xs" />
              </FieldRow>

              <FieldRow label="Alt Text">
                <Input value={imgAlt} onChange={e => updateImg('alt', e.target.value)} placeholder="Screen reader text..." className="text-xs" />
              </FieldRow>
            </div>
          )
        })}

        <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-primary">
            <Upload className="size-3" /> Add New Gallery Image
          </div>
          <ImageUploader
            onChange={(url) => {
              if (!url) return
              set('images', [...images, { src: url, title: 'New Showcase Photo', category: 'General', alt: 'Gallery Image' }])
            }}
            placeholder="Upload or drop image to add to gallery"
            aspectRatio="video"
          />
        </div>
      </div>
    </div>
  )
}

function FixedBlockNotice({ type }: { type: ComponentBlockType }) {
  const labels: Record<string, { icon: React.ReactNode; label: string; href: string }> = {
    projects: { icon: <Briefcase className="size-4" />, label: 'Projects Collection', href: '/admin/website-content/collections/projects' },
    services: { icon: <Layers className="size-4" />, label: 'Services Collection', href: '/admin/website-content/collections/services' },
    templates: { icon: <LayoutTemplate className="size-4" />, label: 'Templates Collection', href: '/admin/website-content/collections/templates' },
    blog: { icon: <FileText className="size-4" />, label: 'Blog Collection', href: '/admin/website-content/collections/blog' },
    logos: { icon: <Globe className="size-4" />, label: 'Logos Component', href: '/admin/website-content/components/logos' },
  }
  const info = labels[type] || { icon: <Info className="size-4" />, label: 'Collection', href: '/admin/website-content' }
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary">
        {info.icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">Content managed in {info.label}</p>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">
          This block type pulls data from a shared collection. Edit the items there and they'll update everywhere this block appears.
        </p>
      </div>
      <a
        href={info.href}
        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Go to {info.label} →
      </a>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Block type meta
// ---------------------------------------------------------------------------

const BLOCK_META: Record<ComponentBlockType, { label: string; icon: React.ReactNode; color: string }> = {
  hero:       { label: 'Hero Section',      icon: <Sparkles className="size-4" />,     color: 'text-primary bg-primary/10' },
  hero2:      { label: 'Compact Hero (Hero2)', icon: <Sparkles className="size-4" />,  color: 'text-primary bg-primary/10' },
  techStack:  { label: 'Tech Stack',        icon: <Wrench className="size-4" />,       color: 'text-cyan-500 bg-cyan-500/10' },
  logos:      { label: 'Logos',             icon: <Globe className="size-4" />,        color: 'text-purple-500 bg-purple-500/10' },
  projects:   { label: 'Projects',          icon: <Briefcase className="size-4" />,    color: 'text-amber-500 bg-amber-500/10' },
  process:    { label: 'Process Steps',     icon: <Compass className="size-4" />,      color: 'text-lime-500 bg-lime-500/10' },
  services:   { label: 'Services',          icon: <Layers className="size-4" />,       color: 'text-emerald-500 bg-emerald-500/10' },
  templates:  { label: 'Templates',         icon: <LayoutTemplate className="size-4" />, color: 'text-violet-500 bg-violet-500/10' },
  blog:       { label: 'Blog Posts',        icon: <FileText className="size-4" />,     color: 'text-rose-500 bg-rose-500/10' },
  contact:    { label: 'Contact Section',   icon: <Mail className="size-4" />,         color: 'text-sky-500 bg-sky-500/10' },
  faq:        { label: 'FAQ Accordion',     icon: <HelpCircle className="size-4" />,   color: 'text-orange-500 bg-orange-500/10' },
  ctaBanner:  { label: 'CTA Banner',        icon: <Megaphone className="size-4" />,    color: 'text-pink-500 bg-pink-500/10' },
  customHtml: { label: 'Custom HTML',       icon: <Code2 className="size-4" />,        color: 'text-slate-400 bg-slate-400/10' },
  features:   { label: 'Features',          icon: <Sparkles className="size-4" />,     color: 'text-indigo-500 bg-indigo-500/10' },
  pricing:    { label: 'Pricing',           icon: <Briefcase className="size-4" />,    color: 'text-yellow-500 bg-yellow-500/10' },
  stats:      { label: 'Stats',             icon: <Sparkles className="size-4" />,     color: 'text-teal-500 bg-teal-500/10' },
  codeBlock:  { label: 'Code Block',        icon: <Code2 className="size-4" />,        color: 'text-zinc-500 bg-zinc-500/10' },
  careers:    { label: 'Careers & Roles',   icon: <Briefcase className="size-4" />,    color: 'text-blue-500 bg-blue-500/10' },
  gallery:    { label: 'Gallery Showcase',  icon: <ImageIcon className="size-4" />,    color: 'text-indigo-500 bg-indigo-500/10' },
}

// ---------------------------------------------------------------------------
// Main BlockContentEditor
// ---------------------------------------------------------------------------

export function BlockContentEditor({ block, globalContent, onSave, onClose }: BlockContentEditorProps) {
  const meta = BLOCK_META[block.type] || BLOCK_META.customHtml
  const isFixed = FIXED_BLOCKS.has(block.type)

  // Resolve initial data: block.data merged over global section defaults
  const resolveInitialData = (): Record<string, any> => {
    if (isFixed) return {}
    const globalDefaults: Record<string, any> = {
      hero:       globalContent.hero       || {},
      hero2:      globalContent.hero       || {},
      techStack:  globalContent.techStack  || {},
      logos:      globalContent.logos      || {},
      process:    globalContent.process    || {},
      contact:    globalContent.contact    || {},
      faq:        globalContent.faq        || {},
      ctaBanner:  {},
      customHtml: {},
      features:   globalContent.features   || {},
      pricing:    globalContent.pricing    || {},
      stats:      globalContent.stats      || {},
      codeBlock:  globalContent.codeBlock  || {},
      gallery:    globalContent.gallery    || {},
    }
    const base = globalDefaults[block.type] || {}
    return { ...base, ...(block.data || {}) }
  }

  const [localData, setLocalData] = useState<Record<string, any>>(resolveInitialData)
  const [blockTitle, setBlockTitle] = useState(block.title)
  const [blockDesc, setBlockDesc] = useState(block.description || '')

  const hasCustomData = block.data && Object.keys(block.data).length > 0

  const handleReset = () => {
    const globalDefaults: Record<string, any> = {
      hero:       globalContent.hero       || {},
      techStack:  globalContent.techStack  || {},
      logos:      globalContent.logos      || {},
      process:    globalContent.process    || {},
      contact:    globalContent.contact    || {},
      faq:        globalContent.faq        || {},
      ctaBanner:  {},
      customHtml: {},
      features:   globalContent.features   || {},
      pricing:    globalContent.pricing    || {},
      stats:      globalContent.stats      || {},
      codeBlock:  globalContent.codeBlock  || {},
      gallery:    globalContent.gallery    || {},
    }
    setLocalData(globalDefaults[block.type] || {})
  }

  const handleSave = () => {
    onSave({
      ...block,
      title: blockTitle,
      description: blockDesc || undefined,
      data: isFixed ? (block.data || {}) : localData,
    })
  }

  const renderEditor = () => {
    if (isFixed) return <FixedBlockNotice type={block.type} />
    switch (block.type) {
      case 'hero':       return <HeroEditor data={localData} onChange={setLocalData} />
      case 'hero2':      return <HeroEditor data={localData} onChange={setLocalData} />
      case 'techStack':  return <TechStackEditor data={localData} onChange={setLocalData} />
      case 'logos':      return <LogosEditor data={localData} onChange={setLocalData} />
      case 'process':    return <ProcessEditor data={localData} onChange={setLocalData} />
      case 'contact':    return <ContactEditor data={localData} onChange={setLocalData} />
      case 'faq':        return <FaqEditor data={localData} onChange={setLocalData} />
      case 'ctaBanner':  return <CtaBannerEditor data={localData} onChange={setLocalData} />
      case 'customHtml': return <CustomHtmlEditor data={localData} onChange={setLocalData} />
      case 'features':   return <FeaturesEditor data={localData} onChange={setLocalData} />
      case 'pricing':    return <PricingEditor data={localData} onChange={setLocalData} />
      case 'stats':      return <StatsEditor data={localData} onChange={setLocalData} />
      case 'codeBlock':  return <CodeBlockEditor data={localData} onChange={setLocalData} />
      case 'gallery':    return <GalleryEditor data={localData} onChange={setLocalData} />
      default: return (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No editable fields for this block type.
        </div>
      )
    }
  }

  return (
    // Slide-over overlay
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative flex h-full w-full max-w-xl flex-col border-l border-border bg-background shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div className="flex items-start gap-3">
            <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${meta.color}`}>
              {meta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">Edit Block Content</h2>
                {hasCustomData && !isFixed && (
                  <Badge variant="outline" className="text-[9px] font-mono border-primary/40 text-primary bg-primary/5">
                    Customized
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {meta.label} · {block.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Block label (meta fields) */}
        {!isFixed && (
          <div className="border-b border-border/60 bg-muted/20 px-5 py-3 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Block Label">
                <Input
                  value={blockTitle}
                  onChange={e => setBlockTitle(e.target.value)}
                  placeholder="Block name for admin reference"
                  className="text-xs h-8"
                />
              </FieldRow>
              <FieldRow label="Admin Note (optional)">
                <Input
                  value={blockDesc}
                  onChange={e => setBlockDesc(e.target.value)}
                  placeholder="Internal note..."
                  className="text-xs h-8"
                />
              </FieldRow>
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {!isFixed && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <Info className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                These fields <strong className="text-foreground">override</strong> the global component defaults for this block only.
                Leave a field blank to inherit the global value.
              </p>
            </div>
          )}
          {renderEditor()}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          {!isFixed && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              Reset to Global Default
            </Button>
          )}
          {isFixed && <div />}
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            {!isFixed && (
              <Button type="button" size="sm" onClick={handleSave} className="text-xs gap-1.5">
                Save Block Content
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
