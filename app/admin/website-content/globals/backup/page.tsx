'use client'

import { useState } from 'react'
import { Download, Upload, Copy, RotateCcw, Check, Database, AlertTriangle } from 'lucide-react'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ContentHeader } from '@/components/admin/ContentHeader'

export default function BackupGlobalsPage() {
  const { content, saving, lastSaved, saveAll, resetToDefault } = useWebsiteContent()
  const { toast } = useToast()

  if (!content) return null

  const [jsonInput, setJsonInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2))
    setCopied(true)
    toast({ title: 'Copied', description: 'Complete site schema copied to clipboard.' })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(content, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `victor-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast({ title: 'Backup downloaded', description: 'JSON backup exported successfully.' })
  }

  const handleApplyJson = async () => {
    try {
      const parsed = JSON.parse(jsonInput)
      const res = await saveAll(parsed)
      if (res.success) {
        toast({ title: 'Schema imported', description: 'Site content updated from JSON.' })
        setJsonInput('')
      }
    } catch (err: any) {
      toast({ title: 'Invalid JSON', description: err?.message || 'Could not parse JSON syntax.', variant: 'destructive' })
    }
  }

  const handleConfirmReset = async () => {
    const res = await resetToDefault()
    if (res.success) {
      toast({ title: 'Reset successful', description: 'Site content restored to default.' })
      setIsResetDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Backup & Database Sync"
        description="Export snapshot backups of your entire website content, import custom JSON schemas, or restore defaults."
        badge="Data Persistence"
        saving={saving}
        lastSaved={lastSaved}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export JSON Card */}
        <Card className="border-border/80 bg-card/60 flex flex-col justify-between">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Download className="size-4 text-primary" />
              <span>Export Content Backup</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Download your complete portfolio configuration as a JSON file or copy it to your clipboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="rounded-xl border border-border bg-muted/30 p-3 font-mono text-[11px] text-muted-foreground h-32 overflow-hidden relative">
              <pre className="overflow-hidden text-ellipsis">{JSON.stringify(content, null, 2)}</pre>
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-muted/80 pointer-events-none" />
            </div>
          </CardContent>
          <CardFooter className="p-5 pt-0 flex gap-2">
            <Button onClick={handleCopyJson} variant="outline" size="sm" className="flex-1 gap-1.5 text-xs">
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy JSON'}</span>
            </Button>
            <Button onClick={handleDownloadBackup} size="sm" className="flex-1 gap-1.5 text-xs">
              <Download className="size-3.5" />
              <span>Download File</span>
            </Button>
          </CardFooter>
        </Card>

        {/* Restore Factory Defaults Card */}
        <Card className="border-border/80 bg-card/60 flex flex-col justify-between">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-destructive">
              <RotateCcw className="size-4" />
              <span>Restore Factory Defaults</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Reset all pages, collections, components, and globals back to the initial seeded content.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-destructive flex items-center gap-1.5">
                <AlertTriangle className="size-3.5" />
                <span>Caution</span>
              </p>
              <p>This action replaces current database content with default starter content. Make sure to download a backup first if you want to save current changes.</p>
            </div>
          </CardContent>
          <CardFooter className="p-5 pt-0">
            <Button
              onClick={() => setIsResetDialogOpen(true)}
              variant="destructive"
              size="sm"
              className="w-full gap-1.5 text-xs font-semibold"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset Site to Default</span>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Import JSON Card */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Upload className="size-4 text-primary" />
            <span>Import JSON Schema</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Paste a valid JSON schema to replace or restore entire website content in one click.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-3">
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='Paste JSON schema here, e.g. { "hero": { ... }, "projects": { ... } }'
            className="font-mono text-xs h-40"
          />
          <div className="flex justify-end">
            <Button onClick={handleApplyJson} disabled={!jsonInput.trim() || saving} size="sm" className="gap-1.5 text-xs font-semibold">
              <Upload className="size-3.5" />
              <span>Import & Save Schema</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Reset */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="size-4" />
              <span>Confirm Factory Reset</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reset all content back to factory defaults? All unsaved modifications will be replaced.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmReset}>Confirm Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
