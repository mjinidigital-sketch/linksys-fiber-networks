'use client'

import { useState } from 'react'
import { Wrench, Plus, Trash2 } from 'lucide-react'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ContentHeader } from '@/components/admin/ContentHeader'

export default function TechStackComponentPage() {
  const { content, saving, lastSaved, updateSection } = useWebsiteContent()
  const { toast } = useToast()

  const techData = content?.techStack || {
    sectionLabel: 'Core Stack & Engineering Tools',
    subtitle: 'Technologies and frameworks I use to build production systems.',
    items: ['Next.js', 'React', 'TypeScript', 'Node.js', 'Convex', 'Tailwind CSS', 'PostgreSQL', 'Docker', 'GraphQL', 'Python']
  }

  const [newSkill, setNewSkill] = useState('')

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return
    const updated = {
      ...techData,
      items: [...techData.items, newSkill.trim()]
    }
    const res = await updateSection('techStack', updated)
    if (res.success) {
      toast({ title: 'Skill added', description: `${newSkill.trim()} added to tech stack.` })
      setNewSkill('')
    }
  }

  const handleRemoveSkill = async (index: number) => {
    const updated = {
      ...techData,
      items: techData.items.filter((_, i) => i !== index)
    }
    const res = await updateSection('techStack', updated)
    if (res.success) {
      toast({ title: 'Skill removed' })
    }
  }

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Tech Stack & Skills"
        description="Manage the technical proficiencies, frameworks, database tools, and runtime badges shown on your site."
        badge={`${techData.items?.length || 0} Skills`}
        saving={saving}
        lastSaved={lastSaved}
        liveRoute="/"
      />

      <Card className="border-border/80 bg-card/60">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-bold">Section Header Settings</CardTitle>
          <CardDescription className="text-xs">Labels displayed above the technology pills.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Section Label</Label>
              <Input
                value={techData.sectionLabel}
                onChange={(e) => updateSection('techStack', { ...techData, sectionLabel: e.target.value })}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Section Subtitle</Label>
              <Input
                value={techData.subtitle}
                onChange={(e) => updateSection('techStack', { ...techData, subtitle: e.target.value })}
                className="mt-1 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/60">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-bold">Technology Badges ({techData.items?.length || 0})</CardTitle>
          <CardDescription className="text-xs">Add, reorder, or remove specific technology badges.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            {techData.items?.map((item, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/15"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(idx)}
                  className="rounded-full p-0.5 text-primary/60 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  title="Remove skill"
                >
                  <Trash2 className="size-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-md pt-2">
            <Input
              placeholder="Add skill (e.g. Rust, Redis, Kubernetes, AWS)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddSkill()
                }
              }}
              className="text-sm"
            />
            <Button onClick={handleAddSkill} size="sm" className="gap-1.5 text-xs">
              <Plus className="size-3.5" />
              <span>Add</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
