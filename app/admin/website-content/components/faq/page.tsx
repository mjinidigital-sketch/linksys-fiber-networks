'use client'

import { useState } from 'react'
import { HelpCircle, Plus, Trash2, Pencil, ArrowUp, ArrowDown } from 'lucide-react'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ContentHeader } from '@/components/admin/ContentHeader'
import { FaqItem } from '@/lib/types/content'

export default function FaqComponentPage() {
  const { content, saving, lastSaved, updateSection } = useWebsiteContent()
  const { toast } = useToast()

  const faqData = content?.faq || {
    sectionLabel: 'FAQ',
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about working together and my delivery process.',
    items: []
  }

  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleOpenNewFaq = () => {
    const nextOrder = (faqData.items?.length || 0) + 1
    setEditingFaq({
      id: `faq-${Date.now().toString(36)}`,
      question: '',
      answer: '',
      order: nextOrder
    })
    setIsDialogOpen(true)
  }

  const handleSaveFaq = async () => {
    if (!editingFaq || !editingFaq.question.trim()) {
      toast({ title: 'Question required', description: 'Please enter a question.', variant: 'destructive' })
      return
    }

    const items = [...(faqData.items || [])]
    const index = items.findIndex((f) => f.id === editingFaq.id)
    if (index >= 0) {
      items[index] = editingFaq
    } else {
      items.push(editingFaq)
    }

    const updated = { ...faqData, items }
    const res = await updateSection('faq', updated)
    if (res.success) {
      toast({ title: 'FAQ saved', description: 'FAQ item updated successfully.' })
      setIsDialogOpen(false)
      setEditingFaq(null)
    }
  }

  const handleDeleteFaq = async (id: string) => {
    const items = (faqData.items || []).filter((f) => f.id !== id)
    const updated = { ...faqData, items }
    const res = await updateSection('faq', updated)
    if (res.success) {
      toast({ title: 'FAQ removed' })
    }
  }

  const handleMoveFaq = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= (faqData.items?.length || 0)) return

    const items = [...(faqData.items || [])]
    const temp = items[index]
    items[index] = items[targetIndex]
    items[targetIndex] = temp

    const updated = { ...faqData, items }
    const res = await updateSection('faq', updated)
    if (res.success) {
      toast({ title: 'FAQs reordered' })
    }
  }

  return (
    <div className="space-y-6">
      <ContentHeader
        title="FAQ Component"
        description="Manage frequently asked questions, answers, and accordion ordering across pages."
        badge={`${faqData.items?.length || 0} Questions`}
        saving={saving}
        lastSaved={lastSaved}
        liveRoute="/"
      >
        <Button onClick={handleOpenNewFaq} size="sm" className="gap-1.5 text-xs font-semibold">
          <Plus className="size-3.5" />
          <span>Add Question</span>
        </Button>
      </ContentHeader>

      {/* Section Meta Settings */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Section Header Settings</CardTitle>
          <CardDescription className="text-xs">Labels displayed above the FAQ accordion.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Section Label</Label>
              <Input
                value={faqData.sectionLabel}
                onChange={(e) => updateSection('faq', { ...faqData, sectionLabel: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Section Title</Label>
              <Input
                value={faqData.title}
                onChange={(e) => updateSection('faq', { ...faqData, title: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Subtitle</Label>
              <Input
                value={faqData.subtitle}
                onChange={(e) => updateSection('faq', { ...faqData, subtitle: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Items List */}
      <div className="space-y-3">
        {faqData.items?.map((faq, index) => (
          <Card key={faq.id} className="border-border/80 bg-card/60 hover:border-primary/40 transition-colors">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 font-mono text-xs font-bold text-primary mt-0.5">
                  Q{index + 1}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">{faq.question}</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  disabled={index === 0}
                  onClick={() => handleMoveFaq(index, 'up')}
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  disabled={index === (faqData.items?.length || 0) - 1}
                  onClick={() => handleMoveFaq(index, 'down')}
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setEditingFaq({ ...faq })
                    setIsDialogOpen(true)
                  }}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteFaq(faq.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add / Edit FAQ Dialog */}
      {editingFaq && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingFaq.question ? 'Edit Question' : 'Add FAQ Item'}</DialogTitle>
              <DialogDescription>Provide a clear question and an informative, actionable answer.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-xs">Question *</Label>
                <Input
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  placeholder="e.g. What is your typical timeline for a full-stack project?"
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Answer</Label>
                <Textarea
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  placeholder="Detailed response..."
                  className="mt-1 text-sm"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveFaq}>Save FAQ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
