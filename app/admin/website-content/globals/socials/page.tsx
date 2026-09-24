'use client'

import { useState } from 'react'
import { Share2, Plus, Trash2, Pencil, ExternalLink } from 'lucide-react'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ContentHeader } from '@/components/admin/ContentHeader'
import { SocialLink } from '@/lib/types/content'

export default function SocialsGlobalsPage() {
  const { content, saving, lastSaved, updateSection } = useWebsiteContent()
  const { toast } = useToast()

  const contactData = content?.contact || {
    sectionLabel: 'Contact',
    title: 'Let’s Build Something Exceptional',
    subtitle: 'Available for high impact projects, architecture consulting, and full-stack development.',
    email: 'contact@victormaina.com',
    ctaText: 'Send a Message',
    location: 'Nairobi, Kenya / Remote Worldwide',
    socials: []
  }

  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleOpenNewSocial = () => {
    setEditingSocial({
      id: `social-${Date.now().toString(36)}`,
      platform: 'GitHub',
      label: 'GitHub Profile',
      url: 'https://github.com/',
      username: '@username'
    })
    setIsDialogOpen(true)
  }

  const handleSaveSocial = async () => {
    if (!editingSocial || !editingSocial.platform.trim() || !editingSocial.url.trim()) {
      toast({ title: 'Fields required', description: 'Please enter a platform and URL.', variant: 'destructive' })
      return
    }

    const socials = [...(contactData.socials || [])]
    const index = socials.findIndex((s) => s.id === editingSocial.id)
    if (index >= 0) {
      socials[index] = editingSocial
    } else {
      socials.push(editingSocial)
    }

    const updated = { ...contactData, socials }
    const res = await updateSection('contact', updated)
    if (res.success) {
      toast({ title: 'Social profile saved', description: `${editingSocial.platform} link updated.` })
      setIsDialogOpen(false)
      setEditingSocial(null)
    }
  }

  const handleDeleteSocial = async (id: string) => {
    const socials = (contactData.socials || []).filter((s) => s.id !== id)
    const updated = { ...contactData, socials }
    const res = await updateSection('contact', updated)
    if (res.success) {
      toast({ title: 'Social link removed' })
    }
  }

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Social Links & Profiles"
        description="Manage connected social media links, GitHub, Twitter/X, LinkedIn, and professional accounts."
        badge={`${contactData.socials?.length || 0} Socials`}
        saving={saving}
        lastSaved={lastSaved}
        liveRoute="/contact"
      >
        <Button onClick={handleOpenNewSocial} size="sm" className="gap-1.5 text-xs font-semibold">
          <Plus className="size-3.5" />
          <span>Add Social Link</span>
        </Button>
      </ContentHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contactData.socials?.map((social) => (
          <Card key={social.id} className="border-border/80 bg-card/60 flex flex-col justify-between hover:border-primary/40 transition-colors">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-lg bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                  {social.platform}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setEditingSocial({ ...social })
                      setIsDialogOpen(true)
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteSocial(social.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              <CardTitle className="mt-2 text-sm font-bold text-foreground">{social.label}</CardTitle>
              {social.username && (
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{social.username}</p>
              )}
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <a
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary hover:underline font-mono truncate"
              >
                <span className="truncate">{social.url}</span>
                <ExternalLink className="size-3 shrink-0" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add / Edit Social Dialog */}
      {editingSocial && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSocial.platform ? `Edit ${editingSocial.platform}` : 'Add Social Link'}</DialogTitle>
              <DialogDescription>Configure platform name, display label, and target profile URL.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Platform Name *</Label>
                  <Input
                    value={editingSocial.platform}
                    onChange={(e) => setEditingSocial({ ...editingSocial, platform: e.target.value })}
                    placeholder="e.g. GitHub, Twitter, LinkedIn"
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Display Handle / Username</Label>
                  <Input
                    value={editingSocial.username || ''}
                    onChange={(e) => setEditingSocial({ ...editingSocial, username: e.target.value })}
                    placeholder="@username"
                    className="mt-1 text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Display Label</Label>
                <Input
                  value={editingSocial.label}
                  onChange={(e) => setEditingSocial({ ...editingSocial, label: e.target.value })}
                  placeholder="e.g. GitHub Profile, Connect on LinkedIn"
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Profile URL *</Label>
                <Input
                  value={editingSocial.url}
                  onChange={(e) => setEditingSocial({ ...editingSocial, url: e.target.value })}
                  placeholder="https://github.com/..."
                  className="mt-1 text-sm font-mono"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveSocial}>Save Social Link</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
