'use client'

import { useState } from 'react'
import { Plus, Trash2, Save, ExternalLink, Share2, Globe } from 'lucide-react'
import { GithubIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from '@/components/ui/icons'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { SocialLink } from '@/lib/types/content'

export default function SocialsAdminPage() {
  const { content, setContent, saving, saveAll } = useWebsiteContent()
  const { toast } = useToast()

  if (!content) return null

  const handleSave = async () => {
    const res = await saveAll(content)
    if (res?.success) {
      toast({
        type: 'success',
        title: 'Social links updated',
        description: 'Profiles have been saved and updated across all views.',
      })
    }
  }

  const addSocial = (platform: string, defaultUrl: string) => {
    const newSoc: SocialLink = {
      id: `soc-${Date.now()}`,
      platform,
      label: platform,
      url: defaultUrl,
      username: '',
    }
    setContent({
      ...content,
      contact: {
        ...content.contact,
        socials: [...content.contact.socials, newSoc],
      },
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="accent">Profiles & Handles</Badge>
            <span className="font-mono text-xs text-muted-foreground">/admin/socials</span>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">Social Links & Profiles</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your developer profiles, social feeds, and platforms.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl shadow-lg shadow-primary/20 bg-primary font-semibold text-primary-foreground"
        >
          <Save className="size-4 mr-1.5" />
          {saving ? 'Saving...' : 'Save Socials'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Social Links ({content.contact.socials.length})</CardTitle>
          <CardDescription>These links appear in your Hero section, Contact area, and Footer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {content.contact.socials.map((soc, idx) => (
              <div
                key={soc.id}
                className="grid gap-3 rounded-2xl border border-border bg-card p-4 transition-all sm:grid-cols-[1.2fr_2fr_1fr_auto] items-center"
              >
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Platform / Title</Label>
                  <Input
                    value={soc.platform}
                    onChange={(e) => {
                      const updated = [...content.contact.socials]
                      updated[idx].platform = e.target.value
                      updated[idx].label = e.target.value
                      setContent({ ...content, contact: { ...content.contact, socials: updated } })
                    }}
                    placeholder="e.g. GitHub"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Profile URL</Label>
                  <Input
                    value={soc.url}
                    onChange={(e) => {
                      const updated = [...content.contact.socials]
                      updated[idx].url = e.target.value
                      setContent({ ...content, contact: { ...content.contact, socials: updated } })
                    }}
                    placeholder="https://..."
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Handle / Username</Label>
                  <Input
                    value={soc.username || ''}
                    onChange={(e) => {
                      const updated = [...content.contact.socials]
                      updated[idx].username = e.target.value
                      setContent({ ...content, contact: { ...content.contact, socials: updated } })
                    }}
                    placeholder="@handle"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-5 sm:pt-0">
                  {soc.url && (
                    <a
                      href={soc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      setContent({
                        ...content,
                        contact: {
                          ...content.contact,
                          socials: content.contact.socials.filter((s) => s.id !== soc.id),
                        },
                      })
                    }}
                    className="rounded-xl"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Quick Add Presets
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => addSocial('GitHub', 'https://github.com/username')} className="rounded-xl">
                <GithubIcon className="size-3.5 mr-1.5" /> + GitHub
              </Button>
              <Button variant="outline" size="sm" onClick={() => addSocial('LinkedIn', 'https://linkedin.com/in/username')} className="rounded-xl">
                <LinkedinIcon className="size-3.5 mr-1.5" /> + LinkedIn
              </Button>
              <Button variant="outline" size="sm" onClick={() => addSocial('Twitter', 'https://twitter.com/username')} className="rounded-xl">
                <TwitterIcon className="size-3.5 mr-1.5" /> + Twitter / X
              </Button>
              <Button variant="outline" size="sm" onClick={() => addSocial('YouTube', 'https://youtube.com/@username')} className="rounded-xl">
                <YoutubeIcon className="size-3.5 mr-1.5" /> + YouTube
              </Button>
              <Button variant="outline" size="sm" onClick={() => addSocial('Custom', 'https://')} className="rounded-xl">
                <Globe className="size-3.5 mr-1.5" /> + Custom Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
