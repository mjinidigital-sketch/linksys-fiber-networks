import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("user"), v.literal("editor")),
    profilePic: v.optional(v.string()),
    profilePicStorageId: v.optional(v.id("_storage")),
    bio: v.optional(v.string()),
    socials: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          url: v.string(),
          label: v.string(),
        })
      )
    ),
    phone: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  websiteContent: defineTable({
    key: v.string(), // "main"
    content: v.any(),
    lastUpdated: v.optional(v.string()),
  }).index("by_key", ["key"]),

  tasks: defineTable({
    text: v.string(),
    isCompleted: v.optional(v.boolean()),
  }),

  comments: defineTable({
    postId: v.string(),
    userId: v.string(),
    authorName: v.string(),
    authorImage: v.optional(v.string()),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
    createdAt: v.number(),
  })
    .index("by_postId", ["postId"])
    .index("by_parentId", ["parentId"]),

  likes: defineTable({
    postId: v.optional(v.string()),
    commentId: v.optional(v.id("comments")),
    userId: v.string(),
    createdAt: v.number(),
  })
    .index("by_postId", ["postId"])
    .index("by_commentId", ["commentId"])
    .index("by_postId_and_userId", ["postId", "userId"])
    .index("by_commentId_and_userId", ["commentId", "userId"]),

  // ── Careers ────────────────────────────────────────────────────────────────

  jobs: defineTable({
    title: v.string(),
    department: v.string(),
    location: v.string(),
    type: v.union(
      v.literal("full-time"),
      v.literal("part-time"),
      v.literal("contract"),
      v.literal("remote")
    ),
    description: v.string(),
    requirements: v.array(v.string()),
    salary: v.optional(v.string()),
    published: v.boolean(),
    authorId: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_authorId", ["authorId"])
    .index("by_published", ["published"]),

  applications: defineTable({
    jobId: v.id("jobs"),
    /** tokenIdentifier from Better Auth — stable across sessions */
    userId: v.string(),
    applicantName: v.string(),
    applicantEmail: v.string(),
    phone: v.optional(v.string()),
    // Cover letter — either typed text OR an uploaded file (or both)
    coverLetter: v.optional(v.string()),
    coverLetterStorageId: v.optional(v.id("_storage")),
    // Resume / CV
    resumeUrl: v.optional(v.string()),
    resumeStorageId: v.optional(v.id("_storage")),
    resumeFileName: v.optional(v.string()),
    // Additional supporting documents
    additionalDocs: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          title: v.string(),
          fileName: v.string(),
        })
      )
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewing"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_jobId", ["jobId"])
    .index("by_userId", ["userId"])
    .index("by_jobId_and_userId", ["jobId", "userId"]),

  // ── Real-Time Live Chat ───────────────────────────────────────────────────

  conversations: defineTable({
    userId: v.string(),
    userName: v.string(),
    userEmail: v.string(),
    userImage: v.optional(v.string()),
    status: v.union(
      v.literal("open"),
      v.literal("closed"),
      v.literal("archived")
    ),
    lastMessage: v.string(),
    lastMessageAt: v.number(),
    unreadByUser: v.number(),
    unreadByAdmin: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_lastMessageAt", ["lastMessageAt"]),

  chatMessages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    senderRole: v.union(v.literal("user"), v.literal("admin")),
    senderName: v.string(),
    senderImage: v.optional(v.string()),
    content: v.string(),
    attachments: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          url: v.optional(v.string()),
          name: v.string(),
          type: v.string(),
          size: v.number(),
        })
      )
    ),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_conversationId_and_createdAt", ["conversationId", "createdAt"]),
});

