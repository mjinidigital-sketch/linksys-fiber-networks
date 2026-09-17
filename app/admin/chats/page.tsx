'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { authClient } from '@/lib/auth-client'
import {
  MessageSquare,
  Search,
  Check,
  CheckCheck,
  Send,
  Paperclip,
  Trash2,
  CheckCircle2,
  Clock,
  User,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  Archive,
  RefreshCw,
  FileText,
  Loader2,
  X,
  AlertTriangle,
  Flame,
  Zap,
  HelpCircle,
  FolderOpen
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import type { Id } from '@/convex/_generated/dataModel'

const CANNED_RESPONSES = [
  {
    label: '👋 Friendly Greeting',
    text: 'Hello! Thank you for contacting Linksys Support. How can we help you today?',
  },
  {
    label: '⚡ Installation Timeline',
    text: 'Our fiber installation team can connect your premises within 24 to 48 hours after order confirmation.',
  },
  {
    label: '💳 M-Pesa Payment Info',
    text: 'You can pay via M-Pesa: Go to Lipa na M-Pesa > Paybill > Business No: 400200 > Account: Your Phone Number.',
  },
  {
    label: '📶 Router Troubleshooting',
    text: 'Please power cycle your optical terminal (ONT router) by unplugging the power cable for 30 seconds, then reconnect.',
  },
  {
    label: '✅ Ticket Resolved',
    text: 'We are pleased to inform you that your issue has been resolved. Please let us know if you need any further assistance!',
  },
]

export default function AdminChatsPage() {
  const session = authClient.useSession()
  const currentUserWithProfile = useQuery(
    api.users.getCurrentUserWithProfile,
    session.data?.user ? {} : 'skip'
  )

  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'closed' | 'archived'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConversationId, setSelectedConversationId] = useState<Id<'conversations'> | null>(null)
  const [replyText, setReplyText] = useState('')
  const [showUserDetails, setShowUserDetails] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [attachments, setAttachments] = useState<
    Array<{ storageId: Id<'_storage'>; name: string; type: string; size: number; url?: string }>
  >([])
  const [deleteConfirmId, setDeleteConfirmId] = useState<Id<'conversations'> | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Convex Queries & Mutations
  const conversations = useQuery(
    api.chat.adminListConversations,
    currentUserWithProfile?.role === 'admin'
      ? { status: selectedStatus === 'all' ? undefined : selectedStatus }
      : 'skip'
  )

  const activeConversationData = useQuery(
    api.chat.adminGetConversationWithUser,
    selectedConversationId ? { conversationId: selectedConversationId } : 'skip'
  )

  const messages = useQuery(
    api.chat.getConversationMessages,
    selectedConversationId ? { conversationId: selectedConversationId } : 'skip'
  )

  const sendAdminMessage = useMutation(api.chat.sendAdminMessage)
  const markMessagesAsRead = useMutation(api.chat.markMessagesAsRead)
  const adminUpdateConversationStatus = useMutation(api.chat.adminUpdateConversationStatus)
  const adminDeleteConversation = useMutation(api.chat.adminDeleteConversation)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)

  // Auto select first conversation if none selected
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0]._id)
    }
  }, [conversations, selectedConversationId])

  // Mark messages as read when active conversation changes or new messages arrive
  useEffect(() => {
    if (
      selectedConversationId &&
      activeConversationData?.conversation &&
      activeConversationData.conversation.unreadByAdmin > 0
    ) {
      markMessagesAsRead({
        conversationId: selectedConversationId,
        role: 'admin',
      }).catch(console.error)
    }
  }, [selectedConversationId, activeConversationData, markMessagesAsRead])

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messages && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Filter conversations by search
  const filteredConversations = (conversations || []).filter((conv) => {
    const q = searchQuery.toLowerCase()
    return (
      conv.userName?.toLowerCase().includes(q) ||
      conv.userEmail?.toLowerCase().includes(q) ||
      conv.lastMessage?.toLowerCase().includes(q)
    )
  })

  // Handle Send Admin Message
  const handleSendMessage = async (customText?: string) => {
    if (!selectedConversationId) return
    const textToSend = customText !== undefined ? customText : replyText
    if (!textToSend.trim() && attachments.length === 0) return

    const currentText = textToSend
    const currentAttachments = [...attachments]

    setReplyText('')
    setAttachments([])
    setIsSending(true)

    try {
      await sendAdminMessage({
        conversationId: selectedConversationId,
        content: currentText.trim(),
        attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
      })
    } catch (err: any) {
      console.error('Failed to send admin message:', err)
      toast.add({
        title: 'Error sending message',
        description: err?.message || 'Could not send message',
        type: 'error',
      })
      setReplyText(currentText)
      setAttachments(currentAttachments)
    } finally {
      setIsSending(false)
    }
  }

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (file.size > 10 * 1024 * 1024) {
      toast.add({
        title: 'File too large',
        description: 'Please upload files under 10MB.',
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
        title: 'Attachment Ready',
        description: `${file.name} attached.`,
        type: 'success',
      })
    } catch (err: any) {
      console.error(err)
      toast.add({
        title: 'Upload Failed',
        description: err?.message || 'Could not upload file.',
        type: 'error',
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Handle Status Update
  const handleStatusChange = async (status: 'open' | 'closed' | 'archived') => {
    if (!selectedConversationId) return
    try {
      await adminUpdateConversationStatus({
        conversationId: selectedConversationId,
        status,
      })
      toast.add({
        title: 'Status Updated',
        description: `Conversation marked as ${status.toUpperCase()}.`,
        type: 'success',
      })
    } catch (err: any) {
      toast.add({
        title: 'Failed to update status',
        description: err?.message || 'Permission denied',
        type: 'error',
      })
    }
  }

  // Handle Delete Conversation
  const handleDeleteConversation = async () => {
    if (!deleteConfirmId) return
    try {
      await adminDeleteConversation({
        conversationId: deleteConfirmId,
      })
      toast.add({
        title: 'Conversation Deleted',
        description: 'Thread and messages removed permanently.',
        type: 'success',
      })
      setDeleteConfirmId(null)
      if (selectedConversationId === deleteConfirmId) {
        setSelectedConversationId(null)
      }
    } catch (err: any) {
      toast.add({
        title: 'Delete Failed',
        description: err?.message || 'Error deleting thread.',
        type: 'error',
      })
    }
  }

  const activeConv = activeConversationData?.conversation
  const activeUserProfile = activeConversationData?.userProfile

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/15 via-card to-card p-6 sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="success">Real-Time Support Engine</Badge>
              <span className="text-[11px] font-mono text-muted-foreground">
                Total Conversations: {conversations?.length ?? '...'}
              </span>
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
              Live Chat & Customer Management
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Direct two-way messaging with registered customers, real-time presence, and quick support resolutions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-border bg-card/80 p-3.5 backdrop-blur-md flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold">Active Threads</p>
                <p className="text-[11px] text-muted-foreground">
                  {conversations?.filter((c) => c.status === 'open').length || 0} Open Tickets
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Workspace (Split Pane) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] rounded-3xl border border-border bg-card overflow-hidden shadow-xl">
        {/* ── LEFT PANE: Conversation List (4 cols) ────────────────────────── */}
        <div className="lg:col-span-4 flex flex-col border-r border-border bg-card/50 h-full overflow-hidden">
          {/* Filter tabs & Search */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers or messages..."
                className="pl-9 text-xs h-9"
              />
            </div>

            <div className="flex rounded-xl bg-muted/50 p-1 text-xs">
              {(['all', 'open', 'closed', 'archived'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={cn(
                    'flex-1 py-1 px-2 rounded-lg font-medium capitalize text-[11px] transition-all cursor-pointer',
                    selectedStatus === st
                      ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Threads list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/60">
            {conversations === undefined ? (
              <div className="flex justify-center p-8">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <FolderOpen className="mx-auto size-10 text-muted-foreground/40" />
                <p className="text-xs font-semibold text-muted-foreground">No conversations found</p>
                <p className="text-[11px] text-muted-foreground/70">
                  {searchQuery ? 'Try a different search term' : 'Incoming chats will appear here in real-time.'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConversationId === conv._id
                const hasUnread = (conv.unreadByAdmin || 0) > 0

                return (
                  <button
                    key={conv._id}
                    onClick={() => setSelectedConversationId(conv._id)}
                    className={cn(
                      'w-full text-left p-4 transition-all flex items-start gap-3 relative cursor-pointer group',
                      isSelected
                        ? 'bg-primary/10 border-l-4 border-l-primary'
                        : 'hover:bg-muted/40'
                    )}
                  >
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted/80 flex items-center justify-center font-bold text-primary text-sm shadow-xs">
                      {conv.userImage ? (
                        <img src={conv.userImage} alt={conv.userName} className="size-full object-cover" />
                      ) : (
                        <span>{(conv.userName || conv.userEmail || 'U').substring(0, 2).toUpperCase()}</span>
                      )}
                      {conv.status === 'open' && (
                        <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="truncate text-xs font-bold text-foreground">
                          {conv.userName || 'Customer'}
                        </h4>
                        <span className="shrink-0 text-[10px] text-muted-foreground font-mono">
                          {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="truncate text-[11px] text-muted-foreground leading-tight">
                        {conv.lastMessage || 'No messages yet'}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <Badge
                          variant={conv.status === 'open' ? 'outline' : 'secondary'}
                          className={cn(
                            'text-[9px] py-0 px-1.5 uppercase font-mono font-semibold',
                            conv.status === 'open' && 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10'
                          )}
                        >
                          {conv.status}
                        </Badge>

                        {hasUnread && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground animate-pulse shadow-sm">
                            {conv.unreadByAdmin}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── CENTER PANE: Active Chat & Transcript (5 or 8 cols depending on side panel) ── */}
        <div
          className={cn(
            'flex flex-col h-full overflow-hidden bg-background/50',
            showUserDetails ? 'lg:col-span-5' : 'lg:col-span-8'
          )}
        >
          {selectedConversationId && activeConv ? (
            <>
              {/* Conversation Top Action Bar */}
              <div className="flex items-center justify-between border-b border-border/80 bg-card/80 p-3.5 backdrop-blur-md">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted flex items-center justify-center font-bold text-primary text-xs">
                    {activeConv.userImage ? (
                      <img src={activeConv.userImage} alt={activeConv.userName} className="size-full object-cover" />
                    ) : (
                      <span>{(activeConv.userName || activeConv.userEmail || 'U').substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-xs sm:text-sm font-bold">{activeConv.userName || 'Customer'}</h3>
                      <Badge variant="outline" className="text-[9px] py-0 px-1">
                        {activeUserProfile?.role || 'user'}
                      </Badge>
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground flex items-center gap-1">
                      <Mail className="size-3" /> {activeConv.userEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Status Action */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-[11px] gap-1"
                    onClick={() => handleStatusChange(activeConv.status === 'open' ? 'closed' : 'open')}
                  >
                    {activeConv.status === 'open' ? (
                      <>
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        <span>Resolve</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="size-3.5 text-primary" />
                        <span>Reopen</span>
                      </>
                    )}
                  </Button>

                  {/* Delete Conversation */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setDeleteConfirmId(activeConv._id)}
                    title="Delete Conversation"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>

                  {/* Toggle Details Panel */}
                  <Button
                    variant={showUserDetails ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setShowUserDetails(!showUserDetails)}
                    title="Toggle Customer Info Panel"
                  >
                    <Info className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Message Transcript */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-background/30">
                {messages === undefined ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="size-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center p-8 space-y-2">
                    <MessageSquare className="size-10 text-muted-foreground/30" />
                    <p className="text-xs font-semibold">No messages in this thread</p>
                    <p className="text-[11px] text-muted-foreground">Send a message below to begin the chat.</p>
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    const isAdmin = msg.senderRole === 'admin'
                    return (
                      <div
                        key={msg._id}
                        className={cn(
                          'flex flex-col group',
                          isAdmin ? 'items-end' : 'items-start'
                        )}
                      >
                        <div className="flex items-end gap-2 max-w-[85%]">
                          {!isAdmin && (
                            <div className="size-6 shrink-0 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-foreground">
                              {(msg.senderName || 'U').substring(0, 1).toUpperCase()}
                            </div>
                          )}

                          <div
                            className={cn(
                              'rounded-2xl px-3.5 py-2.5 text-xs shadow-xs space-y-1.5 break-words',
                              isAdmin
                                ? 'bg-primary text-primary-foreground rounded-br-xs'
                                : 'bg-muted/90 text-foreground border border-border/70 rounded-bl-xs'
                            )}
                          >
                            <p className={cn('text-[10px] font-bold flex items-center gap-1', isAdmin ? 'text-white/80' : 'text-primary')}>
                              <span>{msg.senderName || (isAdmin ? 'Support Team' : 'User')}</span>
                              {isAdmin && (
                                <Badge variant="outline" className="text-[8px] py-0 px-1 border-white/30 text-white">
                                  Admin
                                </Badge>
                              )}
                            </p>

                            {msg.content && (
                              <p className="whitespace-pre-wrap leading-relaxed">
                                {msg.content}
                              </p>
                            )}

                            {/* Attachments */}
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
                                      <img src={att.url} alt={att.name} className="max-h-48 w-full object-cover" />
                                    </a>
                                  ) : (
                                    <a
                                      key={idx}
                                      href={att.url || '#'}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={cn(
                                        'flex items-center gap-2 rounded-xl p-2 text-[11px] border transition-colors',
                                        isAdmin
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

                        {/* Timestamp & read receipts */}
                        <div className="flex items-center gap-1.5 px-2 mt-1 text-[9px] text-muted-foreground font-mono">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isAdmin ? (
                            <span title={msg.isRead ? 'Seen by user' : 'Delivered (Unread)'}>
                              {msg.isRead ? (
                                <CheckCheck className="size-3 text-emerald-500 inline" />
                              ) : (
                                <CheckCheck className="size-3 text-muted-foreground/60 inline" />
                              )}
                            </span>
                          ) : (
                            <span title={msg.isRead ? 'Seen by support' : 'Unread user query'}>
                              {msg.isRead ? (
                                <CheckCheck className="size-3 text-emerald-500 inline" />
                              ) : (
                                <CheckCheck className="size-3 text-muted-foreground/60 inline" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Canned Responses Quick Bar */}
              <div className="px-3 py-2 border-t border-border/60 bg-muted/20 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground shrink-0 flex items-center gap-1">
                  <Sparkles className="size-3 text-primary" /> Quick:
                </span>
                {CANNED_RESPONSES.map((cr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReplyText(cr.text)}
                    className="shrink-0 rounded-lg border border-border/80 bg-card hover:bg-primary/10 hover:border-primary/40 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {cr.label}
                  </button>
                ))}
              </div>

              {/* Uploading indicator */}
              {isUploading && (
                <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 border-t border-primary/20 text-xs text-primary font-medium">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Uploading attachment...</span>
                </div>
              )}

              {/* Pending Attachments */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-3 py-2 bg-muted/40 border-t border-border">
                  {attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 rounded-lg bg-card border border-border px-2 py-1 text-[11px]"
                    >
                      <FileText className="size-3 text-primary" />
                      <span className="truncate max-w-[140px]">{att.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Admin Reply Composer */}
              <div className="p-3 border-t border-border/80 bg-card/80">
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
                    title="Attach file or screenshot"
                  >
                    <Paperclip className="size-4" />
                  </Button>

                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Type an official support reply..."
                    className="text-xs bg-background/90 rounded-xl h-9 border-border/70 focus-visible:ring-1"
                  />

                  <Button
                    type="submit"
                    size="sm"
                    disabled={(!replyText.trim() && attachments.length === 0) || isSending || isUploading}
                    className="size-9 p-0 rounded-xl shrink-0 shadow-md shadow-primary/20"
                  >
                    {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="flex size-14 items-center justify-center rounded-3xl border border-border bg-muted/40 text-muted-foreground">
                <MessageSquare className="size-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold">Select a Conversation</h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Choose a customer thread from the left pane to view messages and respond.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANE: Customer Context & Intelligence (3 cols) ─────────── */}
        {showUserDetails && activeConv && (
          <div className="lg:col-span-3 border-l border-border bg-card/40 p-5 h-full overflow-y-auto custom-scrollbar space-y-5">
            <div className="text-center space-y-3 pb-4 border-b border-border">
              <div className="relative mx-auto size-20 overflow-hidden rounded-3xl border-2 border-primary/30 bg-muted/80 flex items-center justify-center font-bold text-primary text-xl shadow-lg">
                {activeConv.userImage ? (
                  <img src={activeConv.userImage} alt={activeConv.userName} className="size-full object-cover" />
                ) : (
                  <span>{(activeConv.userName || activeConv.userEmail || 'U').substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-base">{activeConv.userName || 'Customer'}</h3>
                <Badge variant="secondary" className="mt-1 uppercase text-[9px] font-mono">
                  {activeUserProfile?.role || 'user'}
                </Badge>
              </div>
            </div>

            {/* Customer Details List */}
            <div className="space-y-3 text-xs">
              <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                Account Information
              </p>

              <div className="space-y-2 rounded-2xl border border-border bg-card/70 p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-3.5 text-primary shrink-0" />
                  <span className="truncate">{activeConv.userEmail}</span>
                </div>

                {activeUserProfile?.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-3.5 text-primary shrink-0" />
                    <a href={`tel:${activeUserProfile.phone}`} className="hover:underline">
                      {activeUserProfile.phone}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-3.5 text-primary shrink-0" />
                  <span>Joined: {new Date(activeConv.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {activeUserProfile?.bio && (
                <div className="space-y-1 pt-1">
                  <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Bio / Notes</p>
                  <p className="text-xs text-muted-foreground italic rounded-xl border border-border bg-muted/20 p-2.5">
                    &quot;{activeUserProfile.bio}&quot;
                  </p>
                </div>
              )}

              {/* Socials */}
              {activeUserProfile?.socials && activeUserProfile.socials.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Social Links</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeUserProfile.socials.map((s: any, idx: number) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <span>{s.label || s.platform}</span>
                        <ExternalLink className="size-2.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Link to User Management */}
              <div className="pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1.5 h-8"
                  onClick={() => window.open('/admin/users', '_blank')}
                >
                  <User className="size-3.5" />
                  <span>View in User Management</span>
                  <ExternalLink className="size-3 ml-auto opacity-70" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md border-destructive/30 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Delete Conversation?</CardTitle>
                <CardDescription className="text-xs">
                  This will permanently delete this thread and all message history.
                </CardDescription>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteConversation}>
                Delete Permanently
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
