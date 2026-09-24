'use client'

import { useState } from 'react'
import {
  Plus,
  Trash2,
  Pencil,
  Sparkles,
  ExternalLink,
  Star,
  Layers,
  Briefcase,
  Upload
} from 'lucide-react'
import { GithubIcon } from '@/components/ui/icons'
import { useWebsiteContent } from '@/hooks/use-website-content'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ContentHeader } from '@/components/admin/ContentHeader'
import { ImageUploader } from '@/components/ui/image-uploader'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { CollectionSeoSection } from '@/components/admin/CollectionSeoSection'
import { ProjectItem } from '@/lib/types/content'

export default function ProjectsCollectionPage() {
  const { content, saving, lastSaved, updateSection } = useWebsiteContent()
  const { toast } = useToast()

  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [newTagInput, setNewTagInput] = useState('')
  const [searchFilter, setSearchFilter] = useState('')

  const projectsData = content?.projects || {
    sectionLabel: 'Projects',
    title: 'Selected Work',
    ctaText: 'View All Projects',
    ctaLink: '/projects',
    items: []
  }

  const handleSaveSectionMeta = async () => {
    const res = await updateSection('projects', projectsData)
    if (res.success) {
      toast({ title: 'Section saved', description: 'Projects section settings updated.' })
    }
  }

  const handleOpenNewProject = () => {
    setEditingProject({
      id: `project-${Date.now().toString(36)}`,
      title: '',
      type: 'Web Application',
      description: '',
      summary: '',
      content: '',
      tags: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      accent: 'from-blue-600 to-indigo-600',
      link: '',
      featured: true,
      category: 'Full Stack',
      liveUrl: '',
      githubUrl: '',
      image: '',
      completionDate: new Date().getFullYear().toString()
    })
    setIsProjectDialogOpen(true)
  }

  const handleSaveProjectItem = async () => {
    if (!editingProject || !editingProject.title.trim()) {
      toast({ title: 'Title required', description: 'Please enter a project title.', variant: 'destructive' })
      return
    }

    const items = [...(projectsData.items || [])]
    const index = items.findIndex((p) => p.id === editingProject.id)
    if (index >= 0) {
      items[index] = editingProject
    } else {
      items.unshift(editingProject)
    }

    const updated = { ...projectsData, items }
    const res = await updateSection('projects', updated)
    if (res.success) {
      toast({ title: 'Project saved', description: `${editingProject.title} has been updated.` })
      setIsProjectDialogOpen(false)
      setEditingProject(null)
    }
  }

  const handleDeleteProject = async (id: string) => {
    const items = (projectsData.items || []).filter((p) => p.id !== id)
    const updated = { ...projectsData, items }
    const res = await updateSection('projects', updated)
    if (res.success) {
      toast({ title: 'Project removed', description: 'Project removed from collection.' })
    }
  }

  const handleToggleFeatured = async (id: string) => {
    const items = (projectsData.items || []).map((p) =>
      p.id === id ? { ...p, featured: !p.featured } : p
    )
    const updated = { ...projectsData, items }
    const res = await updateSection('projects', updated)
    if (res.success) {
      toast({ title: 'Featured status updated' })
    }
  }

  const filteredItems = (projectsData.items || []).filter(
    (p) =>
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.type.toLowerCase().includes(searchFilter.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Projects Collection"
        description="Manage work showcase, case studies, live links, technology tags, and featured items."
        badge={`${projectsData.items?.length || 0} Projects`}
        saving={saving}
        lastSaved={lastSaved}
        liveRoute="/projects"
      >
        <Button onClick={handleOpenNewProject} size="sm" className="gap-1.5 text-xs font-semibold">
          <Plus className="size-3.5" />
          <span>Add Project</span>
        </Button>
      </ContentHeader>

      {/* Section Headings Config */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Section Header Settings</CardTitle>
          <CardDescription className="text-xs">Labels displayed above the projects grid on pages.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Section Label</Label>
              <Input
                value={projectsData.sectionLabel}
                onChange={(e) => updateSection('projects', { ...projectsData, sectionLabel: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Section Title</Label>
              <Input
                value={projectsData.title}
                onChange={(e) => updateSection('projects', { ...projectsData, title: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">CTA Button Text</Label>
              <Input
                value={projectsData.ctaText}
                onChange={(e) => updateSection('projects', { ...projectsData, ctaText: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">CTA Button Link</Label>
              <Input
                value={projectsData.ctaLink}
                onChange={(e) => updateSection('projects', { ...projectsData, ctaLink: e.target.value })}
                className="mt-1 text-xs font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Input
            placeholder="Search projects by title, type, or technology..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="max-w-md h-9 text-xs"
          />
          <span className="text-xs text-muted-foreground">{filteredItems.length} of {projectsData.items?.length || 0} projects</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((project) => (
            <Card key={project.id} className="border-border/80 bg-card/60 flex flex-col justify-between hover:border-primary/40 transition-colors">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] font-mono capitalize">
                      {project.type}
                    </Badge>
                    {project.featured && (
                      <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[10px] gap-1">
                        <Star className="size-2.5 fill-amber-500" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleToggleFeatured(project.id)}
                      title={project.featured ? 'Unfeature' : 'Mark as Featured'}
                    >
                      <Star className={`size-3.5 ${project.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setEditingProject({ ...project })
                        setIsProjectDialogOpen(true)
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-2 text-base font-bold text-foreground">{project.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-3">
                {project.image && (
                  <div className="relative h-28 w-full overflow-hidden rounded-lg border border-border bg-muted/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={project.image} alt={project.title} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-md bg-muted/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 4 && (
                    <span className="text-[10px] text-muted-foreground">+{project.tags.length - 4} more</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add / Edit Project Dialog */}
      {editingProject && (
        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
          <DialogContent className="w-[75vw] max-w-6xl" onClose={() => setIsProjectDialogOpen(false)}>
            <DialogHeader>
              <DialogTitle>{editingProject.title ? `Edit ${editingProject.title}` : 'Create New Project'}</DialogTitle>
              <DialogDescription>Fill out the project details, live links, preview image and case study.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Project Title *</Label>
                  <Input
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    placeholder="e.g. AI Workflow Automation Platform"
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Project Type / Category</Label>
                  <Input
                    value={editingProject.type}
                    onChange={(e) => setEditingProject({ ...editingProject, type: e.target.value })}
                    placeholder="e.g. Full Stack, SaaS, Mobile App"
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Short Description</Label>
                <Textarea
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  placeholder="Summary displayed on portfolio cards..."
                  className="mt-1 text-sm"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Live Demo URL</Label>
                  <Input
                    value={editingProject.liveUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                    placeholder="https://..."
                    className="mt-1 text-sm font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs">GitHub Repo URL</Label>
                  <Input
                    value={editingProject.githubUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="mt-1 text-sm font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs">Accent Gradient</Label>
                  <Input
                    value={editingProject.accent}
                    onChange={(e) => setEditingProject({ ...editingProject, accent: e.target.value })}
                    placeholder="from-blue-600 to-indigo-600"
                    className="mt-1 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="featured-switch"
                  checked={editingProject.featured}
                  onCheckedChange={(checked) => setEditingProject({ ...editingProject, featured: checked })}
                />
                <Label htmlFor="featured-switch" className="text-xs cursor-pointer">
                  Featured on Home & Selected Showcase
                </Label>
              </div>

              {/* Image Uploader */}
              <div>
                <Label className="text-xs mb-1 block">Cover Preview Image</Label>
                <ImageUploader
                  value={editingProject.image || ''}
                  onChange={(url) => setEditingProject({ ...editingProject, image: url })}
                  placeholder="Upload or paste project mockup image URL"
                />
              </div>

              {/* Tags Manager */}
              <div>
                <Label className="text-xs">Technology Tags</Label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {editingProject.tags.map((tag, idx) => (
                    <span key={idx} className="flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs text-primary font-medium">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProject({
                            ...editingProject,
                            tags: editingProject.tags.filter((_, i) => i !== idx)
                          })
                        }
                        className="text-primary/60 hover:text-primary"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="Add technology (e.g. React, Convex, Tailwind)..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTagInput.trim()) {
                        e.preventDefault()
                        setEditingProject({
                          ...editingProject,
                          tags: [...editingProject.tags, newTagInput.trim()]
                        })
                        setNewTagInput('')
                      }
                    }}
                    className="text-xs h-8"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => {
                      if (newTagInput.trim()) {
                        setEditingProject({
                          ...editingProject,
                          tags: [...editingProject.tags, newTagInput.trim()]
                        })
                        setNewTagInput('')
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Rich Text Case Study Content */}
              <div>
                <Label className="text-xs mb-1 block">Full Case Study / Article Content</Label>
                <RichTextEditor
                  value={editingProject.content || ''}
                  onChange={(val) => setEditingProject({ ...editingProject, content: val })}
                  placeholder="Write detailed case study, challenges, architecture & results..."
                />
              </div>

              {/* Dedicated SEO & Social Sharing Section */}
              <CollectionSeoSection
                seo={editingProject.seo}
                onChange={(seo) => setEditingProject({ ...editingProject, seo })}
                defaultTitle={editingProject.title}
                defaultDescription={editingProject.summary || editingProject.description || editingProject.content}
                defaultImage={editingProject.image}
                defaultKeywords={editingProject.tags?.length ? editingProject.tags.join(', ') : 'Web Project, Case Study, Full Stack'}
                itemPath={`/projects/${editingProject.id}`}
                itemType="project"
                siteName="Victor Maina"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveProjectItem}>Save Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
