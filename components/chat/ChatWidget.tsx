'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { authClient } from '@/lib/auth-client'
import { useRouter, usePathname } from 'next/navigation'
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  Smile,
  Volume2,
  VolumeX,
  Check,
  CheckCheck,
  Loader2,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  ExternalLink,
  Phone,
  Mail,
  FileText,
  Image as ImageIcon,
  Minimize2,
  ArrowRight,
  Headphones
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import type { Id } from '@/convex/_generated/dataModel'

// Soft pleasant notification chime using Web Audio API
function playChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1) // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  } catch (e) {
    // Audio context may be blocked by autoplay policies until user interaction
  }
}

const QUICK_PROMPTS = [
  '👋 Hi! I would like to inquire about Fiber Internet packages.',
  '⚡ How fast can you install fiber at my location?',
  '💳 I need assistance with my billing or invoice.',
  '🛠️ I am experiencing connection issues.',
]

export function ChatWidget() {
  const router = useRouter()
  const pathname = usePathname()
  const session = authClient.useSession()
  const isAuthenticated = !!session.data?.user

  const [isOpen, setIsOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [attachments, setAttachments] = useState<
    Array<{ storageId: Id<'_storage'>; name: string; type: string; size: number; url?: string }>
  >([])

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const prevMessagesCountRef = useRef<number>(0)

  // Convex Queries & Mutations
  const userConversation = useQuery(
    api.chat.getUserConversation,
    isAuthenticated ? {} : 'skip'
  )
  const unreadCount = useQuery(
    api.chat.getUserUnreadCount,
    isAuthenticated ? {} : 'skip'
  )
  const messages = useQuery(
    api.chat.getConversationMessages,
    userConversation?._id ? { conversationId: userConversation._id } : 'skip'
  )

  const sendUserMessage = useMutation(api.chat.sendUserMessage)
  const markMessagesAsRead = useMutation(api.chat.markMessagesAsRead)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const getOrCreateUserConversation = useMutation(api.chat.getOrCreateUserConversation)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    if (isOpen && messages && messages.length > 0) {
      scrollToBottom('smooth')
    }
  }, [isOpen, messages])

  // Play chime on incoming message when widget is closed or from admin
  useEffect(() => {
    if (messages && messages.length > prevMessagesCountRef.current) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.senderRole === 'admin' && prevMessagesCountRef.current > 0) {
        if (soundEnabled) {
          playChime()
        }
      }
      prevMessagesCountRef.current = messages.length
    }
  }, [messages, soundEnabled])

  // Mark messages as read when widget is opened
  useEffect(() => {
    if (isOpen && userConversation?._id && (unreadCount || 0) > 0) {
      markMessagesAsRead({
        conversationId: userConversation._id,
        role: 'user',
      }).catch(console.error)
    }
  }, [isOpen, userConversation?._id, unreadCount, markMessagesAsRead])

  // Don't render chat widget if user is currently inside the admin panel
  if (pathname?.startsWith('/admin')) {
    return null
  }

  const handleOpenWidget = async () => {
    setIsOpen(true)
    if (isAuthenticated && !userConversation) {
      try {
        await getOrCreateUserConversation()
      } catch (err) {
        console.error('Error initializing conversation:', err)
      }
    }
  }

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : inputText
    if (!textToSend.trim() && attachments.length === 0) return

    const currentText = textToSend
    const currentAttachments = [...attachments]

    setInputText('')
    setAttachments([])

    try {
      await sendUserMessage({
        content: currentText.trim(),
        attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
      })
    } catch (err: any) {
      console.error('Failed to send message:', err)
      toast.add({
        title: 'Message Error',
        description: err?.message || 'Could not send message. Please try again.',
        type: 'error',
      })
      setInputText(currentText)
      setAttachments(currentAttachments)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (file.size > 10 * 1024 * 1024) {
      toast.add({
        title: 'File too large',
        description: 'Please upload a file smaller than 10MB.',
        type: 'error',
      })
      return
    }

    try {
      setIsUploading(true)
      const postUrl = await generateUploadUrl()
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      })

      if (!result.ok) throw new Error('Failed to upload file')
      const { storageId } = await result.json()

      const newAttachment = {
        storageId: storageId as Id<'_storage'>,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
      }

      setAttachments((prev) => [...prev, newAttachment])
      toast.add({
        title: 'File Attached',
        description: `${file.name} ready to send.`,
        type: 'success',
      })
    } catch (err: any) {
      console.error('Upload error:', err)
      toast.add({
        title: 'Upload Failed',
        description: err?.message || 'Error uploading attachment',
        type: 'error',
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center">
        {!isOpen && (
          <button
            onClick={handleOpenWidget}
            className="group relative flex size-14 sm:size-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-xl shadow-secondary/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
            aria-label="Open Live Chat Support"
          >
            <div className="relative">
              <MessageSquare className="size-6 sm:size-7 transition-transform group-hover:-rotate-6" />
              <span className="absolute -top-1 -right-1 flex size-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-3 bg-emerald-500" />
              </span>
            </div>

            {/* Unread badge */}
            {(unreadCount || 0) > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-bold text-destructive-foreground shadow-lg ring-2 ring-background animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Floating Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col w-[calc(100vw-2rem)] sm:w-[420px] h-[600px] max-h-[88vh] rounded-3xl border border-secondary/25 bg-card/95 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="relative flex items-center justify-between border-b border-border/80 bg-gradient-to-r from-secondary/15 via-card to-background px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="relative flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-md shadow-secondary/20">
                <Headphones className="size-5" />
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight text-foreground">
                    Live Support
                  </h3>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[9px] py-0 px-1.5 font-semibold">
                    Online
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Linksys Fast Response Team
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title={soundEnabled ? 'Mute chime' : 'Enable chime'}
                aria-label="Toggle sound notification"
              >
                {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Minimize chat"
                aria-label="Minimize live chat"
              >
                <Minimize2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
                title="Close chat"
                aria-label="Close live chat"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-background/50">
            {!isAuthenticated ? (
              /* Unauthenticated / Guest State */
              <div className="flex h-full flex-col items-center justify-center text-center p-4 space-y-5">
                <div className="flex size-16 items-center justify-center rounded-3xl border border-secondary/30 bg-secondary/10 text-secondary shadow-inner">
                  <Sparkles className="size-8" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h4 className="text-base font-bold tracking-tight">
                    Chat with Our Support Team
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sign in to your account to start a real-time conversation, ask questions about fiber installation, and receive instant support.
                  </p>
                </div>

                <div className="w-full space-y-2 pt-2">
                  <Button
                    className="w-full text-xs font-semibold gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg shadow-secondary/25"
                    onClick={() => {
                      setIsOpen(false)
                      router.push(`/auth/login?redirect=${encodeURIComponent(pathname || '/')}`)
                    }}
                  >
                    <span>Sign In to Start Chat</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => {
                      setIsOpen(false)
                      router.push(`/auth/sign-up?redirect=${encodeURIComponent(pathname || '/')}`)
                    }}
                  >
                    Create Free Account
                  </Button>
                </div>

                <div className="border-t border-border/80 w-full pt-4 space-y-2 text-left">
                  <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground text-center">
                    Direct Contact Channels
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground rounded-xl border border-border/60 bg-muted/20 p-2.5">
                    <div className="flex items-center gap-2">
                      <Phone className="size-3.5 text-secondary" />
                      <span>+254 700 000 000</span>
                    </div>
                    <Badge variant="secondary" className="text-[9px]">24/7 Hotline</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground rounded-xl border border-border/60 bg-muted/20 p-2.5">
                    <div className="flex items-center gap-2">
                      <Mail className="size-3.5 text-secondary" />
                      <span>support@linksys.co.ke</span>
                    </div>
                    <Badge variant="secondary" className="text-[9px]">Email Support</Badge>
                  </div>
                </div>
              </div>
            ) : (
              /* Authenticated Chat State */
              <>
                {/* Welcome Card & Conversation Header */}
                <div className="rounded-2xl border border-border/70 bg-card/70 p-3.5 text-xs text-muted-foreground space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Bot className="size-4 text-secondary" />
                    <span>Welcome back, {session.data?.user?.name || 'Valued Customer'}!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Our team is here to assist you with high-speed fiber internet inquiries, technical troubleshooting, and account services.
                  </p>
                </div>

                {/* Quick Suggestion Prompts if conversation is fresh */}
                {(!messages || messages.length === 0) && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                      Suggested Questions
                    </p>
                    <div className="space-y-1.5">
                      {QUICK_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(prompt)}
                          className="w-full text-left rounded-xl border border-border/80 bg-muted/30 hover:bg-secondary/10 hover:border-secondary/40 px-3 py-2 text-xs transition-all duration-150 flex items-center justify-between group cursor-pointer"
                        >
                          <span className="text-foreground/90 group-hover:text-secondary transition-colors">
                            {prompt}
                          </span>
                          <ArrowRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages Stream */}
                {messages && messages.map((msg: any) => {
                  const isUser = msg.senderRole === 'user'
                  return (
                    <div
                      key={msg._id}
                      className={cn(
                        'flex flex-col group',
                        isUser ? 'items-end' : 'items-start'
                      )}
                    >
                      <div className="flex items-end gap-2 max-w-[85%]">
                        {!isUser && (
                          <div className="size-6 shrink-0 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-[10px] font-bold shadow-xs">
                            <ShieldCheck className="size-3.5" />
                          </div>
                        )}

                        <div
                          className={cn(
                            'rounded-2xl px-3.5 py-2.5 text-xs shadow-xs space-y-1.5 break-words',
                            isUser
                              ? 'bg-secondary text-secondary-foreground rounded-br-xs'
                              : 'bg-muted/90 text-foreground border border-border/70 rounded-bl-xs'
                          )}
                        >
                          {!isUser && (
                            <p className="text-[10px] font-bold text-secondary flex items-center gap-1">
                              <span>{msg.senderName || 'Support Team'}</span>
                              <Badge variant="outline" className="text-[8px] py-0 px-1 border-secondary/30 text-secondary">Admin</Badge>
                            </p>
                          )}

                          {msg.content && (
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {msg.content}
                            </p>
                          )}

                          {/* Attachments preview */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              {msg.attachments.map((att: any, idx: number) => {
                                const isImg = att.type?.startsWith('image/')
                                return isImg && att.url ? (
                                  <a
                                    key={idx}
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block overflow-hidden rounded-xl border border-white/20 hover:opacity-90 transition-opacity"
                                  >
                                    <img
                                      src={att.url}
                                      alt={att.name}
                                      className="max-h-48 w-full object-cover"
                                    />
                                  </a>
                                ) : (
                                  <a
                                    key={idx}
                                    href={att.url || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={cn(
                                      'flex items-center gap-2 rounded-xl p-2 text-[11px] border transition-colors',
                                      isUser
                                        ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                        : 'bg-background border-border text-foreground hover:bg-muted'
                                    )}
                                  >
                                    <FileText className="size-4 shrink-0" />
                                    <span className="truncate flex-1 font-medium">{att.name}</span>
                                    <ExternalLink className="size-3 shrink-0 opacity-70" />
                                  </a>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Message Metadata & Read Receipt */}
                      <div className="flex items-center gap-1.5 px-2 mt-1 text-[9px] text-muted-foreground font-mono">
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isUser && (
                          <span title={msg.isRead ? 'Seen by support' : 'Delivered (Unread)'}>
                            {msg.isRead ? (
                              <CheckCheck className="size-3 text-sky-400 inline" />
                            ) : (
                              <CheckCheck className="size-3 text-muted-foreground/60 inline" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Uploading indicator */}
          {isUploading && (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-secondary/10 border-t border-secondary/20 text-xs text-secondary font-medium">
              <Loader2 className="size-3.5 animate-spin" />
              <span>Uploading attachment...</span>
            </div>
          )}

          {/* Pending Attachments chips */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-3 py-2 bg-muted/40 border-t border-border">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 rounded-lg bg-card border border-border px-2 py-1 text-[11px]"
                >
                  <FileText className="size-3 text-secondary" />
                  <span className="truncate max-w-[140px]">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Composer (Only if authenticated) */}
          {isAuthenticated && (
            <div className="p-3 border-t border-border/80 bg-card/80 backdrop-blur-md">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="size-9 p-0 rounded-xl text-muted-foreground hover:text-foreground shrink-0"
                  title="Attach file or image"
                >
                  <Paperclip className="size-4" />
                </Button>

                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type your message..."
                  className="text-xs bg-background/90 rounded-xl h-9 border-border/70 focus-visible:ring-1"
                />

                <Button
                  type="submit"
                  size="sm"
                  disabled={(!inputText.trim() && attachments.length === 0) || isUploading}
                  className="size-9 p-0 rounded-xl shrink-0 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md shadow-secondary/20"
                >
                  <Send className="size-4" />
                </Button>
              </form>

              <div className="flex items-center justify-between px-1 mt-2 text-[10px] text-muted-foreground">
                <span>Press Enter to send</span>
                <span className="flex items-center gap-1 font-mono text-[9px] opacity-70">
                  ⚡ Linksys Real-Time
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
