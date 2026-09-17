'use client'

import React, { useState } from 'react'
import { Copy, Check, Play, ExternalLink, Info, AlertTriangle, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextRendererProps {
  content?: string
  className?: string
}

// Helper to extract YouTube video ID from various URL formats
function getYouTubeId(urlOrTag: string): string | null {
  const customTagMatch = urlOrTag.match(/:::youtube\[([a-zA-Z0-9_-]+)\]:::/)
  if (customTagMatch) return customTagMatch[1]

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = urlOrTag.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-6 overflow-hidden rounded-2xl border border-border/80 bg-muted/40 backdrop-blur-md shadow-md">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/70 px-4 py-2 text-xs font-mono text-muted-foreground">
        <span className="uppercase text-[11px] font-semibold text-primary">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] hover:bg-background hover:text-foreground transition-colors"
        >
          {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs font-mono leading-relaxed text-foreground/90">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="my-8 overflow-hidden rounded-3xl border border-primary/20 bg-card p-2 shadow-2xl">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
          title="YouTube Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="size-full border-0"
        />
      </div>
    </div>
  )
}

export function RichTextRenderer({ content = '', className }: RichTextRendererProps) {
  if (!content) return null

  // Check if content is HTML (produced by visual WYSIWYG editor)
  const isHtml = /<(p|h[1-6]|div|ul|ol|table|blockquote|figure|pre|iframe|span|a|br)\b[^>]*>/i.test(content)

  if (isHtml) {
    return (
      <div
        className={cn(
          'prose-custom prose prose-neutral dark:prose-invert max-w-none space-y-4 text-foreground leading-relaxed',
          '[&_h1]:text-3xl [&_h1]:sm:text-4xl [&_h1]:font-black [&_h1]:tracking-tight [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-foreground',
          '[&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-border/50 [&_h2]:pb-2 [&_h2]:text-foreground',
          '[&_h3]:text-xl [&_h3]:sm:text-2xl [&_h3]:font-bold [&_h3]:tracking-tight [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-foreground',
          '[&_h4]:text-lg [&_h4]:font-bold [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-foreground',
          '[&_p]:text-sm [&_p]:sm:text-base [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:my-3',
          '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1',
          '[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1',
          '[&_li]:text-sm [&_li]:text-muted-foreground',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:my-6 [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
          '[&_code]:rounded-md [&_code]:bg-primary/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:font-semibold [&_code]:text-primary',
          '[&_pre]:my-6 [&_pre]:p-4 [&_pre]:rounded-2xl [&_pre]:bg-slate-950 [&_pre]:text-slate-100 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-border',
          '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-slate-100',
          '[&_a]:text-primary [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:opacity-80',
          '[&_table]:w-full [&_table]:my-6 [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_table]:rounded-2xl [&_table]:overflow-hidden',
          '[&_th]:border [&_th]:border-border [&_th]:bg-muted/80 [&_th]:p-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-bold [&_th]:text-foreground',
          '[&_td]:border [&_td]:border-border [&_td]:p-3 [&_td]:text-xs [&_td]:text-muted-foreground',
          '[&_figure]:my-6 [&_figure]:text-center',
          '[&_img]:rounded-2xl [&_img]:border [&_img]:border-border [&_img]:max-w-full [&_img]:inline-block [&_img]:shadow-md',
          '[&_figcaption]:text-center [&_figcaption]:font-mono [&_figcaption]:text-xs [&_figcaption]:text-muted-foreground [&_figcaption]:mt-2',
          className
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  // If content contains standard markdown, parse line-by-line / block-by-block
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []

  let inCodeBlock = false
  let codeBuffer: string[] = []
  let codeLang = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code block detection
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <CodeBlock
            key={`code-${i}`}
            code={codeBuffer.join('\n')}
            language={codeLang}
          />
        )
        inCodeBlock = false
        codeBuffer = []
        codeLang = ''
      } else {
        inCodeBlock = true
        codeLang = line.replace('```', '').trim()
      }
      continue
    }

    if (inCodeBlock) {
      codeBuffer.push(line)
      continue
    }

    // YouTube Custom Tag: :::youtube[ID]:::
    if (line.includes(':::youtube[')) {
      const videoId = getYouTubeId(line)
      if (videoId) {
        elements.push(<YouTubeEmbed key={`yt-${i}`} videoId={videoId} />)
        continue
      }
    }

    // Direct YouTube URL on its own line
    if (
      (line.startsWith('https://www.youtube.com') ||
        line.startsWith('https://youtube.com') ||
        line.startsWith('https://youtu.be')) &&
      !line.includes(' ')
    ) {
      const videoId = getYouTubeId(line)
      if (videoId) {
        elements.push(<YouTubeEmbed key={`yt-${i}`} videoId={videoId} />)
        continue
      }
    }

    // Callout Alert: :::callout[type] Text ::: or > [!NOTE]
    if (line.startsWith(':::callout') || line.startsWith('> [!NOTE]') || line.startsWith('> [!TIP]') || line.startsWith('> [!WARNING]')) {
      const isWarning = line.includes('warning') || line.includes('WARNING')
      const isTip = line.includes('tip') || line.includes('TIP')
      const alertText = line
        .replace(/^:::callout\[\w+\]\s*/, '')
        .replace(/^>\s*\[!\w+\]\s*/, '')
        .replace(/:::$/, '')

      elements.push(
        <div
          key={`callout-${i}`}
          className={cn(
            'my-6 flex gap-3 rounded-2xl border p-4 text-xs leading-relaxed',
            isWarning
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200'
              : isTip
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                : 'border-primary/30 bg-primary/10 text-primary dark:text-primary-foreground'
          )}
        >
          {isWarning ? (
            <AlertTriangle className="size-5 shrink-0 text-amber-500 mt-0.5" />
          ) : isTip ? (
            <Lightbulb className="size-5 shrink-0 text-emerald-500 mt-0.5" />
          ) : (
            <Info className="size-5 shrink-0 text-primary mt-0.5" />
          )}
          <div>
            <p className="font-semibold capitalize text-sm mb-0.5">
              {isWarning ? 'Warning' : isTip ? 'Pro Tip' : 'Note'}
            </p>
            <p>{alertText || lines[i + 1]}</p>
          </div>
        </div>
      )
      continue
    }

    // Blockquote
    if (line.startsWith('>')) {
      const quote = line.replace(/^>\s*/, '')
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-6 border-l-4 border-primary pl-4 py-1 italic text-muted-foreground text-sm leading-relaxed"
        >
          &quot;{quote}&quot;
        </blockquote>
      )
      continue
    }

    // Image: ![alt](url)
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/)
    if (imgMatch) {
      const alt = imgMatch[1]
      const url = imgMatch[2]
      elements.push(
        <figure key={`img-${i}`} className="my-8 space-y-2">
          <div className="overflow-hidden rounded-3xl border border-border bg-muted/40 shadow-lg">
            <img src={url} alt={alt || 'Article Image'} className="w-full object-cover max-h-[500px]" />
          </div>
          {alt && (
            <figcaption className="text-center font-mono text-[11px] text-muted-foreground">
              {alt}
            </figcaption>
          )}
        </figure>
      )
      continue
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="mt-10 mb-4 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {line.replace('# ', '')}
        </h1>
      )
      continue
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="mt-8 mb-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground border-b border-border/50 pb-2">
          {line.replace('## ', '')}
        </h2>
      )
      continue
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="mt-6 mb-2 text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
          {line.replace('### ', '')}
        </h3>
      )
      continue
    }

    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="mt-5 mb-2 text-lg font-semibold tracking-tight text-foreground">
          {line.replace('#### ', '')}
        </h4>
      )
      continue
    }

    // Horizontal Rule
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(<hr key={`hr-${i}`} className="my-8 border-border" />)
      continue
    }

    // Bullet List Item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={`li-${i}`} className="ml-5 list-disc text-sm text-muted-foreground leading-relaxed my-1">
          {formatInline(line.substring(2))}
        </li>
      )
      continue
    }

    // Numbered List Item
    const numMatch = line.match(/^(\d+)\.\s+(.*)/)
    if (numMatch) {
      elements.push(
        <li key={`num-${i}`} className="ml-5 list-decimal text-sm text-muted-foreground leading-relaxed my-1">
          {formatInline(numMatch[2])}
        </li>
      )
      continue
    }

    // Regular Paragraph
    if (line.trim()) {
      elements.push(
        <p key={`p-${i}`} className="my-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
          {formatInline(line)}
        </p>
      )
    }
  }

  return <div className={cn('prose-custom space-y-2', className)}>{elements}</div>
}

// Inline formatting parser (bold, italic, code, links)
function formatInline(text: string): React.ReactNode {
  // Parse links [label](url)
  const linkRegex = /\[(.*?)\]\((.*?)\)/g
  const parts: React.ReactNode[] = []
  let lastIdx = 0
  let match: RegExpExecArray | null

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(formatBasic(text.substring(lastIdx, match.index)))
    }
    const label = match[1]
    const url = match[2]
    parts.push(
      <a
        key={`link-${match.index}`}
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-primary font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity inline-flex items-center gap-0.5"
      >
        <span>{label}</span>
        <ExternalLink className="size-3 inline" />
      </a>
    )
    lastIdx = match.index + match[0].length
  }

  if (lastIdx < text.length) {
    parts.push(formatBasic(text.substring(lastIdx)))
  }

  return parts.length > 0 ? parts : text
}

function formatBasic(text: string): React.ReactNode {
  // Code `code`
  const codeRegex = /`([^`]+)`/g
  const parts: React.ReactNode[] = []
  let lastIdx = 0
  let match: RegExpExecArray | null

  while ((match = codeRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(formatBoldItalic(text.substring(lastIdx, match.index)))
    }
    parts.push(
      <code
        key={`code-${match.index}`}
        className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary"
      >
        {match[1]}
      </code>
    )
    lastIdx = match.index + match[0].length
  }

  if (lastIdx < text.length) {
    parts.push(formatBoldItalic(text.substring(lastIdx)))
  }

  return parts.length > 0 ? parts : text
}

function formatBoldItalic(text: string): React.ReactNode {
  // Bold **text**
  const boldRegex = /\*\*(.*?)\*\*/g
  const parts: React.ReactNode[] = []
  let lastIdx = 0
  let match: RegExpExecArray | null

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index))
    }
    parts.push(
      <strong key={`bold-${match.index}`} className="font-bold text-foreground">
        {match[1]}
      </strong>
    )
    lastIdx = match.index + match[0].length
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx))
  }

  return parts.length > 0 ? parts : text
}
