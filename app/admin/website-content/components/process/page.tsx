'use client'

import { useState } from 'react'
import { Compass, Plus, Trash2, Pencil, ArrowUp, ArrowDown } from 'lucide-react'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ContentHeader } from '@/components/admin/ContentHeader'
import { ProcessStep } from '@/lib/types/content'

export default function ProcessComponentPage() {
  const { content, saving, lastSaved, updateSection } = useWebsiteContent()
  const { toast } = useToast()

  const processData = content?.process || {
    sectionLabel: 'Workflow & Delivery',
    title: 'How I Work',
    steps: []
  }

  const [editingStep, setEditingStep] = useState<ProcessStep | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleOpenNewStep = () => {
    const nextNum = (processData.steps?.length || 0) + 1
    setEditingStep({
      id: `step-${Date.now().toString(36)}`,
      stepNumber: `0${nextNum}`,
      title: '',
      description: ''
    })
    setIsDialogOpen(true)
  }

  const handleSaveStep = async () => {
    if (!editingStep || !editingStep.title.trim()) {
      toast({ title: 'Title required', description: 'Please enter a step title.', variant: 'destructive' })
      return
    }

    const steps = [...(processData.steps || [])]
    const index = steps.findIndex((s) => s.id === editingStep.id)
    if (index >= 0) {
      steps[index] = editingStep
    } else {
      steps.push(editingStep)
    }

    const updated = { ...processData, steps }
    const res = await updateSection('process', updated)
    if (res.success) {
      toast({ title: 'Step saved', description: `${editingStep.title} has been updated.` })
      setIsDialogOpen(false)
      setEditingStep(null)
    }
  }

  const handleDeleteStep = async (id: string) => {
    const steps = (processData.steps || []).filter((s) => s.id !== id)
    const updated = { ...processData, steps }
    const res = await updateSection('process', updated)
    if (res.success) {
      toast({ title: 'Step removed' })
    }
  }

  const handleMoveStep = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= (processData.steps?.length || 0)) return

    const steps = [...(processData.steps || [])]
    const temp = steps[index]
    steps[index] = steps[targetIndex]
    steps[targetIndex] = temp

    const updated = { ...processData, steps }
    const res = await updateSection('process', updated)
    if (res.success) {
      toast({ title: 'Steps reordered' })
    }
  }

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Process Steps Component"
        description="Configure your engineering roadmap, delivery methodology, timeline stages, and process steps."
        badge={`${processData.steps?.length || 0} Steps`}
        saving={saving}
        lastSaved={lastSaved}
        liveRoute="/"
      >
        <Button onClick={handleOpenNewStep} size="sm" className="gap-1.5 text-xs font-semibold">
          <Plus className="size-3.5" />
          <span>Add Step</span>
        </Button>
      </ContentHeader>

      {/* Section Meta Settings */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Section Header Settings</CardTitle>
          <CardDescription className="text-xs">Labels displayed above the process timeline.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Section Label</Label>
              <Input
                value={processData.sectionLabel}
                onChange={(e) => updateSection('process', { ...processData, sectionLabel: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Section Title</Label>
              <Input
                value={processData.title}
                onChange={(e) => updateSection('process', { ...processData, title: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps List */}
      <div className="space-y-3">
        {processData.steps?.map((step, index) => (
          <Card key={step.id} className="border-border/80 bg-card/60 hover:border-primary/40 transition-colors">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 font-mono text-xs font-bold text-primary">
                  {step.stepNumber}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">{step.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  disabled={index === 0}
                  onClick={() => handleMoveStep(index, 'up')}
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  disabled={index === (processData.steps?.length || 0) - 1}
                  onClick={() => handleMoveStep(index, 'down')}
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setEditingStep({ ...step })
                    setIsDialogOpen(true)
                  }}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteStep(step.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add / Edit Step Dialog */}
      {editingStep && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingStep.title ? `Edit Step ${editingStep.stepNumber}` : 'Add Process Step'}</DialogTitle>
              <DialogDescription>Define the step number, title, and descriptive summary.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Step #</Label>
                  <Input
                    value={editingStep.stepNumber}
                    onChange={(e) => setEditingStep({ ...editingStep, stepNumber: e.target.value })}
                    placeholder="01"
                    className="mt-1 text-sm font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Step Title *</Label>
                  <Input
                    value={editingStep.title}
                    onChange={(e) => setEditingStep({ ...editingStep, title: e.target.value })}
                    placeholder="e.g. Discovery & System Design"
                    className="mt-1 text-sm"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={editingStep.description}
                  onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
                  placeholder="Explain what happens in this stage..."
                  className="mt-1 text-sm"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveStep}>Save Step</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
