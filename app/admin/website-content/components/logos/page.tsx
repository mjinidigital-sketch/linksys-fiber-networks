'use client'

import { useState } from 'react'
import { Globe, Plus, Trash2 } from 'lucide-react'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ContentHeader } from '@/components/admin/ContentHeader'

export default function LogosComponentPage() {
  const { content, saving, lastSaved, updateSection } = useWebsiteContent()
  const { toast } = useToast()

  const logosData = content?.logos || {
    sectionLabel: 'Trusted By & Built With',
    title: 'Modern Tools & Partners',
    subtitle: 'Technologies and ecosystems I collaborate with.',
    items: ['Vercel', 'Next.js', 'Convex', 'Tailwind', 'Supabase', 'Stripe', 'GitHub', 'Linear']
  }

  const [newLogo, setNewLogo] = useState('')

  const handleAddLogo = async () => {
    if (!newLogo.trim()) return
    const updated = {
      ...logosData,
      items: [...(logosData.items || []), newLogo.trim()]
    }
    const res = await updateSection('logos', updated)
    if (res.success) {
      toast({ title: 'Brand added', description: `${newLogo.trim()} added.` })
      setNewLogo('')
    }
  }

  const handleRemoveLogo = async (index: number) => {
    const updated = {
      ...logosData,
      items: (logosData.items || []).filter((_, i) => i !== index)
    }
    const res = await updateSection('logos', updated)
    if (res.success) {
      toast({ title: 'Brand removed' })
    }
  }

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Logos & Brand Showcase"
        description="Manage partner brand logos, client names, and tool ecosystems displayed on your site."
        badge={`${logosData.items?.length || 0} Brands`}
        saving={saving}
        lastSaved={lastSaved}
        liveRoute="/"
      />

      <Card className="border-border/80 bg-card/60">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-bold">Section Header Settings</CardTitle>
          <CardDescription className="text-xs">Labels displayed above the client & partner marquee.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Section Label</Label>
              <Input
                value={logosData.sectionLabel}
                onChange={(e) => updateSection('logos', { ...logosData, sectionLabel: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Section Title</Label>
              <Input
                value={logosData.title}
                onChange={(e) => updateSection('logos', { ...logosData, title: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Subtitle</Label>
              <Input
                value={logosData.subtitle}
                onChange={(e) => updateSection('logos', { ...logosData, subtitle: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/60">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-bold">Partner & Brand Badges ({logosData.items?.length || 0})</CardTitle>
          <CardDescription className="text-xs">Brands displayed in the floating logo marquee.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            {logosData.items?.map((item, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-muted/50"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveLogo(idx)}
                  className="rounded-full p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  title="Remove logo"
                >
                  <Trash2 className="size-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-md pt-2">
            <Input
              placeholder="Add brand name (e.g. AWS, Figma, OpenAI)..."
              value={newLogo}
              onChange={(e) => setNewLogo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddLogo()
                }
              }}
              className="text-sm"
            />
            <Button onClick={handleAddLogo} size="sm" className="gap-1.5 text-xs">
              <Plus className="size-3.5" />
              <span>Add</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
