'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useConvexAuth } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import {
  Heart,
  MessageSquare,
  CornerDownRight,
  Trash2,
  Send,
  Loader2,
  Lock,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface CommentsSectionProps {
  postId: string
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const pathname = usePathname()
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth()
  const { data: session } = authClient.useSession()
  const currentUser = session?.user

  // Queries
  const postLikes = useQuery(api.likes.getPostLikes, { postId })
  const comments = useQuery(api.comments.getComments, { postId })
  const userProfile = useQuery(
    api.users.getCurrentUserWithProfile,
    isAuthenticated ? {} : "skip"
  )

  // Mutations
  const togglePostLike = useMutation(api.likes.togglePostLike)
  const toggleCommentLike = useMutation(api.likes.toggleCommentLike)
  const addComment = useMutation(api.comments.addComment)
  const removeComment = useMutation(api.comments.removeComment)

  // State
  const [newCommentText, setNewCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyingToId, setReplyingToId] = useState<Id<'comments'> | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [isLikingPost, setIsLikingPost] = useState(false)
  const [likingCommentIds, setLikingCommentIds] = useState<Record<string, boolean>>({})

  // Handle Post Like
  const handlePostLike = async () => {
    if (!isAuthenticated) {
      toast.add({
        title: 'Authentication Required',
        description: 'Please log in to like this article.',
        type: 'error',
      })
      return
    }

    try {
      setIsLikingPost(true)
      const res = await togglePostLike({ postId })
      toast.add({
        title: res.isLiked ? 'Article Liked!' : 'Unliked',
        description: res.isLiked
          ? 'Thanks for showing your appreciation!'
          : 'You unliked this article.',
        type: 'success',
      })
    } catch (err: any) {
      toast.add({
        title: 'Action Failed',
        description: err.message || 'Could not update like.',
        type: 'error',
      })
    } finally {
      setIsLikingPost(false)
    }
  }

  // Handle Comment Like
  const handleCommentLike = async (commentId: Id<'comments'>) => {
    if (!isAuthenticated) {
      toast.add({
        title: 'Authentication Required',
        description: 'Please log in to like comments.',
        type: 'error',
      })
      return
    }

    try {
      setLikingCommentIds((prev) => ({ ...prev, [commentId]: true }))
      await toggleCommentLike({ commentId })
    } catch (err: any) {
      toast.add({
        title: 'Action Failed',
        description: err.message || 'Could not update comment like.',
        type: 'error',
      })
    } finally {
      setLikingCommentIds((prev) => ({ ...prev, [commentId]: false }))
    }
  }

  // Handle Create Top-Level Comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.add({
        title: 'Authentication Required',
        description: 'Please log in to post a comment.',
        type: 'error',
      })
      return
    }

    if (!newCommentText.trim()) return

    try {
      setIsSubmitting(true)
      await addComment({
        postId,
        content: newCommentText,
      })
      setNewCommentText('')
      toast.add({
        title: 'Comment Posted',
        description: 'Your comment has been added to the discussion.',
        type: 'success',
      })
    } catch (err: any) {
      toast.add({
        title: 'Error',
        description: err.message || 'Failed to submit comment.',
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Submit Reply
  const handleSubmitReply = async (parentId: Id<'comments'>) => {
    if (!isAuthenticated) {
      toast.add({
        title: 'Authentication Required',
        description: 'Please log in to reply.',
        type: 'error',
      })
      return
    }

    if (!replyText.trim()) return

    try {
      setIsSubmittingReply(true)
      await addComment({
        postId,
        content: replyText,
        parentId,
      })
      setReplyText('')
      setReplyingToId(null)
      toast.add({
        title: 'Reply Posted',
        description: 'Your reply has been added.',
        type: 'success',
      })
    } catch (err: any) {
      toast.add({
        title: 'Error',
        description: err.message || 'Failed to submit reply.',
        type: 'error',
      })
    } finally {
      setIsSubmittingReply(false)
    }
  }

  // Handle Delete Comment
  const handleDeleteComment = async (commentId: Id<'comments'>) => {
    try {
      await removeComment({ commentId })
      toast.add({
        title: 'Comment Deleted',
        description: 'Comment was successfully removed.',
        type: 'success',
      })
    } catch (err: any) {
      toast.add({
        title: 'Delete Failed',
        description: err.message || 'Could not delete comment.',
        type: 'error',
      })
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diffInSeconds = Math.floor((now - timestamp) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Group top-level comments and replies
  const topLevelComments = comments?.filter((c) => !c.parentId) || []
  const getReplies = (parentId: Id<'comments'>) =>
    comments?.filter((c) => c.parentId === parentId) || []

  const totalCommentCount = comments?.length || 0

  return (
    <section className="mt-16 border-t border-border pt-12 space-y-10">
      {/* Article Engagement Bar (Like Post & Stats) */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePostLike}
            disabled={isLikingPost}
            className={`group flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all ${
              postLikes?.isLiked
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-sm'
                : 'border-border bg-background text-muted-foreground hover:border-rose-500/40 hover:text-rose-500'
            }`}
            aria-label="Like article"
          >
            <Heart
              className={`size-5 transition-transform group-hover:scale-110 ${
                postLikes?.isLiked ? 'fill-rose-500 text-rose-500' : ''
              } ${isLikingPost ? 'animate-pulse' : ''}`}
            />
            <span>{postLikes?.likesCount || 0}</span>
            <span className="hidden sm:inline font-normal">
              {postLikes?.isLiked ? 'Liked' : 'Like post'}
            </span>
          </button>

          <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground">
            <MessageSquare className="size-4 text-primary" />
            <span>{totalCommentCount}</span>
            <span className="hidden sm:inline font-normal">
              {totalCommentCount === 1 ? 'Comment' : 'Comments'}
            </span>
          </div>
        </div>

        {!isAuthenticated && !authLoading && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Lock className="size-3.5 text-amber-500" />
            Sign in to like or comment
          </p>
        )}
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-2xl font-bold tracking-tight">Discussion ({totalCommentCount})</h3>
        <p className="text-sm text-muted-foreground">
          Join the conversation and share your feedback.
        </p>
      </div>

      {/* New Comment Input Box or Auth Banner */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="size-10 overflow-hidden rounded-full border border-primary/20 bg-muted shrink-0 mt-1">
              {userProfile?.profile?.profilePic || currentUser?.image ? (
                <img
                  src={userProfile?.profile?.profilePic || currentUser?.image || ''}
                  alt={userProfile?.profile?.name || currentUser?.name || 'User'}
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full flex items-center justify-center bg-primary/10 text-primary font-bold text-sm">
                  {(userProfile?.profile?.name || currentUser?.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className="w-full rounded-2xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none shadow-sm"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting || !newCommentText.trim()}
                  className="rounded-xl text-xs font-semibold px-5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-1.5" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5 mr-1.5" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="rounded-3xl border border-border bg-gradient-to-r from-muted/50 via-card to-muted/50 p-6 text-center space-y-4 shadow-sm">
          <div className="size-12 rounded-2xl border border-primary/20 bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <MessageSquare className="size-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="font-semibold text-foreground">Want to join the discussion?</h4>
            <p className="text-xs text-muted-foreground">
              Sign in or create an account to leave a comment, reply to others, or like posts.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-1">
            <Link href={`/auth/login?redirect=${encodeURIComponent(pathname || '/')}`}>
              <Button variant="outline" size="sm" className="rounded-xl text-xs">
                Log In
              </Button>
            </Link>
            <Link href={`/auth/sign-up?redirect=${encodeURIComponent(pathname || '/')}`}>
              <Button size="sm" className="rounded-xl text-xs font-semibold">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments === undefined ? (
          <div className="py-12 text-center text-muted-foreground flex justify-center items-center gap-2">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span className="text-sm font-mono">Loading comments...</span>
          </div>
        ) : topLevelComments.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border rounded-3xl p-8 space-y-2">
            <MessageSquare className="size-8 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No comments yet</p>
            <p className="text-xs text-muted-foreground/70">
              Be the first to share your thoughts on this article!
            </p>
          </div>
        ) : (
          topLevelComments.map((comment) => {
            const replies = getReplies(comment._id)
            const isAuthor =
              currentUser?.id === comment.userId ||
              userProfile?.profile?.userId === comment.userId
            const isAdmin = userProfile?.role === 'admin'

            return (
              <div
                key={comment._id}
                className="group rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm hover:border-border/80 transition-colors"
              >
                {/* Comment Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-9 overflow-hidden rounded-full border border-border bg-muted shrink-0">
                      {comment.authorImage ? (
                        <img
                          src={comment.authorImage}
                          alt={comment.authorName}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                          {comment.authorName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-foreground">
                        {comment.authorName}
                      </h5>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {formatTimestamp(comment.createdAt)}
                      </span>
                    </div>
                  </div>

                  {(isAuthor || isAdmin) && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-muted-foreground hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-500/10"
                      title="Delete comment"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Comment Content */}
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line pl-12">
                  {comment.content}
                </p>

                {/* Comment Action Bar */}
                <div className="flex items-center gap-4 pl-12 pt-1">
                  <button
                    onClick={() => handleCommentLike(comment._id)}
                    disabled={likingCommentIds[comment._id]}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                      comment.isLiked
                        ? 'text-rose-500'
                        : 'text-muted-foreground hover:text-rose-500'
                    }`}
                  >
                    <Heart
                      className={`size-3.5 ${
                        comment.isLiked ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                    <span>{comment.likesCount}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (replyingToId === comment._id) {
                        setReplyingToId(null)
                        setReplyText('')
                      } else {
                        setReplyingToId(comment._id)
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    <CornerDownRight className="size-3.5" />
                    <span>Reply</span>
                  </button>
                </div>

                {/* Inline Reply Form */}
                {replyingToId === comment._id && (
                  <div className="ml-6 sm:ml-12 pt-3 border-t border-border/50 space-y-3">
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Replying to ${comment.authorName}...`}
                          rows={2}
                          className="w-full rounded-2xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all resize-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReplyingToId(null)
                              setReplyText('')
                            }}
                            className="rounded-xl text-xs h-8"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            disabled={isSubmittingReply || !replyText.trim()}
                            onClick={() => handleSubmitReply(comment._id)}
                            className="rounded-xl text-xs h-8 font-semibold"
                          >
                            {isSubmittingReply ? (
                              <Loader2 className="size-3 animate-spin mr-1" />
                            ) : (
                              <Send className="size-3 mr-1" />
                            )}
                            Reply
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-muted/40 text-xs text-muted-foreground flex items-center justify-between">
                        <span>Please log in to reply.</span>
                        <Link href="/auth/login">
                          <Button variant="outline" size="sm" className="rounded-xl text-[11px] h-7">
                            Log In
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Nested Replies */}
                {replies.length > 0 && (
                  <div className="ml-4 sm:ml-10 border-l-2 border-border/60 pl-4 sm:pl-6 space-y-4 pt-2">
                    {replies.map((reply) => {
                      const isReplyAuthor =
                        currentUser?.id === reply.userId ||
                        userProfile?.profile?.userId === reply.userId

                      return (
                        <div
                          key={reply._id}
                          className="rounded-2xl border border-border/50 bg-background/60 p-4 space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="size-7 overflow-hidden rounded-full border border-border bg-muted shrink-0">
                                {reply.authorImage ? (
                                  <img
                                    src={reply.authorImage}
                                    alt={reply.authorName}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <div className="size-full flex items-center justify-center bg-primary/10 text-primary font-bold text-[10px]">
                                    {reply.authorName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h6 className="text-xs font-bold text-foreground">
                                  {reply.authorName}
                                </h6>
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  {formatTimestamp(reply.createdAt)}
                                </span>
                              </div>
                            </div>

                            {(isReplyAuthor || isAdmin) && (
                              <button
                                onClick={() => handleDeleteComment(reply._id)}
                                className="text-muted-foreground hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-500/10"
                                title="Delete reply"
                                aria-label="Delete reply"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-foreground leading-relaxed whitespace-pre-line pl-9">
                            {reply.content}
                          </p>

                          <div className="flex items-center gap-3 pl-9 pt-0.5">
                            <button
                              onClick={() => handleCommentLike(reply._id)}
                              disabled={likingCommentIds[reply._id]}
                              className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                                reply.isLiked
                                  ? 'text-rose-500'
                                  : 'text-muted-foreground hover:text-rose-500'
                              }`}
                            >
                              <Heart
                                className={`size-3 ${
                                  reply.isLiked ? 'fill-rose-500 text-rose-500' : ''
                                }`}
                              />
                              <span>{reply.likesCount}</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
