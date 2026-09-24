'use client'

import { Save, User, Mail, MapPin, Briefcase, FileCheck } from 'lucide-react'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ImageUploader } from '@/components/ui/image-uploader'

export default function SettingsAdminPage() {
  const { content, setContent, saving, saveAll } = useWebsiteContent()
  const { toast } = useToast()

  if (!content) return null

  const handleSave = async () => {
    const res = await saveAll(content)
    if (res?.success) {
      toast({
        type: 'success',
        title: 'Settings saved',
        description: 'Site profile settings updated.',
      })
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="accent">Configuration</Badge>
            <span className="font-mono text-xs text-muted-foreground">/admin/settings</span>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">Site & Profile Settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal profile, availability status, and global brand identifiers.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl shadow-lg shadow-primary/20 bg-primary font-semibold text-primary-foreground"
        >
          <Save className="size-4 mr-1.5" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Primary personal information displayed on your portfolio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <ImageUploader
                value={content.general.avatarUrl}
                onChange={(url) =>
                  setContent({
                    ...content,
                    general: { ...content.general, avatarUrl: url },
                    hero: { ...content.hero, avatarUrl: url },
                  })
                }
                label="Site & Profile Avatar (Convex Storage)"
                aspectRatio="square"
                placeholder="Upload avatar photo to Convex Storage"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Display Name</Label>
                <Input
                  value={content.general.displayName}
                  onChange={(e) =>
                    setContent({ ...content, general: { ...content.general, displayName: e.target.value } })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Professional Role</Label>
                <Input
                  value={content.general.role}
                  onChange={(e) =>
                    setContent({ ...content, general: { ...content.general, role: e.target.value } })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Short Bio</Label>
              <Textarea
                rows={3}
                value={content.general.shortBio}
                onChange={(e) =>
                  setContent({ ...content, general: { ...content.general, shortBio: e.target.value } })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Primary Email</Label>
                <Input
                  value={content.general.email}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      general: { ...content.general, email: e.target.value },
                      contact: { ...content.contact, email: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input
                  value={content.general.location}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      general: { ...content.general, location: e.target.value },
                      hero: { ...content.hero, locationText: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Resume / CV Link</Label>
                <Input
                  value={content.general.resumeUrl || ''}
                  onChange={(e) =>
                    setContent({ ...content, general: { ...content.general, resumeUrl: e.target.value } })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Availability Status Text</Label>
                <Input
                  value={content.general.statusBadge}
                  onChange={(e) =>
                    setContent({ ...content, general: { ...content.general, statusBadge: e.target.value } })
                  }
                  placeholder="Available for projects"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-muted p-4 mt-2">
              <div>
                <p className="text-sm font-semibold">Available for Work / Contracts</p>
                <p className="text-xs text-muted-foreground">Show green active indicator to prospective clients</p>
              </div>
              <Switch
                checked={content.general.availableForWork}
                onCheckedChange={(checked) =>
                  setContent({ ...content, general: { ...content.general, availableForWork: checked } })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
