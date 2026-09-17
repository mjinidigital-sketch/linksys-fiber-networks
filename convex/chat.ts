import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { authComponent } from "./auth";
import { Id } from "./_generated/dataModel";

/**
 * Helper to get authenticated user and verify admin status if needed
 */
async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  try {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) return null;

    const profile = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", authUser._id))
      .unique();

    return {
      user: authUser,
      profile,
      isAdmin: profile?.role === "admin",
    };
  } catch {
    return null;
  }
}

// ── User Facing Queries & Mutations ──────────────────────────────────────────

/**
 * Get current authenticated user's conversation thread
 */
export const getUserConversation = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthenticatedUser(ctx);
    if (!auth) return null;

    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", auth.user._id))
      .first();

    return conversation;
  },
});

/**
 * Get or create a conversation for the authenticated user
 */
export const getOrCreateUserConversation = mutation({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthenticatedUser(ctx);
    if (!auth) throw new Error("Authentication required to start chat");

    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", auth.user._id))
      .first();

    const now = Date.now();

    if (existing) {
      // If profile info has changed, sync it
      if (
        existing.userName !== (auth.user.name || "User") ||
        existing.userEmail !== (auth.user.email || "") ||
        existing.userImage !== (auth.user.image || undefined)
      ) {
        await ctx.db.patch(existing._id, {
          userName: auth.user.name || "User",
          userEmail: auth.user.email || "",
          userImage: auth.user.image || undefined,
          updatedAt: now,
        });
      }
      return existing;
    }

    const conversationId = await ctx.db.insert("conversations", {
      userId: auth.user._id,
      userName: auth.user.name || "User",
      userEmail: auth.user.email || "",
      userImage: auth.user.image || undefined,
      status: "open",
      lastMessage: "Conversation started",
      lastMessageAt: now,
      unreadByUser: 0,
      unreadByAdmin: 0,
      createdAt: now,
      updatedAt: now,
    });

    const newConv = await ctx.db.get(conversationId);
    return newConv;
  },
});

/**
 * Get messages for a conversation (accessible by the thread owner or an admin)
 */
export const getConversationMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthenticatedUser(ctx);
    if (!auth) return [];

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return [];

    // Security check: must be admin OR the owner of the conversation
    if (!auth.isAdmin && conversation.userId !== auth.user._id) {
      throw new Error("Access denied to this conversation");
    }

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    // Hydrate attachment signed URLs
    const hydratedMessages = await Promise.all(
      messages.map(async (msg) => {
        if (!msg.attachments || msg.attachments.length === 0) {
          return msg;
        }

        const hydratedAttachments = await Promise.all(
          msg.attachments.map(async (att) => {
            const url = await ctx.storage.getUrl(att.storageId);
            return {
              ...att,
              url: url || att.url || undefined,
            };
          })
        );

        return {
          ...msg,
          attachments: hydratedAttachments,
        };
      })
    );

    // Sort chronologically ascending
    return hydratedMessages.sort((a, b) => a.createdAt - b.createdAt);
  },
});

/**
 * User sends a message
 */
export const sendUserMessage = mutation({
  args: {
    content: v.string(),
    attachments: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          name: v.string(),
          type: v.string(),
          size: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthenticatedUser(ctx);
    if (!auth) throw new Error("Unauthorized");

    const now = Date.now();

    // Find or create conversation
    let conversation = await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", auth.user._id))
      .first();

    let conversationId: Id<"conversations">;

    if (!conversation) {
      conversationId = await ctx.db.insert("conversations", {
        userId: auth.user._id,
        userName: auth.user.name || "User",
        userEmail: auth.user.email || "",
        userImage: auth.user.image || undefined,
        status: "open",
        lastMessage: args.content || (args.attachments?.length ? "Sent an attachment" : "New message"),
        lastMessageAt: now,
        unreadByUser: 0,
        unreadByAdmin: 1,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      conversationId = conversation._id;
      // If conversation was closed, re-open it
      await ctx.db.patch(conversationId, {
        status: "open",
        lastMessage: args.content || (args.attachments?.length ? "Sent an attachment" : "New message"),
        lastMessageAt: now,
        unreadByAdmin: (conversation.unreadByAdmin || 0) + 1,
        userName: auth.user.name || conversation.userName,
        userEmail: auth.user.email || conversation.userEmail,
        userImage: auth.user.image || conversation.userImage,
        updatedAt: now,
      });
    }

    // Insert message
    const messageId = await ctx.db.insert("chatMessages", {
      conversationId,
      senderId: auth.user._id,
      senderRole: "user",
      senderName: auth.user.name || "User",
      senderImage: auth.user.image || undefined,
      content: args.content,
      attachments: args.attachments,
      isRead: false,
      createdAt: now,
    });

    return { messageId, conversationId };
  },
});

/**
 * Admin replies to a conversation
 */
export const sendAdminMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    attachments: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          name: v.string(),
          type: v.string(),
          size: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthenticatedUser(ctx);
    if (!auth || !auth.isAdmin) {
      throw new Error("Administrator access required to reply to conversations");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const now = Date.now();

    // Insert message
    const messageId = await ctx.db.insert("chatMessages", {
      conversationId: args.conversationId,
      senderId: auth.user._id,
      senderRole: "admin",
      senderName: auth.user.name || "Support Team",
      senderImage: auth.user.image || undefined,
      content: args.content,
      attachments: args.attachments,
      isRead: false,
      createdAt: now,
    });

    // Update conversation
    await ctx.db.patch(args.conversationId, {
      lastMessage: args.content || (args.attachments?.length ? "Sent an attachment" : "Support response"),
      lastMessageAt: now,
      unreadByUser: (conversation.unreadByUser || 0) + 1,
      updatedAt: now,
    });

    return { messageId };
  },
});

/**
 * Mark messages in a conversation as read
 */
export const markMessagesAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthenticatedUser(ctx);
    if (!auth) return;

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return;

    if (args.role === "user") {
      if (conversation.userId !== auth.user._id && !auth.isAdmin) return;
      await ctx.db.patch(args.conversationId, {
        unreadByUser: 0,
      });

      // Mark unread admin messages as read
      const unreadMsgs = await ctx.db
        .query("chatMessages")
        .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
        .filter((q) => q.and(q.eq(q.field("senderRole"), "admin"), q.eq(q.field("isRead"), false)))
        .collect();

      for (const msg of unreadMsgs) {
        await ctx.db.patch(msg._id, { isRead: true });
      }
    } else if (args.role === "admin") {
      if (!auth.isAdmin) return;
      await ctx.db.patch(args.conversationId, {
        unreadByAdmin: 0,
      });

      // Mark unread user messages as read
      const unreadMsgs = await ctx.db
        .query("chatMessages")
        .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
        .filter((q) => q.and(q.eq(q.field("senderRole"), "user"), q.eq(q.field("isRead"), false)))
        .collect();

      for (const msg of unreadMsgs) {
        await ctx.db.patch(msg._id, { isRead: true });
      }
    }
  },
});

/**
 * User unread messages count
 */
export const getUserUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthenticatedUser(ctx);
    if (!auth) return 0;

    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", auth.user._id))
      .first();

    return conversation?.unreadByUser || 0;
  },
});

// ── Admin Facing Queries & Mutations ─────────────────────────────────────────

/**
 * Admin list of all conversations with optional status filter
 */
export const adminListConversations = query({
  args: {
    status: v.optional(v.union(v.literal("all"), v.literal("open"), v.literal("closed"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthenticatedUser(ctx);
    if (!auth || !auth.isAdmin) return [];

    let conversations;

    if (args.status && args.status !== "all") {
      conversations = await ctx.db
        .query("conversations")
        .withIndex("by_status", (q) => q.eq("status", args.status as "open" | "closed" | "archived"))
        .collect();
    } else {
      conversations = await ctx.db.query("conversations").collect();
    }

    // Sort by lastMessageAt descending (newest first)
    return conversations.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});

/**
 * Admin get specific conversation details with user profile
 */
export const adminGetConversationWithUser = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthenticatedUser(ctx);
    if (!auth || !auth.isAdmin) return null;

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    // Fetch user profile from users table
    const userProfile = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", conversation.userId))
      .unique();

    return {
      conversation,
      userProfile,
    };
  },
});

/**
 * Admin update conversation status (open/closed/archived)
 */
export const adminUpdateConversationStatus = mutation({
  args: {
    conversationId: v.id("conversations"),
    status: v.union(v.literal("open"), v.literal("closed"), v.literal("archived")),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthenticatedUser(ctx);
    if (!auth || !auth.isAdmin) {
      throw new Error("Admin privileges required");
    }

    await ctx.db.patch(args.conversationId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Admin delete conversation and its messages
 */
export const adminDeleteConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuthenticatedUser(ctx);
    if (!auth || !auth.isAdmin) {
      throw new Error("Admin privileges required");
    }

    // Delete all messages associated with conversation
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    // Delete conversation
    await ctx.db.delete(args.conversationId);

    return { success: true };
  },
});

/**
 * Admin get total unread count across all open conversations
 */
export const adminGetTotalUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthenticatedUser(ctx);
    if (!auth || !auth.isAdmin) return 0;

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();

    const totalUnread = conversations.reduce((acc, curr) => acc + (curr.unreadByAdmin || 0), 0);
    return totalUnread;
  },
});
