'use client'

import { useState } from 'react'
import {
  Plus,
  Trash2,
  Pencil,
  FileText,
  Calendar,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react'
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
import { BlogPostItem } from '@/lib/types/content'

function slugify(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function BlogCollectionPage() {
  const { content, saving, lastSaved, updateSection } = useWebsiteContent()
  const { toast } = useToast()

  const [editingPost, setEditingPost] = useState<BlogPostItem | null>(null)
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const blogData = content?.blog || {
    sectionLabel: 'Articles & Insights',
    title: 'Latest Writing',
    subtitle: 'Deep dives on engineering, scalable systems, and modern web architectures.',
    posts: []
  }

  const handleOpenNewPost = () => {
    setEditingPost({
      id: `post-${Date.now().toString(36)}`,
      slug: '',
      title: '',
      excerpt: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: '5 min read',
      category: 'Engineering',
      coverImage: '',
      published: true,
      content: ''
    })
    setIsPostDialogOpen(true)
  }

  const handleEditPost = (post: BlogPostItem) => {
    setEditingPost({ ...post })
    setIsPostDialogOpen(true)
  }

  const handleSavePost = async () => {
    if (!editingPost || !editingPost.title.trim()) {
      toast({ title: 'Title required', description: 'Please enter a post title.', variant: 'destructive' })
      return
    }

    // Auto-generate clean slug from title
    let postToSave = { ...editingPost }
    postToSave.slug = slugify(postToSave.title) || `post-${Date.now().toString(36)}`

    const posts = [...(blogData.posts || [])]
    const index = posts.findIndex((p) => p.id === postToSave.id)
    if (index >= 0) {
      posts[index] = postToSave
    } else {
      posts.unshift(postToSave)
    }

    const updated = { ...blogData, posts }
    const res = await updateSection('blog', updated)
    if (res.success) {
      toast({ title: 'Post saved', description: `${postToSave.title} updated successfully.` })
      setIsPostDialogOpen(false)
      setEditingPost(null)
    }
  }

  const handleDeletePost = async (id: string) => {
    const posts = (blogData.posts || []).filter((p) => p.id !== id)
    const updated = { ...blogData, posts }
    const res = await updateSection('blog', updated)
    if (res.success) {
      toast({ title: 'Post deleted' })
    }
  }

  const handleTogglePublish = async (id: string) => {
    const posts = (blogData.posts || []).map((p) =>
      p.id === id ? { ...p, published: !p.published } : p
    )
    const updated = { ...blogData, posts }
    const res = await updateSection('blog', updated)
    if (res.success) {
      toast({ title: 'Publication state updated' })
    }
  }

  const filteredPosts = (blogData.posts || []).filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <ContentHeader
        title="Blog Collection"
        description="Manage technical writing, thought leadership articles, categories, and published status."
        badge={`${blogData.posts?.length || 0} Articles`}
        saving={saving}
        lastSaved={lastSaved}
        liveRoute="/blog"
      >
        <Button onClick={handleOpenNewPost} size="sm" className="gap-1.5 text-xs font-semibold">
          <Plus className="size-3.5" />
          <span>New Article</span>
        </Button>
      </ContentHeader>

      {/* Section Meta Settings */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Section Header Settings</CardTitle>
          <CardDescription className="text-xs">Labels displayed above the blog post grid.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Section Label</Label>
              <Input
                value={blogData.sectionLabel}
                onChange={(e) => updateSection('blog', { ...blogData, sectionLabel: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Section Title</Label>
              <Input
                value={blogData.title}
                onChange={(e) => updateSection('blog', { ...blogData, title: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Subtitle</Label>
              <Input
                value={blogData.subtitle}
                onChange={(e) => updateSection('blog', { ...blogData, subtitle: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Input
            placeholder="Search articles by title, excerpt, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md h-9 text-xs"
          />
          <span className="text-xs text-muted-foreground">{filteredPosts.length} of {blogData.posts?.length || 0} posts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="border-border/80 bg-card/60 flex flex-col justify-between hover:border-primary/40 transition-colors">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {post.category}
                    </Badge>
                    <Badge className={`text-[10px] ${post.published ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-muted text-muted-foreground'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`size-7 ${post.published ? 'text-emerald-500' : 'text-muted-foreground'}`}
                      onClick={() => handleTogglePublish(post.id)}
                      title={post.published ? 'Unpublish' : 'Publish'}
                    >
                      {post.published ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleEditPost(post)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-2 text-base font-bold text-foreground">{post.title}</CardTitle>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {post.readTime}
                  </span>
                </div>
                <CardDescription className="text-xs line-clamp-2 mt-1.5">{post.excerpt}</CardDescription>
              </CardHeader>
              {post.coverImage && (
                <CardContent className="p-4 pt-1">
                  <div className="relative h-28 w-full overflow-hidden rounded-lg border border-border bg-muted/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Add / Edit Post Dialog */}
      {editingPost && (
        <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
          <DialogContent className="w-[75vw] max-w-6xl" onClose={() => setIsPostDialogOpen(false)}>
            <DialogHeader>
              <DialogTitle>{editingPost.title ? `Edit Article` : 'Create New Article'}</DialogTitle>
              <DialogDescription>Write full Markdown or rich text, metadata, and publication status.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Post Title *</Label>
                  {editingPost.title && (
                    <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                      <span>URL:</span>
                      <span className="font-bold text-primary">/blog/{slugify(editingPost.title)}</span>
                    </span>
                  )}
                </div>
                <Input
                  value={editingPost.title}
                  onChange={(e) => {
                    const title = e.target.value
                    const slug = slugify(title)
                    setEditingPost({
                      ...editingPost,
                      title,
                      slug
                    })
                  }}
                  placeholder="e.g. Building Real-time Distributed Systems with Next.js and Convex"
                  className="mt-1 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Category</Label>
                  <Input
                    value={editingPost.category}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    placeholder="Engineering, Architecture, Design"
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Read Time</Label>
                  <Input
                    value={editingPost.readTime}
                    onChange={(e) => setEditingPost({ ...editingPost, readTime: e.target.value })}
                    placeholder="e.g. 6 min read"
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Excerpt</Label>
                <Textarea
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  placeholder="Brief synopsis shown on cards and search engine results..."
                  className="mt-1 text-sm"
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="publish-switch"
                  checked={editingPost.published}
                  onCheckedChange={(checked) => setEditingPost({ ...editingPost, published: checked })}
                />
                <Label htmlFor="publish-switch" className="text-xs cursor-pointer">
                  Published and visible to public readers
                </Label>
              </div>

              <div>
                <Label className="text-xs mb-1 block">Cover Image</Label>
                <ImageUploader
                  value={editingPost.coverImage || ''}
                  onChange={(url) => setEditingPost({ ...editingPost, coverImage: url })}
                  placeholder="Upload or paste cover image URL"
                />
              </div>

              {/* Rich Text Editor */}
              <div>
                <Label className="text-xs mb-1 block">Article Body Content (Markdown / Rich Text)</Label>
                <RichTextEditor
                  value={editingPost.content || ''}
                  onChange={(val) => setEditingPost({ ...editingPost, content: val })}
                  placeholder="Write your article content with code blocks, headings, callouts..."
                />
              </div>

              {/* Dedicated SEO & Social Sharing Section */}
              <CollectionSeoSection
                seo={editingPost.seo}
                onChange={(seo) => setEditingPost({ ...editingPost, seo })}
                defaultTitle={editingPost.title}
                defaultDescription={editingPost.excerpt || editingPost.content}
                defaultImage={editingPost.coverImage}
                defaultKeywords={editingPost.category ? `${editingPost.category}, Tech Blog, Web Engineering` : 'Tech Blog, Web Engineering'}
                itemPath={`/blog/${editingPost.slug || editingPost.id}`}
                itemType="article"
                siteName="Victor Maina"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPostDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSavePost}>Save Article</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
