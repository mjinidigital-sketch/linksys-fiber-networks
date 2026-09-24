'use client'

import { useState } from 'react'
import {
  Plus,
  Trash2,
  Pencil,
  Layers,
  Sparkles,
  Check,
  Star,
  ExternalLink
} from 'lucide-react'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ContentHeader } from '@/components/admin/ContentHeader'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { CollectionSeoSection } from '@/components/admin/CollectionSeoSection'
import { ServiceItem } from '@/lib/types/content'

export default function ServicesCollectionPage() {
  const { content, saving, lastSaved, updateSection } = useWebsiteContent()
  const { toast } = useToast()

  const [editingService, setEditingService] = useState<ServiceItem | null>(null)
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false)
  const [newFeatureInput, setNewFeatureInput] = useState('')

  const servicesData = content?.services || {
    sectionLabel: 'Services',
    title: 'What I Deliver',
    subtitle: 'High impact engineering and full-stack architecture solutions.',
    items: []
  }

  const handleOpenNewService = () => {
    setEditingService({
      id: `service-${Date.now().toString(36)}`,
      title: '',
      description: '',
      summary: '',
      content: '',
      icon: 'Code2',
      price: '$3,000+',
      popular: false,
      features: ['Full Stack Architecture', 'Responsive UI/UX', 'Performance Optimization']
    })
    setIsServiceDialogOpen(true)
  }

  const handleSaveServiceItem = async () => {
    if (!editingService || !editingService.title.trim()) {
      toast({ title: 'Title required', description: 'Please provide a service title.', variant: 'destructive' })
      return
    }

    const items = [...(servicesData.items || [])]
    const index = items.findIndex((s) => s.id === editingService.id)
    if (index >= 0) {
      items[index] = editingService
    } else {
      items.push(editingService)
    }

    const updated = { ...servicesData, items }
    const res = await updateSection('services', updated)
    if (res.success) {
      toast({ title: 'Service saved', description: `${editingService.title} has been updated.` })
      setIsServiceDialogOpen(false)
      setEditingService(null)
    }
  }

  const handleDeleteService = async (id: string) => {
    const items = (servicesData.items || []).filter((s) => s.id !== id)
    const updated = { ...servicesData, items }
    const res = await updateSection('services', updated)
    if (res.success) {
      toast({ title: 'Service removed' })
    }
  }

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Services Collection"
        description="Manage service offerings, pricing tiers, bullet features, and detailed descriptions."
        badge={`${servicesData.items?.length || 0} Services`}
        saving={saving}
        lastSaved={lastSaved}
        liveRoute="/services"
      >
        <Button onClick={handleOpenNewService} size="sm" className="gap-1.5 text-xs font-semibold">
          <Plus className="size-3.5" />
          <span>Add Service</span>
        </Button>
      </ContentHeader>

      {/* Section Meta Settings */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Section Header Settings</CardTitle>
          <CardDescription className="text-xs">Labels displayed above the services section on pages.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Section Label</Label>
              <Input
                value={servicesData.sectionLabel}
                onChange={(e) => updateSection('services', { ...servicesData, sectionLabel: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Section Title</Label>
              <Input
                value={servicesData.title}
                onChange={(e) => updateSection('services', { ...servicesData, title: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Subtitle</Label>
              <Input
                value={servicesData.subtitle}
                onChange={(e) => updateSection('services', { ...servicesData, subtitle: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicesData.items?.map((service) => (
          <Card key={service.id} className="border-border/80 bg-card/60 flex flex-col justify-between hover:border-primary/40 transition-colors">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {service.icon || 'Service'}
                  </Badge>
                  {service.popular && (
                    <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px]">
                      Popular
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setEditingService({ ...service })
                      setIsServiceDialogOpen(true)
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              <CardTitle className="mt-2 text-base font-bold text-foreground">{service.title}</CardTitle>
              {service.price && (
                <p className="font-mono text-xs font-semibold text-primary mt-0.5">{service.price}</p>
              )}
              <CardDescription className="text-xs line-clamp-2 mt-1">{service.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="space-y-1 mt-2 border-t border-border/50 pt-2">
                {service.features?.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="size-3 text-emerald-500 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add / Edit Service Dialog */}
      {editingService && (
        <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
          <DialogContent
            className="w-[75vw] max-w-6xl max-h-[90vh] overflow-y-auto"
            onClose={() => setIsServiceDialogOpen(false)}
          >
            <DialogHeader>
              <DialogTitle>{editingService.title ? `Edit ${editingService.title}` : 'Add Service Offering'}</DialogTitle>
              <DialogDescription>Define service details, pricing, bullet features, and scope.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Service Title *</Label>
                  <Input
                    value={editingService.title}
                    onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                    placeholder="e.g. Full-Stack Web Development"
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Starting Price / Rate</Label>
                  <Input
                    value={editingService.price || ''}
                    onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                    placeholder="e.g. $4,000 / project"
                    className="mt-1 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Short Description</Label>
                <Textarea
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  placeholder="Summary displayed on services cards..."
                  className="mt-1 text-sm"
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="popular-switch"
                  checked={editingService.popular || false}
                  onCheckedChange={(checked) => setEditingService({ ...editingService, popular: checked })}
                />
                <Label htmlFor="popular-switch" className="text-xs cursor-pointer">
                  Mark as Most Popular / Featured Offering
                </Label>
              </div>

              {/* Features List */}
              <div>
                <Label className="text-xs">Service Deliverables / Features</Label>
                <div className="mt-1.5 space-y-1.5">
                  {editingService.features?.map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-1.5 text-xs">
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingService({
                            ...editingService,
                            features: editingService.features.filter((_, i) => i !== idx)
                          })
                        }
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="Add feature item (e.g. Real-time Convex database, Custom CMS)..."
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newFeatureInput.trim()) {
                        e.preventDefault()
                        setEditingService({
                          ...editingService,
                          features: [...(editingService.features || []), newFeatureInput.trim()]
                        })
                        setNewFeatureInput('')
                      }
                    }}
                    className="text-xs h-8"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => {
                      if (newFeatureInput.trim()) {
                        setEditingService({
                          ...editingService,
                          features: [...(editingService.features || []), newFeatureInput.trim()]
                        })
                        setNewFeatureInput('')
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Rich Text Detailed Content */}
              <div>
                <Label className="text-xs mb-1 block">Full Service Details / Methodology</Label>
                <RichTextEditor
                  value={editingService.content || ''}
                  onChange={(val) => setEditingService({ ...editingService, content: val })}
                  placeholder="Describe your tech stack, deliverables, timelines, and milestones..."
                />
              </div>

              {/* Dedicated SEO & Social Sharing Section */}
              <CollectionSeoSection
                seo={editingService.seo}
                onChange={(seo) => setEditingService({ ...editingService, seo })}
                defaultTitle={editingService.title}
                defaultDescription={editingService.summary || editingService.description || editingService.content}
                defaultKeywords={editingService.features?.length ? editingService.features.join(', ') : 'Web Development Service, Software Consulting'}
                itemPath={`/services/${editingService.id}`}
                itemType="service"
                siteName="Victor Maina"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveServiceItem}>Save Service</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
