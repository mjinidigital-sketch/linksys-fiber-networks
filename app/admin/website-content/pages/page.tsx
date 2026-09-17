'use client'

import { useState } from 'react'
import {
  Plus,
  Trash2,
  Pencil,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Layers,
  Briefcase,
  Wrench,
  Compass,
  FileText,
  Mail,
  HelpCircle,
  Globe,
  Code2,
  LayoutTemplate,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ContentHeader } from '@/components/admin/ContentHeader'
import { BlockContentEditor } from '@/components/admin/BlockContentEditor'
import { ComponentBlockType, PageComponentBlock, PageConfig } from '@/lib/types/content'
import { defaultPageLayouts } from '@/lib/default-content'

export default function PagesLayoutManagerPage() {
  const { content, saving, lastSaved, updateSection } = useWebsiteContent()
  const { toast } = useToast()

  const [selectedPagePath, setSelectedPagePath] = useState<string>('/')
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false)
  const [newBlockType, setNewBlockType] = useState<ComponentBlockType>('hero')
  const [newBlockTitle, setNewBlockTitle] = useState('')

  const [editingBlock, setEditingBlock] = useState<{ pagePath: string; block: PageComponentBlock } | null>(null)

  const [isAddPageOpen, setIsAddPageOpen] = useState(false)
  const [newPageName, setNewPageName] = useState('')
  const [newPagePath, setNewPagePath] = useState('')

  const activePageLayouts = content.pageLayouts || defaultPageLayouts
  const activePageConfig = activePageLayouts[selectedPagePath] || {
    id: `page-${selectedPagePath.replace('/', '') || 'home'}`,
    name: selectedPagePath === '/' ? 'Home Page' : selectedPagePath.replace('/', ''),
    path: selectedPagePath,
    enabled: true,
    blocks: []
  }

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'hero': return <Sparkles className="size-4 text-primary" />
      case 'hero2': return <Sparkles className="size-4 text-primary" />
      case 'techStack': return <Wrench className="size-4 text-primary" />
      case 'logos': return <Globe className="size-4 text-primary" />
      case 'projects': return <Briefcase className="size-4 text-primary" />
      case 'process': return <Compass className="size-4 text-primary" />
      case 'services': return <Layers className="size-4 text-primary" />
      case 'templates': return <LayoutTemplate className="size-4 text-primary" />
      case 'blog': return <FileText className="size-4 text-primary" />
      case 'contact': return <Mail className="size-4 text-primary" />
      case 'faq': return <HelpCircle className="size-4 text-primary" />
      case 'ctaBanner': return <Sparkles className="size-4 text-primary" />
      case 'features': return <Sparkles className="size-4 text-primary" />
      case 'pricing': return <Briefcase className="size-4 text-primary" />
      case 'stats': return <Sparkles className="size-4 text-primary" />
      case 'codeBlock': return <Code2 className="size-4 text-primary" />
      case 'careers': return <Briefcase className="size-4 text-primary" />
      default: return <Code2 className="size-4 text-primary" />
    }
  }

  const getDefaultBlockData = (type: ComponentBlockType): Record<string, any> => {
    switch (type) {
      case 'hero':
      case 'hero2':
        return {
          badge: content.hero?.badge || '',
          titleLine1: content.hero?.titleLine1 || '',
          titleHighlight1: content.hero?.titleHighlight1 || '',
          titleLine2: content.hero?.titleLine2 || '',
          titleHighlight2: content.hero?.titleHighlight2 || '',
          bio: content.hero?.bio || '',
          primaryCtaText: content.hero?.primaryCtaText || '',
          primaryCtaLink: content.hero?.primaryCtaLink || '',
        }
      case 'techStack':
        return {
          sectionLabel: content.techStack?.sectionLabel || '',
          subtitle: content.techStack?.subtitle || '',
        }
      case 'process':
        return {
          sectionLabel: content.process?.sectionLabel || 'My Process',
          title: content.process?.title || 'How I Work',
        }
      case 'contact':
        return {
          sectionLabel: content.contact?.sectionLabel || '',
          title: content.contact?.title || '',
          subtitle: content.contact?.subtitle || '',
        }
      case 'ctaBanner':
        return {
          title: 'Ready to build something exceptional?',
          description: 'Let us collaborate on your next vision.',
          ctaText: "Let's Talk",
          ctaLink: '/contact',
        }
      case 'features':
        return {
          sectionLabel: content.features?.sectionLabel || '',
          title: content.features?.title || 'Features',
          subtitle: content.features?.subtitle || '',
          items: content.features?.items || [],
        }
      case 'pricing':
        return {
          sectionLabel: content.pricing?.sectionLabel || '',
          title: content.pricing?.title || 'Pricing',
          subtitle: content.pricing?.subtitle || '',
          plans: content.pricing?.plans || [],
        }
      case 'stats':
        return {
          sectionLabel: content.stats?.sectionLabel || '',
          title: content.stats?.title || 'Stats',
          subtitle: content.stats?.subtitle || '',
          items: content.stats?.items || [],
        }
      case 'codeBlock':
        return {
          files: content.codeBlock?.files || [],
        }
      case 'careers':
        return {}
      default:
        return {}
    }
  }

  const handleToggleBlock = async (blockId: string) => {
    const page = activePageConfig
    const updatedBlocks = page.blocks.map((b) =>
      b.id === blockId ? { ...b, enabled: !b.enabled } : b
    )
    const updatedLayouts = {
      ...activePageLayouts,
      [selectedPagePath]: { ...page, blocks: updatedBlocks }
    }
    const res = await updateSection('pageLayouts', updatedLayouts)
    if (res.success) {
      toast({ title: 'Block updated', description: 'Block status updated successfully.' })
    }
  }

  const handleMoveBlock = async (index: number, direction: 'up' | 'down') => {
    const page = activePageConfig
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= page.blocks.length) return

    const newBlocks = [...page.blocks]
    const temp = newBlocks[index]
    newBlocks[index] = newBlocks[targetIndex]
    newBlocks[targetIndex] = temp

    const updatedLayouts = {
      ...activePageLayouts,
      [selectedPagePath]: { ...page, blocks: newBlocks }
    }
    const res = await updateSection('pageLayouts', updatedLayouts)
    if (res.success) {
      toast({ title: 'Block reordered', description: 'Page block layout updated.' })
    }
  }

  const handleDeleteBlock = async (blockId: string) => {
    const page = activePageConfig
    const updatedBlocks = page.blocks.filter((b) => b.id !== blockId)
    const updatedLayouts = {
      ...activePageLayouts,
      [selectedPagePath]: { ...page, blocks: updatedBlocks }
    }
    const res = await updateSection('pageLayouts', updatedLayouts)
    if (res.success) {
      toast({ title: 'Block removed', description: 'Block removed from this page.' })
    }
  }

  const handleAddBlock = async () => {
    if (!newBlockTitle.trim()) {
      toast({ title: 'Title required', description: 'Please provide a block title.', variant: 'destructive' })
      return
    }

    const page = activePageConfig
    const newBlock: PageComponentBlock = {
      id: `blk-${Date.now().toString(36)}`,
      type: newBlockType,
      title: newBlockTitle.trim(),
      enabled: true,
      data: getDefaultBlockData(newBlockType),
    }

    const updatedLayouts = {
      ...activePageLayouts,
      [selectedPagePath]: {
        ...page,
        blocks: [...page.blocks, newBlock]
      }
    }

    const res = await updateSection('pageLayouts', updatedLayouts)
    if (res.success) {
      toast({ title: 'Block added', description: `${newBlockTitle} added to ${page.name}.` })
      setIsAddBlockOpen(false)
      setNewBlockTitle('')
    }
  }

  const handleAddPage = async () => {
    let cleanPath = newPagePath.trim()
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath
    if (!newPageName.trim()) {
      toast({ title: 'Page name required', description: 'Please provide a page name.', variant: 'destructive' })
      return
    }

    const newConfig: PageConfig = {
      id: `page-${cleanPath.replace(/[^a-zA-Z0-9]/g, '-')}`,
      name: newPageName.trim(),
      path: cleanPath,
      enabled: true,
      blocks: [
        { id: `blk-${Date.now()}-hero`, type: 'hero', title: 'Hero Section', enabled: true },
        { id: `blk-${Date.now()}-contact`, type: 'contact', title: 'Contact Section', enabled: true }
      ]
    }

    const updatedLayouts = {
      ...activePageLayouts,
      [cleanPath]: newConfig
    }

    const res = await updateSection('pageLayouts', updatedLayouts)
    if (res.success) {
      toast({ title: 'Page created', description: `Page ${cleanPath} has been created.` })
      setSelectedPagePath(cleanPath)
      setIsAddPageOpen(false)
      setNewPageName('')
      setNewPagePath('')
    }
  }

  const handleSaveBlockData = async (updatedBlock: PageComponentBlock) => {
    const pagePath = editingBlock?.pagePath || selectedPagePath
    const page = activePageLayouts[pagePath]
    if (!page) return

    const updatedBlocks = page.blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b))
    const updatedLayouts = {
      ...activePageLayouts,
      [pagePath]: { ...page, blocks: updatedBlocks }
    }

    const res = await updateSection('pageLayouts', updatedLayouts)
    if (res.success) {
      toast({ title: 'Block saved', description: 'Block content saved successfully.' })
      setEditingBlock(null)
    }
  }

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Page Builder & Routes"
        description="Configure route layouts, reorder section blocks, toggle visibility, and customize per-page overrides."
        badge="Modular Architecture"
        saving={saving}
        lastSaved={lastSaved}
        liveRoute={selectedPagePath}
      >
        <Button onClick={() => setIsAddPageOpen(true)} size="sm" variant="outline" className="gap-1.5 text-xs">
          <Plus className="size-3.5" />
          <span>New Page Route</span>
        </Button>
      </ContentHeader>

      {/* Route Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
        {Object.entries(activePageLayouts).map(([path, config]) => (
          <button
            key={path}
            onClick={() => setSelectedPagePath(path)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all cursor-pointer ${
              selectedPagePath === path
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'bg-card/70 border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <span>{config.name}</span>
            <span className="font-mono text-[10px] opacity-70">({path})</span>
            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${selectedPagePath === path ? 'border-primary-foreground/30 text-primary-foreground' : 'border-border'}`}>
              {config.blocks?.length || 0}
            </Badge>
          </button>
        ))}
      </div>

      {/* Page Configuration Header */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold">{activePageConfig.name}</CardTitle>
                <Badge variant="outline" className="font-mono text-xs">{activePageConfig.path}</Badge>
              </div>
              <CardDescription className="text-xs mt-1">
                {activePageConfig.description || 'Customizable layout blocks rendered dynamically on this route.'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsAddBlockOpen(true)} size="sm" className="gap-1.5 text-xs">
                <Plus className="size-3.5" />
                <span>Add Block</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Blocks List */}
        <CardContent className="p-5 pt-3 space-y-3">
          {activePageConfig.blocks?.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <LayoutTemplate className="mx-auto size-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm font-medium">No blocks configured for this page</p>
              <p className="text-xs text-muted-foreground mt-1">Click &quot;Add Block&quot; above to compose this page layout.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activePageConfig.blocks.map((block, index) => {
                const hasCustomContent = block.data && Object.keys(block.data).length > 0
                return (
                <div
                  key={block.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors ${
                    block.enabled ? 'border-border/80 bg-card/90' : 'border-border/40 bg-muted/20 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 font-mono text-xs font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {getBlockIcon(block.type)}
                        <span className="text-sm font-semibold text-foreground">{block.title}</span>
                        <Badge variant="outline" className="text-[10px] font-mono capitalize">
                          {block.type}
                        </Badge>
                        {hasCustomContent && (
                          <Badge className="text-[9px] font-mono bg-primary/10 text-primary border-primary/30 gap-0.5 px-1.5">
                            <Zap className="size-2.5" /> Customized
                          </Badge>
                        )}
                      </div>
                      {block.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{block.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      disabled={index === 0}
                      onClick={() => handleMoveBlock(index, 'up')}
                      title="Move Up"
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      disabled={index === activePageConfig.blocks.length - 1}
                      onClick={() => handleMoveBlock(index, 'down')}
                      title="Move Down"
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-primary/70 hover:text-primary hover:bg-primary/10"
                      onClick={() => {
                        setEditingBlock({ pagePath: selectedPagePath, block: JSON.parse(JSON.stringify(block)) })
                      }}
                      title="Edit Block Content"
                    >
                      <Pencil className="size-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className={`size-8 ${block.enabled ? 'text-emerald-500 hover:text-emerald-600' : 'text-muted-foreground'}`}
                      onClick={() => handleToggleBlock(block.id)}
                      title={block.enabled ? 'Disable Block' : 'Enable Block'}
                    >
                      {block.enabled ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteBlock(block.id)}
                      title="Remove Block"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Block Dialog */}
      <Dialog open={isAddBlockOpen} onOpenChange={setIsAddBlockOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Block to {activePageConfig.name}</DialogTitle>
            <DialogDescription>Select the component type to place on this page.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Block Title</Label>
              <Input
                placeholder="e.g. Services Showcase, Featured Projects"
                value={newBlockTitle}
                onChange={(e) => setNewBlockTitle(e.target.value)}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Component Type</Label>
              <select
                value={newBlockType}
                onChange={(e) => setNewBlockType(e.target.value as ComponentBlockType)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="hero">Hero Section</option>
                <option value="hero2">Compact Hero (Hero2)</option>
                <option value="techStack">Tech Stack & Skills</option>
                <option value="logos">Logos & Partners</option>
                <option value="projects">Projects Portfolio</option>
                <option value="process">Process Timeline</option>
                <option value="services">Services Catalog</option>
                <option value="templates">Templates & Kits</option>
                <option value="blog">Blog Articles</option>
                <option value="contact">Contact Section</option>
                <option value="faq">FAQ Accordion</option>
                <option value="ctaBanner">Call to Action Banner</option>
                <option value="features">Features</option>
                <option value="pricing">Pricing</option>
                <option value="stats">Stats</option>
                <option value="codeBlock">Code Block</option>
                <option value="careers">Careers & Open Roles</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddBlockOpen(false)}>Cancel</Button>
            <Button onClick={handleAddBlock}>Add Block</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Page Route Dialog */}
      <Dialog open={isAddPageOpen} onOpenChange={setIsAddPageOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Page Route</DialogTitle>
            <DialogDescription>Define a new route path and page title.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Page Name</Label>
              <Input
                placeholder="e.g. About Me, Case Studies, Pricing"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Route Path</Label>
              <Input
                placeholder="e.g. /about, /pricing, /portfolio"
                value={newPagePath}
                onChange={(e) => setNewPagePath(e.target.value)}
                className="mt-1 text-sm font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPageOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPage}>Create Page</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Content Editor — full slide-over panel */}
      {editingBlock && (
        <BlockContentEditor
          block={editingBlock.block}
          globalContent={content}
          onSave={handleSaveBlockData}
          onClose={() => setEditingBlock(null)}
        />
      )}
    </div>
  )
}
