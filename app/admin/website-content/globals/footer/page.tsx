'use client'

import { useState } from 'react'
import { FileCode2, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ContentHeader } from '@/components/admin/ContentHeader'
import { NavLink } from '@/lib/types/content'

export default function FooterGlobalsPage() {
  const { content, saving, lastSaved, updateSection } = useWebsiteContent()
  const { toast } = useToast()

  const footerData = content?.footer || {
    copyright: 'Victor Maina. Built with Next.js & Convex.',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Projects', href: '/projects' },
      { label: 'Services', href: '/services' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' }
    ]
  }

  const [newLabel, setNewLabel] = useState('')
  const [newHref, setNewHref] = useState('')
  const [newIsExternal, setNewIsExternal] = useState(false)

  const handleAddLink = async () => {
    if (!newLabel.trim() || !newHref.trim()) {
      toast({ title: 'Fields required', description: 'Please provide both label and href.', variant: 'destructive' })
      return
    }

    const newLink: NavLink = {
      label: newLabel.trim(),
      href: newHref.trim(),
      isExternal: newIsExternal
    }

    const updated = {
      ...footerData,
      links: [...(footerData.links || []), newLink]
    }

    const res = await updateSection('footer', updated)
    if (res.success) {
      toast({ title: 'Footer link added' })
      setNewLabel('')
      setNewHref('')
      setNewIsExternal(false)
    }
  }

  const handleDeleteLink = async (index: number) => {
    const links = (footerData.links || []).filter((_, i) => i !== index)
    const updated = { ...footerData, links }
    const res = await updateSection('footer', updated)
    if (res.success) {
      toast({ title: 'Footer link removed' })
    }
  }

  const handleMoveLink = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= (footerData.links?.length || 0)) return

    const links = [...(footerData.links || [])]
    const temp = links[index]
    links[index] = links[targetIndex]
    links[targetIndex] = temp

    const updated = { ...footerData, links }
    const res = await updateSection('footer', updated)
    if (res.success) {
      toast({ title: 'Links reordered' })
    }
  }

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Footer Configuration"
        description="Manage the copyright notice, legal footnotes, and bottom website links."
        badge="Sitewide"
        saving={saving}
        lastSaved={lastSaved}
        liveRoute="/"
      />

      {/* Copyright Text */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Copyright Statement</CardTitle>
          <CardDescription className="text-xs">Displayed at the bottom of every page.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div>
            <Label className="text-xs">Copyright Text</Label>
            <Input
              value={footerData.copyright}
              onChange={(e) => updateSection('footer', { ...footerData, copyright: e.target.value })}
              placeholder="e.g. Victor Maina. Built with Next.js & Convex."
              className="mt-1 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Footer Links List */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Footer Navigation Links ({footerData.links?.length || 0})</CardTitle>
          <CardDescription className="text-xs">Links displayed in the site footer columns.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div className="space-y-2">
            {footerData.links?.map((link, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card/90 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-md bg-muted text-[11px] font-mono text-muted-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{link.label}</span>
                      {link.isExternal && (
                        <ExternalLink className="size-3 text-muted-foreground" />
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">{link.href}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    disabled={index === 0}
                    onClick={() => handleMoveLink(index, 'up')}
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    disabled={index === (footerData.links?.length || 0) - 1}
                    onClick={() => handleMoveLink(index, 'down')}
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteLink(index)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Link Form */}
          <div className="rounded-xl border border-dashed border-border p-3.5 bg-muted/10 space-y-3">
            <p className="text-xs font-semibold text-foreground">Add Footer Link</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Link Label</Label>
                <Input
                  placeholder="e.g. Privacy Policy"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Target Path / URL</Label>
                <Input
                  placeholder="/privacy or https://..."
                  value={newHref}
                  onChange={(e) => setNewHref(e.target.value)}
                  className="mt-1 text-xs font-mono"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Switch
                  id="external-footer-switch"
                  checked={newIsExternal}
                  onCheckedChange={setNewIsExternal}
                />
                <Label htmlFor="external-footer-switch" className="text-xs cursor-pointer">
                  Opens in new tab
                </Label>
              </div>
              <Button onClick={handleAddLink} size="sm" className="gap-1.5 text-xs">
                <Plus className="size-3.5" />
                <span>Add Link</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
