'use client'

import { useState } from 'react'
import {
  Plus,
  Trash2,
  Pencil,
  DollarSign,
  Check,
  Copy,
  ArrowUp,
  ArrowDown,
  X,
  Sparkles,
  RotateCcw,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ContentHeader } from '@/components/admin/ContentHeader'
import { PricingPlan } from '@/lib/types/content'
import { defaultContent } from '@/lib/default-content'

const ICON_OPTIONS = [
  'Zap', 'Wifi', 'Star', 'Sparkles', 'Rocket', 'Shield', 'Crown', 'Diamond',
  'Flame', 'Globe', 'Layers', 'Package', 'Boxes', 'Gift',
  'BadgeDollarSign', 'BarChart3', 'TrendingUp', 'Building2', 'GraduationCap'
]

function newPlan(): PricingPlan {
  return {
    id: `plan-${Date.now().toString(36)}`,
    name: '',
    description: '',
    price: 0,
    isRecommended: false,
    icon: 'Wifi',
    features: [],
  }
}

export default function PricingCollectionPage() {
  const { content, saving, lastSaved, updateSection } = useWebsiteContent()
  const { toast } = useToast()

  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newFeatureInput, setNewFeatureInput] = useState('')
  const [editingFeatureIdx, setEditingFeatureIdx] = useState<number | null>(null)
  const [editingFeatureText, setEditingFeatureText] = useState('')

  const pricingData = content?.pricing ?? defaultContent.pricing ?? {
    sectionLabel: 'Pricing',
    title: 'Simple, transparent pricing',
    subtitle: '',
    plans: [],
  }

  const plans: PricingPlan[] = pricingData.plans ?? []

  const handleOpenNew = () => {
    setEditingPlan(newPlan())
    setNewFeatureInput('')
    setEditingFeatureIdx(null)
    setEditingFeatureText('')
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (plan: PricingPlan) => {
    setEditingPlan({ ...plan, features: [...(plan.features ?? [])] })
    setNewFeatureInput('')
    setEditingFeatureIdx(null)
    setEditingFeatureText('')
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingPlan || !editingPlan.name.trim()) {
      toast({ title: 'Name required', description: 'Please enter a plan name.', variant: 'destructive' })
      return
    }
    const updated = [...plans]
    const idx = updated.findIndex((p) => p.id === editingPlan.id)
    if (idx >= 0) {
      updated[idx] = editingPlan
    } else {
      updated.push(editingPlan)
    }

    const res = await updateSection('pricing', { ...pricingData, plans: updated })
    if (res.success) {
      toast({ title: 'Plan saved', description: `"${editingPlan.name}" has been saved.` })
      setIsDialogOpen(false)
      setEditingPlan(null)
    }
  }

  const handleDelete = async (id: string) => {
    const planToDelete = plans.find((p) => p.id === id)
    if (!confirm(`Are you sure you want to delete the plan "${planToDelete?.name || 'this plan'}"?`)) {
      return
    }
    const updated = plans.filter((p) => p.id !== id)
    const res = await updateSection('pricing', { ...pricingData, plans: updated })
    if (res.success) {
      toast({ title: 'Plan deleted', description: 'The pricing plan was removed.' })
    }
  }

  const handleDuplicate = async (plan: PricingPlan) => {
    const clone: PricingPlan = {
      ...plan,
      id: `plan-${Date.now().toString(36)}`,
      name: `${plan.name} (Copy)`,
      isRecommended: false,
      features: [...(plan.features ?? [])],
    }
    const updated = [...plans, clone]
    const res = await updateSection('pricing', { ...pricingData, plans: updated })
    if (res.success) {
      toast({ title: 'Plan duplicated', description: `Created copy of "${plan.name}".` })
    }
  }

  const handleMovePlan = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= plans.length) return
    const updated = [...plans]
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIndex, 0, moved)
    await updateSection('pricing', { ...pricingData, plans: updated })
  }

  // Feature operations within editingPlan modal
  const addFeature = () => {
    if (!editingPlan || !newFeatureInput.trim()) return
    setEditingPlan({
      ...editingPlan,
      features: [...(editingPlan.features ?? []), newFeatureInput.trim()],
    })
    setNewFeatureInput('')
  }

  const removeFeature = (idx: number) => {
    if (!editingPlan) return
    setEditingPlan({
      ...editingPlan,
      features: editingPlan.features.filter((_, i) => i !== idx),
    })
    if (editingFeatureIdx === idx) {
      setEditingFeatureIdx(null)
      setEditingFeatureText('')
    }
  }

  const startEditFeature = (idx: number, currentText: string) => {
    setEditingFeatureIdx(idx)
    setEditingFeatureText(currentText)
  }

  const saveEditFeature = (idx: number) => {
    if (!editingPlan || !editingFeatureText.trim()) return
    const updatedFeatures = [...(editingPlan.features ?? [])]
    updatedFeatures[idx] = editingFeatureText.trim()
    setEditingPlan({
      ...editingPlan,
      features: updatedFeatures,
    })
    setEditingFeatureIdx(null)
    setEditingFeatureText('')
  }

  const moveFeature = (idx: number, direction: 'up' | 'down') => {
    if (!editingPlan) return
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    const feats = [...(editingPlan.features ?? [])]
    if (targetIdx < 0 || targetIdx >= feats.length) return
    const [moved] = feats.splice(idx, 1)
    feats.splice(targetIdx, 0, moved)
    setEditingPlan({
      ...editingPlan,
      features: feats,
    })
  }

  const handleResetToDefaultPackages = async () => {
    if (
      !confirm(
        'Load the standard 6 Molo internet packages (6Mbps, 10Mbps, 20Mbps, 25Mbps, 30Mbps, 40Mbps in KES)? This will replace current packages with the default configuration.'
      )
    ) {
      return
    }
    const res = await updateSection('pricing', defaultContent.pricing)
    if (res.success) {
      toast({
        title: 'Standard packages loaded',
        description: 'Successfully updated to 6 official packages in KES.',
      })
    }
  }

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Pricing Plans"
        description="Add, edit, or delete pricing tiers and features in KES. Changes sync immediately to your live site."
        badge={`${plans.length} Plan${plans.length !== 1 ? 's' : ''}`}
        saving={saving}
        lastSaved={lastSaved}
        liveRoute="/"
      >
        <div className="flex items-center gap-2">
          <Button
            onClick={handleResetToDefaultPackages}
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            title="Restore standard 6 packages in KES"
          >
            <RotateCcw className="size-3.5" />
            Load Standard Packages
          </Button>
          <Button onClick={handleOpenNew} size="sm" className="gap-1.5 text-xs font-semibold shadow-sm">
            <Plus className="size-3.5" />
            Add Plan
          </Button>
        </div>
      </ContentHeader>

      {/* Section header settings */}
      <Card className="border-border/80 bg-card/60 shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Section Header Settings</CardTitle>
          <CardDescription className="text-xs">
            Labels and headlines displayed above the pricing cards on public pages.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-medium">Section Label</Label>
              <Input
                value={pricingData.sectionLabel ?? ''}
                onChange={(e) => updateSection('pricing', { ...pricingData, sectionLabel: e.target.value })}
                placeholder="e.g. Affordable Plans"
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Section Title</Label>
              <Input
                value={pricingData.title ?? ''}
                onChange={(e) => updateSection('pricing', { ...pricingData, title: e.target.value })}
                placeholder="e.g. Our Internet Packages"
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Subtitle</Label>
              <Input
                value={pricingData.subtitle ?? ''}
                onChange={(e) => updateSection('pricing', { ...pricingData, subtitle: e.target.value })}
                placeholder="Brief explanatory subtitle"
                className="mt-1 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans grid */}
      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/20 py-16 text-center">
          <div className="rounded-2xl bg-primary/10 p-4">
            <DollarSign className="size-8 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">No pricing plans yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add your first plan to display the pricing section on the site.
            </p>
          </div>
          <Button onClick={handleOpenNew} size="sm" variant="outline" className="gap-1.5">
            <Plus className="size-3.5" /> Add First Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan, index) => (
            <Card
              key={plan.id}
              className={`border-border/80 bg-card/60 flex flex-col relative hover:border-primary/40 transition-all ${
                plan.isRecommended ? 'ring-2 ring-primary/60 border-primary/50 shadow-md' : 'shadow-xs'
              }`}
            >
              {plan.isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="text-[10px] px-2.5 py-0.5 shadow-sm font-semibold bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="outline" className="font-mono text-[10px] bg-muted/30">
                      {plan.icon || 'Wifi'}
                    </Badge>
                    {plan.isRecommended && (
                      <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px]">
                        Recommended
                      </Badge>
                    )}
                  </div>

                  {/* Actions: Reorder, Duplicate, Edit, Delete */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      onClick={() => handleMovePlan(index, 'up')}
                      disabled={index === 0}
                      title="Move Up"
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      onClick={() => handleMovePlan(index, 'down')}
                      disabled={index === plans.length - 1}
                      title="Move Down"
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleDuplicate(plan)}
                      title="Duplicate Plan"
                    >
                      <Copy className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(plan)}
                      title="Edit Plan & Features"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(plan.id)}
                      title="Delete Plan"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                <CardTitle className="mt-2 text-base font-bold">
                  {plan.name || <span className="text-muted-foreground italic">Unnamed Plan</span>}
                </CardTitle>

                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-mono text-2xl font-bold text-primary">
                    KES {Number(plan.price).toLocaleString()}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">/mo</span>
                </div>

                {plan.description && (
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {plan.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="p-4 pt-1 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5 mt-2 border-t border-border/50 pt-2.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-1">
                    <span>Included Features ({(plan.features ?? []).length})</span>
                    <button
                      onClick={() => handleOpenEdit(plan)}
                      className="text-primary hover:underline flex items-center gap-1 text-[10px]"
                    >
                      <Pencil className="size-2.5" /> Manage
                    </button>
                  </div>

                  {(plan.features ?? []).slice(0, 6).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Check className="size-3 text-emerald-500 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}

                  {(plan.features ?? []).length > 6 && (
                    <p className="text-[10px] text-muted-foreground pt-0.5 pl-4 italic">
                      +{(plan.features ?? []).length - 6} more features…
                    </p>
                  )}

                  {(plan.features ?? []).length === 0 && (
                    <p className="text-[11px] text-muted-foreground italic py-1">
                      No features listed yet. Click edit to add features.
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-2 border-t border-border/40 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1.5 font-medium"
                    onClick={() => handleOpenEdit(plan)}
                  >
                    <Pencil className="size-3" /> Edit Plan & Features
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      {editingPlan && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent
            className="w-[92vw] max-w-2xl max-h-[90vh] overflow-y-auto"
            onClose={() => setIsDialogOpen(false)}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                {editingPlan.name ? `Edit "${editingPlan.name}"` : 'Add New Pricing Plan'}
              </DialogTitle>
              <DialogDescription>
                Customize plan name, monthly price, Lucide icon, badge status, and feature bullet list.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Name + Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Plan Name *</Label>
                  <Input
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    placeholder="e.g. BASE, STUDENT, DS-HOME BASIC"
                    className="mt-1 text-sm font-medium"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Monthly Price (KES) *</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                      KES
                    </span>
                    <Input
                      type="number"
                      min={0}
                      step={50}
                      value={editingPlan.price}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="1500"
                      className="pl-12 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Icon selector */}
              <div>
                <Label className="text-xs font-semibold">Plan Icon</Label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setEditingPlan({ ...editingPlan, icon })}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-mono transition-colors ${
                        editingPlan.icon === icon
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                          : 'border-border bg-muted/20 text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <Input
                  value={editingPlan.icon ?? ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, icon: e.target.value })}
                  placeholder="Or enter any valid Lucide icon name (e.g. Wifi, Zap, Rocket)"
                  className="mt-2 text-xs font-mono"
                />
              </div>

              {/* Description */}
              <div>
                <Label className="text-xs font-semibold">Short Description</Label>
                <Textarea
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  placeholder="Describe who this plan is suitable for (devices, household size, activities)…"
                  className="mt-1 text-xs"
                  rows={2}
                />
              </div>

              {/* Recommended switch */}
              <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                <Switch
                  id="recommended-switch"
                  checked={editingPlan.isRecommended}
                  onCheckedChange={(checked) =>
                    setEditingPlan({ ...editingPlan, isRecommended: checked })
                  }
                />
                <div>
                  <Label htmlFor="recommended-switch" className="text-xs font-semibold cursor-pointer block">
                    Highlight as Most Popular / Recommended
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Displays a prominent badge and accent border on the pricing card.
                  </p>
                </div>
              </div>

              {/* Features List Section */}
              <div className="border-t border-border/60 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <Label className="text-xs font-bold">Plan Features & Deliverables</Label>
                    <p className="text-[11px] text-muted-foreground">
                      Add, edit, reorder, or delete features displayed on this package.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {(editingPlan.features ?? []).length} Features
                  </Badge>
                </div>

                {/* Existing features list with Edit, Reorder, Delete */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {(editingPlan.features ?? []).length === 0 ? (
                    <div className="text-center py-4 text-xs text-muted-foreground border border-dashed rounded-lg">
                      No features added yet. Type below to add the first feature.
                    </div>
                  ) : (
                    (editingPlan.features ?? []).map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-background/80 px-2.5 py-1.5 text-xs shadow-2xs"
                      >
                        {editingFeatureIdx === idx ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <Input
                              value={editingFeatureText}
                              onChange={(e) => setEditingFeatureText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  saveEditFeature(idx)
                                } else if (e.key === 'Escape') {
                                  setEditingFeatureIdx(null)
                                }
                              }}
                              className="text-xs h-7 flex-1"
                              autoFocus
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="size-7 text-emerald-500 hover:bg-emerald-500/10"
                              onClick={() => saveEditFeature(idx)}
                              title="Save feature"
                            >
                              <Check className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="size-7 text-muted-foreground"
                              onClick={() => setEditingFeatureIdx(null)}
                              title="Cancel"
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <Check className="size-3.5 text-emerald-500 shrink-0" />
                              <span className="truncate text-foreground font-medium">{feat}</span>
                            </div>

                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => moveFeature(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                                title="Move up"
                              >
                                <ArrowUp className="size-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveFeature(idx, 'down')}
                                disabled={idx === (editingPlan.features?.length ?? 0) - 1}
                                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                                title="Move down"
                              >
                                <ArrowDown className="size-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => startEditFeature(idx, feat)}
                                className="p-1 text-muted-foreground hover:text-primary transition-colors"
                                title="Edit feature"
                              >
                                <Pencil className="size-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeFeature(idx)}
                                className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                title="Delete feature"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Add feature input */}
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="e.g. 10 Mbps High-Speed Internet, 24/7 Support…"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addFeature()
                      }
                    }}
                    className="text-xs h-9"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 text-xs shrink-0 gap-1"
                    onClick={addFeature}
                  >
                    <Plus className="size-3.5" /> Add Feature
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Type a feature and press <kbd className="rounded border border-border px-1 font-mono text-[9px]">Enter</kbd> or click &quot;Add Feature&quot;.
                </p>
              </div>
            </div>

            <DialogFooter className="border-t border-border/50 pt-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-1.5">
                <Check className="size-3.5" />
                {saving ? 'Saving…' : 'Save Plan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
