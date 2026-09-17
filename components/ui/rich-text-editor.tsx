'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Subscript,
  Superscript,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Link as LinkIcon,
  Unlink,
  Minus,
  Eye,
  Edit3,
  Code2,
  Maximize2,
  Minimize2,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table as TableIcon,
  X,
  Sparkles,
  LayoutTemplate,
  Info,
  RemoveFormatting,
  Palette
} from 'lucide-react'
import { YoutubeIcon } from './icons'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { ImageUploader } from './image-uploader'
import { RichTextRenderer } from './rich-text-renderer'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value?: string
  onChange: (val: string) => void
  label?: string
  placeholder?: string
  minHeight?: string
  className?: string
}

// Convert legacy Markdown strings to clean visual HTML for backward compatibility
export function convertMarkdownToHtml(md: string): string {
  if (!md) return ''
  // If content already contains HTML tags like <p>, <h2>, <div>, return as is
  if (/<(p|h[1-6]|div|ul|ol|table|blockquote|figure|pre|br)\b[^>]*>/i.test(md)) {
    return md
  }

  let html = md

  // YouTube tags :::youtube[id]:::
  html = html.replace(/:::youtube\[([a-zA-Z0-9_-]+)\]:::/g, (_, id) => {
    return `<div class="youtube-embed my-6 aspect-video rounded-2xl overflow-hidden border border-primary/20 shadow-xl"><iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0" title="YouTube Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full border-0"></iframe></div>`
  })

  // Callouts :::callout[type] text :::
  html = html.replace(/:::callout\[(\w+)\]\s*([\s\S]*?)\s*:::/g, (_, type, content) => {
    const isWarning = type === 'warning'
    const isTip = type === 'tip'
    const isDanger = type === 'danger'
    const bgClass = isWarning
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200'
      : isTip
        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
        : isDanger
          ? 'border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-200'
          : 'border-primary/30 bg-primary/10 text-primary dark:text-primary-foreground'
    const title = isWarning ? 'Warning' : isTip ? 'Pro Tip' : isDanger ? 'Caution' : 'Note'
    return `<div class="callout callout-${type} my-6 p-4 rounded-2xl border ${bgClass} flex gap-3 items-start"><div><strong class="block text-sm font-semibold mb-1">${title}</strong><p class="text-xs leading-relaxed m-0">${content}</p></div></div>`
  })

  // Code blocks ```lang\ncode\n```
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (_, lang, code) => {
    const escapedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return `<pre class="my-6 p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-border"><code class="language-${lang || 'plaintext'}">${escapedCode}</code></pre>`
  })

  // Images ![alt](url)
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (_, alt, url) => {
    return `<figure class="my-6 text-center"><img src="${url}" alt="${alt || 'Article Image'}" class="rounded-2xl border border-border max-w-full inline-block shadow-md max-h-[500px] object-cover" />${alt ? `<figcaption class="text-center font-mono text-[11px] text-muted-foreground mt-2">${alt}</figcaption>` : ''}</figure>`
  })

  // Headings - explicitly rendered with bold styling
  html = html.replace(/^#### (.*$)/gim, '<h4 class="text-lg font-bold text-foreground mt-6 mb-2">$1</h4>')
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-foreground mt-6 mb-2">$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-extrabold text-foreground mt-8 mb-3 border-b border-border/50 pb-2">$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-black text-foreground mt-10 mb-4">$1</h1>')

  // Blockquotes
  html = html.replace(/^>\s*(.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground font-serif">$1</blockquote>')

  // Bold, Italic, Inline Code, Links
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/g, '<code class="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary">$1</code>')
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary font-semibold underline underline-offset-4 hover:opacity-80">$1</a>')

  // Unordered list items
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-5 list-disc text-sm text-muted-foreground my-1">$1</li>')
  html = html.replace(/(<li class="ml-5 list-disc[\s\S]*?<\/li>)/g, '<ul class="my-4">$1</ul>')

  // Paragraphs
  const blocks = html.split(/\n{2,}/)
  html = blocks.map(b => {
    const trimmed = b.trim()
    if (!trimmed) return ''
    if (/^<(h[1-6]|div|pre|blockquote|ul|ol|figure|table)/i.test(trimmed)) return trimmed
    return `<p class="my-4 text-sm sm:text-base text-muted-foreground leading-relaxed">${trimmed.replace(/\n/g, '<br />')}</p>`
  }).join('')

  return html
}

function extractYouTubeId(url: string): string | null {
  const customTagMatch = url.match(/:::youtube\[([a-zA-Z0-9_-]+)\]:::/)
  if (customTagMatch) return customTagMatch[1]
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

export const PREBUILT_TEMPLATES = [
  {
    id: 'case-study',
    title: 'Project Case Study',
    description: 'Problem statement, technical architecture, and measurable client results.',
    badge: 'Projects',
    html: `<h2 class="font-extrabold text-2xl text-foreground">1. Problem &amp; Business Objective</h2>
<p>Explain the core challenge the client was facing and what the business required to achieve rapid growth.</p>
<h2 class="font-extrabold text-2xl text-foreground">2. Architecture &amp; Solution</h2>
<p>Describe the technological foundation, tools chosen, and core engineering decisions behind the project.</p>
<ul>
  <li><strong>Frontend</strong>: Next.js App Router, TypeScript, and Tailwind CSS.</li>
  <li><strong>Backend &amp; State</strong>: Convex reactive database, real-time sync, and edge caching.</li>
  <li><strong>Auth &amp; Storage</strong>: Secure session management and cloud asset storage.</li>
</ul>
<h2 class="font-extrabold text-2xl text-foreground">3. Key Results &amp; Metrics</h2>
<ul>
  <li><strong>Performance Score</strong>: 98+ Google Lighthouse rating.</li>
  <li><strong>User Engagement</strong>: +35% increase in conversion post-launch.</li>
</ul>
<div class="callout callout-tip my-6 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 flex gap-3 items-start">
  <div><strong class="block text-sm font-semibold mb-1">Pro Tip</strong><p class="text-xs leading-relaxed m-0">Full test coverage and continuous deployment automated with GitHub Actions.</p></div>
</div>`
  },
  {
    id: 'service-offering',
    title: 'Service Scope & Deliverables',
    description: 'Overview, detailed deliverables, development milestones, and prerequisites.',
    badge: 'Services',
    html: `<h2 class="font-extrabold text-2xl text-foreground">Service Overview</h2>
<p>A tailored full-stack engineering solution built for rapid execution, high performance, and obsessive visual polish.</p>
<h3 class="font-bold text-xl text-foreground">What Is Included</h3>
<ul>
  <li><strong>Discovery &amp; Requirements</strong>: Comprehensive architecture audit and technical specification.</li>
  <li><strong>Core Engineering</strong>: Clean, scalable TypeScript code adhering to modern web standards.</li>
  <li><strong>Responsive Optimization</strong>: Flawless experience across mobile, tablet, and desktop screens.</li>
  <li><strong>Handoff &amp; Documentation</strong>: Codebase walkthrough, documentation, and launch guidance.</li>
</ul>
<h3 class="font-bold text-xl text-foreground">Process &amp; Timeline</h3>
<ol>
  <li><strong>Phase 1</strong>: Interactive wireframes and schema design.</li>
  <li><strong>Phase 2</strong>: Full-stack development and API integration.</li>
  <li><strong>Phase 3</strong>: QA testing, performance audit, and production launch.</li>
</ol>
<div class="callout callout-info my-6 p-4 rounded-2xl border border-primary/30 bg-primary/10 text-primary flex gap-3 items-start">
  <div><strong class="block text-sm font-semibold mb-1">Note</strong><p class="text-xs leading-relaxed m-0">Includes 14 days of dedicated post-launch support and maintenance at zero additional cost.</p></div>
</div>`
  },
  {
    id: 'starter-kit',
    title: 'Starter Kit / Product Showcase',
    description: 'Features breakdown, tech stack highlights, installation guide, and code snippets.',
    badge: 'Templates',
    html: `<h2 class="font-extrabold text-2xl text-foreground">Product Highlights</h2>
<p>Everything required to launch a modern production application with zero friction.</p>
<h3 class="font-bold text-xl text-foreground">Core Capabilities</h3>
<ul>
  <li><strong>Zero Config Setup</strong>: Clone and deploy to production in under 5 minutes.</li>
  <li><strong>End-to-End Type Safety</strong>: Full TypeScript integration from database schemas to UI props.</li>
  <li><strong>Adaptive Dark Mode</strong>: Curated color system supporting system preferences out of the box.</li>
</ul>
<pre class="my-6 p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-border"><code class="language-bash"># 1. Clone repository
git clone https://github.com/example/starter-kit.git

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev</code></pre>`
  }
]

export function RichTextEditor({
  value = '',
  onChange,
  label = 'Article Body Content',
  placeholder = 'Start writing your content here with rich formatting...',
  minHeight = '380px',
  className,
}: RichTextEditorProps) {
  const [mode, setMode] = useState<'edit' | 'source' | 'preview'>('edit')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Modals
  const [showImageModal, setShowImageModal] = useState(false)
  const [showYoutubeModal, setShowYoutubeModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showTableModal, setShowTableModal] = useState(false)
  const [showCalloutModal, setShowCalloutModal] = useState(false)
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Media & Dialog inputs
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [imageCaption, setImageCaption] = useState('')
  const [imageAlign, setImageAlign] = useState<'center' | 'left' | 'right'>('center')

  const [youtubeInput, setYoutubeInput] = useState('')
  const [youtubeError, setYoutubeError] = useState('')

  // Simple Link modal state: destination URL only!
  const [linkUrl, setLinkUrl] = useState('')
  const [linkNewTab, setLinkNewTab] = useState(true)

  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)
  const [tableHeader, setTableHeader] = useState(true)

  const [calloutType, setCalloutType] = useState<'info' | 'tip' | 'warning' | 'danger'>('info')
  const [calloutTitle, setCalloutTitle] = useState('Important Note')
  const [calloutText, setCalloutText] = useState('')

  const editorRef = useRef<HTMLDivElement>(null)
  const savedSelectionRef = useRef<Range | null>(null)

  // Undo / Redo history
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const isInternalChangeRef = useRef(false)

  // Initialize visual editor content once mounted or when switching view modes
  useEffect(() => {
    if (editorRef.current && mode === 'edit') {
      const currentHtml = editorRef.current.innerHTML
      const targetHtml = convertMarkdownToHtml(value)
      if (currentHtml !== targetHtml && !isInternalChangeRef.current) {
        editorRef.current.innerHTML = targetHtml || ''
      }
    }
    isInternalChangeRef.current = false
  }, [value, mode])

  // Save selection before modal opens
  const saveSelection = () => {
    if (typeof window === 'undefined') return
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange()
    }
  }

  // Restore selection when modal closes or action finishes
  const restoreSelection = () => {
    if (typeof window === 'undefined' || !savedSelectionRef.current) return
    const sel = window.getSelection()
    if (sel) {
      sel.removeAllRanges()
      sel.addRange(savedSelectionRef.current)
    }
  }

  // Handle changes in contentEditable
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return
    const html = editorRef.current.innerHTML
    isInternalChangeRef.current = true
    onChange(html)

    // Push to history
    setHistory((prev) => {
      const next = prev.slice(0, historyIdx + 1)
      next.push(html)
      return next.slice(-40)
    })
    setHistoryIdx((prev) => Math.min(prev + 1, 39))
  }, [onChange, historyIdx])

  // Execute standard document command
  const execCmd = (cmd: string, val: string = '') => {
    if (mode !== 'edit' || !editorRef.current) return
    editorRef.current.focus()
    document.execCommand(cmd, false, val)
    handleContentChange()
  }

  // Format block heading (H1, H2, H3, H4, P)
  const formatHeading = (tag: string) => {
    execCmd('formatBlock', tag)
  }

  // Insert raw HTML element snippet into cursor position
  const insertHtmlAtCursor = (htmlSnippet: string) => {
    if (mode !== 'edit' || !editorRef.current) return
    editorRef.current.focus()
    restoreSelection()
    document.execCommand('insertHTML', false, htmlSnippet)
    handleContentChange()
  }

  // Undo / Redo handlers
  const handleUndo = () => {
    if (historyIdx > 0) {
      const prevHtml = history[historyIdx - 1]
      setHistoryIdx(historyIdx - 1)
      if (editorRef.current) {
        editorRef.current.innerHTML = prevHtml
      }
      isInternalChangeRef.current = true
      onChange(prevHtml)
    }
  }

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const nextHtml = history[historyIdx + 1]
      setHistoryIdx(historyIdx + 1)
      if (editorRef.current) {
        editorRef.current.innerHTML = nextHtml
      }
      isInternalChangeRef.current = true
      onChange(nextHtml)
    }
  }

  // Clean HTML handling on paste
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const html = e.clipboardData.getData('text/html')
    const text = e.clipboardData.getData('text/plain')

    if (html) {
      let clean = html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/class="Mso[^"]*"/gi, '')
        .replace(/style="[^"]*mso-[^"]*"/gi, '')
        .replace(/<meta[^>]*>/gi, '')

      document.execCommand('insertHTML', false, clean)
    } else if (text) {
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br />')
      document.execCommand('insertHTML', false, escaped)
    }
    handleContentChange()
  }

  // Media Insertion Handlers
  const handleInsertImage = () => {
    if (!uploadedImageUrl) return
    const altText = imageAlt.trim() || imageCaption.trim() || 'Uploaded Image'
    const captionText = imageCaption.trim()

    let alignClass = 'text-center'
    if (imageAlign === 'left') alignClass = 'text-left float-left mr-4 mb-4 max-w-[50%]'
    if (imageAlign === 'right') alignClass = 'text-right float-right ml-4 mb-4 max-w-[50%]'

    const snippet = `<figure class="my-6 ${alignClass}"><img src="${uploadedImageUrl}" alt="${altText}" class="rounded-2xl border border-border max-w-full inline-block shadow-lg max-h-[550px] object-cover" />${captionText ? `<figcaption class="text-center font-mono text-xs text-muted-foreground mt-2">${captionText}</figcaption>` : ''}</figure><p><br /></p>`

    insertHtmlAtCursor(snippet)
    setUploadedImageUrl('')
    setImageAlt('')
    setImageCaption('')
    setShowImageModal(false)
  }

  const handleInsertYoutube = () => {
    const id = extractYouTubeId(youtubeInput.trim())
    if (!id) {
      setYoutubeError('Please enter a valid YouTube video URL or ID')
      return
    }

    const snippet = `<div class="youtube-embed my-6 aspect-video rounded-2xl overflow-hidden border border-primary/20 shadow-2xl"><iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0" title="YouTube Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full border-0"></iframe></div><p><br /></p>`

    insertHtmlAtCursor(snippet)
    setYoutubeInput('')
    setYoutubeError('')
    setShowYoutubeModal(false)
  }

  // Userfriendly link handler: destination URL only!
  const handleInsertLink = () => {
    if (!linkUrl.trim()) return
    const url = linkUrl.trim()
    const targetAttr = linkNewTab ? 'target="_blank" rel="noopener noreferrer"' : ''

    if (mode === 'edit' && editorRef.current) {
      editorRef.current.focus()
      restoreSelection()
      const sel = window.getSelection()
      const selectedText = sel ? sel.toString() : ''

      if (selectedText) {
        document.execCommand('createLink', false, url)
      } else {
        const snippet = `<a href="${url}" ${targetAttr} class="text-primary font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity">${url}</a>`
        document.execCommand('insertHTML', false, snippet)
      }
      handleContentChange()
    }

    setLinkUrl('')
    setShowLinkModal(false)
  }

  const handleUnlink = () => {
    execCmd('unlink')
  }

  const handleInsertTable = () => {
    let rowsHtml = ''
    if (tableHeader) {
      let headerCells = ''
      for (let c = 0; c < tableCols; c++) {
        headerCells += `<th class="border border-border bg-muted/80 p-2.5 text-left text-xs font-bold text-foreground">Header ${c + 1}</th>`
      }
      rowsHtml += `<thead><tr>${headerCells}</tr></thead>`
    }

    let bodyRows = ''
    for (let r = 0; r < tableRows; r++) {
      let cells = ''
      for (let c = 0; c < tableCols; c++) {
        cells += `<td class="border border-border p-2.5 text-xs text-muted-foreground">Cell data</td>`
      }
      bodyRows += `<tr>${cells}</tr>`
    }
    rowsHtml += `<tbody>${bodyRows}</tbody>`

    const tableSnippet = `<div class="my-6 overflow-x-auto rounded-2xl border border-border shadow-sm"><table class="w-full border-collapse text-sm">${rowsHtml}</table></div><p><br /></p>`
    insertHtmlAtCursor(tableSnippet)
    setShowTableModal(false)
  }

  const handleInsertCallout = () => {
    const isWarning = calloutType === 'warning'
    const isTip = calloutType === 'tip'
    const isDanger = calloutType === 'danger'

    const bgClass = isWarning
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200'
      : isTip
        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
        : isDanger
          ? 'border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-200'
          : 'border-primary/30 bg-primary/10 text-primary dark:text-primary-foreground'

    const defaultTitle = isWarning ? 'Warning' : isTip ? 'Pro Tip' : isDanger ? 'Caution' : 'Note'
    const title = calloutTitle.trim() || defaultTitle
    const text = calloutText.trim() || 'Enter callout explanation text here...'

    const snippet = `<div class="callout callout-${calloutType} my-6 p-4 rounded-2xl border ${bgClass} flex gap-3 items-start"><div><strong class="block text-sm font-semibold mb-1">${title}</strong><p class="text-xs leading-relaxed m-0">${text}</p></div></div><p><br /></p>`

    insertHtmlAtCursor(snippet)
    setCalloutText('')
    setShowCalloutModal(false)
  }

  // Word & character stats
  const plainText = (value || '').replace(/<[^>]+>/g, '').trim()
  const wordCount = plainText ? plainText.split(/\s+/).length : 0
  const charCount = plainText.length
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div
      className={cn(
        'space-y-2 transition-all',
        isFullscreen ? 'fixed inset-0 z-50 p-4 sm:p-8 bg-background/95 backdrop-blur-md overflow-y-auto' : '',
        className
      )}
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {label && (
          <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            {label}
          </label>
        )}
        <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground ml-auto">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} chars</span>
          <span>•</span>
          <span className="text-primary font-semibold">{readTimeMinutes} min read</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all">
        {/* Toolbar Header */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-border bg-muted/40 p-2">
          {/* Left formatting action tools */}
          <div className="flex flex-wrap items-center gap-1">
            {/* Undo / Redo */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleUndo}
              disabled={historyIdx <= 0}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleRedo}
              disabled={historyIdx >= history.length - 1}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="size-3.5" />
            </Button>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Direct Heading / Title Buttons with BOLD visual labels */}
            <div className="flex items-center gap-0.5 bg-background/80 rounded-lg p-0.5 border border-border">
              <button
                type="button"
                onClick={() => formatHeading('h1')}
                className="h-7 px-2 text-xs font-black tracking-tight text-foreground hover:bg-primary/20 hover:text-primary rounded transition-colors"
                title="Heading 1 (Main Bold Title)"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => formatHeading('h2')}
                className="h-7 px-2 text-xs font-extrabold tracking-tight text-foreground hover:bg-primary/20 hover:text-primary rounded transition-colors"
                title="Heading 2 (Bold Title)"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => formatHeading('h3')}
                className="h-7 px-2 text-xs font-bold text-foreground hover:bg-primary/20 hover:text-primary rounded transition-colors"
                title="Heading 3 (Section Subtitle)"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => formatHeading('h4')}
                className="h-7 px-2 text-xs font-semibold text-foreground hover:bg-primary/20 hover:text-primary rounded transition-colors"
                title="Heading 4 (Sub-heading)"
              >
                H4
              </button>
              <button
                type="button"
                onClick={() => formatHeading('p')}
                className="h-7 px-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded transition-colors"
                title="Paragraph Body Text"
              >
                Body
              </button>
            </div>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Inline Formatting: Bold, Italic, Underline, Strikethrough */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 font-bold"
              onClick={() => execCmd('bold')}
              title="Bold (Ctrl+B)"
            >
              <Bold className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 italic"
              onClick={() => execCmd('italic')}
              title="Italic (Ctrl+I)"
            >
              <Italic className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 underline"
              onClick={() => execCmd('underline')}
              title="Underline (Ctrl+U)"
            >
              <Underline className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 line-through"
              onClick={() => execCmd('strikeThrough')}
              title="Strikethrough"
            >
              <Strikethrough className="size-3.5" />
            </Button>

            {/* Text Colors */}
            <div className="relative inline-block">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-primary"
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Text Colors & Highlights"
              >
                <Palette className="size-3.5" />
              </Button>
              {showColorPicker && (
                <div className="absolute left-0 top-9 z-50 flex gap-1 rounded-xl border border-border bg-background p-2 shadow-xl">
                  {[
                    { color: '#ffffff', label: 'White' },
                    { color: '#3b82f6', label: 'Blue' },
                    { color: '#10b981', label: 'Emerald' },
                    { color: '#f59e0b', label: 'Amber' },
                    { color: '#ef4444', label: 'Red' },
                    { color: '#a855f7', label: 'Purple' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => {
                        execCmd('foreColor', c.color)
                        setShowColorPicker(false)
                      }}
                      className="size-5 rounded-full border border-border transition-transform hover:scale-110"
                      style={{ backgroundColor: c.color }}
                      title={`Text color: ${c.label}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 font-mono text-xs"
              onClick={() => insertHtmlAtCursor('<code class="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary">Inline code</code>')}
              title="Inline Code"
            >
              <Code className="size-3.5" />
            </Button>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Alignment */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => execCmd('justifyLeft')}
              title="Align Left"
            >
              <AlignLeft className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => execCmd('justifyCenter')}
              title="Align Center"
            >
              <AlignCenter className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => execCmd('justifyRight')}
              title="Align Right"
            >
              <AlignRight className="size-3.5" />
            </Button>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Lists */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => execCmd('insertUnorderedList')}
              title="Bullet List"
            >
              <List className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => execCmd('insertOrderedList')}
              title="Numbered List"
            >
              <ListOrdered className="size-3.5" />
            </Button>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Media & Embed Modals */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold bg-background"
              onClick={() => {
                saveSelection()
                setShowImageModal(true)
              }}
              title="Insert Image (Convex Storage Upload)"
            >
              <ImageIcon className="size-3.5 mr-1 text-primary" /> Image
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold bg-background text-red-500 hover:text-red-600"
              onClick={() => {
                saveSelection()
                setShowYoutubeModal(true)
              }}
              title="Embed YouTube Video"
            >
              <YoutubeIcon className="size-3.5 mr-1" /> Video
            </Button>

            {/* Simple Link Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-primary"
              onClick={() => {
                saveSelection()
                setShowLinkModal(true)
              }}
              title="Insert Link URL"
            >
              <LinkIcon className="size-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleUnlink}
              title="Remove Link"
            >
              <Unlink className="size-3.5 text-muted-foreground" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                saveSelection()
                setShowTableModal(true)
              }}
              title="Insert HTML Table"
            >
              <TableIcon className="size-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-primary"
              onClick={() => {
                saveSelection()
                setShowCalloutModal(true)
              }}
              title="Insert Callout Alert Banner"
            >
              <Info className="size-3.5 mr-1" /> Callout
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => insertHtmlAtCursor('<hr class="my-8 border-border" /><p><br /></p>')}
              title="Horizontal Divider Line"
            >
              <Minus className="size-3.5" />
            </Button>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Templates */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
              onClick={() => setShowTemplatesModal(true)}
              title="Insert Prebuilt Layout Templates"
            >
              <LayoutTemplate className="size-3.5 mr-1 text-primary" /> Templates
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => execCmd('removeFormat')}
              title="Clear Formatting"
            >
              <RemoveFormatting className="size-3.5" />
            </Button>
          </div>

          {/* Right Mode Switcher & Fullscreen */}
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="flex items-center rounded-xl bg-background border border-border p-0.5">
              <button
                type="button"
                onClick={() => setMode('edit')}
                className={cn(
                  'flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                  mode === 'edit'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Visual WYSIWYG Mode"
              >
                <Edit3 className="size-3" /> Visual
              </button>

              <button
                type="button"
                onClick={() => setMode('source')}
                className={cn(
                  'flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                  mode === 'source'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Direct HTML Source Code Editor"
              >
                <Code2 className="size-3" /> HTML Source
              </button>

              <button
                type="button"
                onClick={() => setMode('preview')}
                className={cn(
                  'flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                  mode === 'preview'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Reader Live Preview"
              >
                <Eye className="size-3" /> Preview
              </button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Distraction Free'}
            >
              {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            </Button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="relative">
          {/* Mode 1: Visual WYSIWYG ContentEditable Surface - Headings are VERY BOLD */}
          {mode === 'edit' && (
            <div
              ref={editorRef}
              contentEditable
              onInput={handleContentChange}
              onPaste={handlePaste}
              style={{ minHeight }}
              className="w-full resize-y bg-background p-6 text-sm leading-relaxed text-foreground outline-none focus:ring-1 focus:ring-primary overflow-y-auto [&_h1]:text-3xl [&_h1]:sm:text-4xl [&_h1]:font-black [&_h1]:text-foreground [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:tracking-tight [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-extrabold [&_h2]:text-foreground [&_h2]:mt-5 [&_h2]:mb-2.5 [&_h2]:tracking-tight [&_h2]:border-b [&_h2]:border-border/50 [&_h2]:pb-1.5 [&_h3]:text-xl [&_h3]:sm:text-2xl [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:tracking-tight [&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-foreground [&_h4]:mt-3 [&_h4]:mb-1.5 [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:my-3 [&_p]:leading-relaxed [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground [&_a]:text-primary [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3"
              data-placeholder={placeholder}
            />
          )}

          {/* Mode 2: HTML Source Code View */}
          {mode === 'source' && (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="<p>Write your raw HTML code here...</p>"
              style={{ minHeight }}
              className="w-full resize-y bg-slate-950 p-5 text-xs sm:text-sm font-mono leading-relaxed text-emerald-400 outline-none focus:ring-1 focus:ring-primary border-0"
            />
          )}

          {/* Mode 3: Live Reader Preview */}
          {mode === 'preview' && (
            <div style={{ minHeight }} className="p-6 bg-background/60 overflow-y-auto max-h-[650px]">
              {value ? (
                <RichTextRenderer content={value} />
              ) : (
                <p className="text-xs text-muted-foreground italic">Nothing to preview yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals & Dialogs ──────────────────────────────────────────────── */}

      {/* 1. Modal: Upload & Insert Image */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-base font-bold flex items-center gap-2">
                <ImageIcon className="size-4 text-primary" />
                Upload &amp; Insert Image
              </h4>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              <ImageUploader
                value={uploadedImageUrl}
                onChange={(url) => setUploadedImageUrl(url)}
                label="Select image file or paste URL"
                aspectRatio="auto"
              />

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Image Alt Text (SEO)</Label>
                <Input
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="e.g. Architecture diagram of microservices"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Image Caption (Optional)</Label>
                <Input
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="e.g. Figure 1. System workflow"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Alignment</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['center', 'left', 'right'] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setImageAlign(a)}
                      className={cn(
                        'rounded-xl border py-1.5 text-xs font-semibold capitalize transition-all',
                        imageAlign === a
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowImageModal(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!uploadedImageUrl}
                onClick={handleInsertImage}
                className="bg-primary text-primary-foreground font-semibold"
              >
                Insert into Article
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Embed YouTube Video */}
      {showYoutubeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-base font-bold flex items-center gap-2 text-red-500">
                <YoutubeIcon className="size-5" />
                Embed YouTube Video
              </h4>
              <button
                type="button"
                onClick={() => {
                  setShowYoutubeModal(false)
                  setYoutubeError('')
                }}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">YouTube Video URL or ID</Label>
                <Input
                  value={youtubeInput}
                  onChange={(e) => {
                    setYoutubeInput(e.target.value)
                    setYoutubeError('')
                  }}
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  className="text-xs font-mono"
                />
                {youtubeError && <p className="text-[11px] text-destructive">{youtubeError}</p>}
                <p className="text-[11px] text-muted-foreground">
                  Paste any normal YouTube link or share URL. It will be embedded as a responsive video frame.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowYoutubeModal(false)
                  setYoutubeError('')
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!youtubeInput.trim()}
                onClick={handleInsertYoutube}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold"
              >
                Embed Video
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Streamlined Link Modal: Just Destination URL! */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-base font-bold flex items-center gap-2">
                <LinkIcon className="size-4 text-primary" />
                Insert Hyperlink
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Destination URL</Label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="text-xs font-mono"
                  autoFocus
                />
                <p className="text-[11px] text-muted-foreground">
                  If text is highlighted in your editor, it will be linked directly to this URL.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="link-new-tab"
                  checked={linkNewTab}
                  onChange={(e) => setLinkNewTab(e.target.checked)}
                  className="rounded border-border"
                />
                <Label htmlFor="link-new-tab" className="text-xs cursor-pointer">
                  Open link in new tab
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowLinkModal(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!linkUrl.trim()}
                onClick={handleInsertLink}
                className="bg-primary text-primary-foreground font-semibold"
              >
                Insert Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Insert HTML Table */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-base font-bold flex items-center gap-2">
                <TableIcon className="size-4 text-primary" />
                Insert Data Table
              </h4>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Rows</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Columns</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="table-header"
                checked={tableHeader}
                onChange={(e) => setTableHeader(e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="table-header" className="text-xs cursor-pointer">
                Include header row
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowTableModal(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleInsertTable} className="bg-primary font-semibold">
                Insert Table
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: Callout Alert Banner */}
      {showCalloutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-base font-bold flex items-center gap-2">
                <Info className="size-4 text-primary" />
                Insert Callout Alert Banner
              </h4>
              <button
                type="button"
                onClick={() => setShowCalloutModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Callout Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'info', label: 'Info (Primary)' },
                    { type: 'tip', label: 'Pro Tip (Emerald)' },
                    { type: 'warning', label: 'Warning (Amber)' },
                    { type: 'danger', label: 'Caution (Red)' },
                  ].map((c) => (
                    <button
                      key={c.type}
                      type="button"
                      onClick={() => {
                        setCalloutType(c.type as any)
                        if (c.type === 'tip') setCalloutTitle('Pro Tip')
                        else if (c.type === 'warning') setCalloutTitle('Warning')
                        else if (c.type === 'danger') setCalloutTitle('Caution')
                        else setCalloutTitle('Note')
                      }}
                      className={cn(
                        'rounded-xl border p-2 text-xs font-semibold transition-all text-left',
                        calloutType === c.type
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Title</Label>
                <Input
                  value={calloutTitle}
                  onChange={(e) => setCalloutTitle(e.target.value)}
                  placeholder="e.g. Important Notice"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Message</Label>
                <Input
                  value={calloutText}
                  onChange={(e) => setCalloutText(e.target.value)}
                  placeholder="Explain details here..."
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCalloutModal(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleInsertCallout} className="bg-primary font-semibold">
                Insert Callout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: Pre-Built Formatting Templates */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-background p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h4 className="text-base font-bold flex items-center gap-2 text-foreground">
                  <LayoutTemplate className="size-4 text-primary" />
                  Rich Content Templates
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Insert professionally designed rich HTML layouts directly into your editor.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {PREBUILT_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary font-mono">
                      {tmpl.badge}
                    </span>
                    <h5 className="mt-2 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {tmpl.title}
                    </h5>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs rounded-xl"
                      onClick={() => {
                        insertHtmlAtCursor(tmpl.html)
                        setShowTemplatesModal(false)
                      }}
                    >
                      Append to Body
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="flex-1 text-xs rounded-xl bg-primary font-semibold"
                      onClick={() => {
                        if (!value.trim() || window.confirm('Replace current editor content with this template?')) {
                          onChange(tmpl.html)
                          setShowTemplatesModal(false)
                        }
                      }}
                    >
                      Use Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowTemplatesModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
