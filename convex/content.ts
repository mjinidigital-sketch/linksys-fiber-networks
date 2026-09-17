import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Helper to check admin permission
async function verifyAdmin(ctx: any) {
  const authUser = await authComponent.safeGetAuthUser(ctx);
  if (!authUser) {
    // If no authenticated user, check ctx.auth.getUserIdentity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Please log in as an administrator");
    }
  }

  // Look up user profile in Convex users table
  const userId = authUser ? authUser._id : (await ctx.auth.getUserIdentity())?.subject;
  if (userId) {
    const profile = await ctx.db
      .query("users")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .unique();

    // If there is a profile and role is not admin, throw error
    if (profile && profile.role !== "admin") {
      throw new Error("Forbidden: Administrator privileges required");
    }
  }
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db
      .query("websiteContent")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();

    if (!doc) {
      return null;
    }

    return doc.content;
  },
});

export const updateSection = mutation({
  args: {
    section: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);

    const doc = await ctx.db
      .query("websiteContent")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();

    const now = new Date().toISOString();

    if (!doc) {
      const initialContent = {
        [args.section]: args.data,
        lastUpdated: now,
      };
      await ctx.db.insert("websiteContent", {
        key: "main",
        content: initialContent,
        lastUpdated: now,
      });
      return initialContent;
    }

    const updatedContent = {
      ...(doc.content || {}),
      [args.section]: args.data,
      lastUpdated: now,
    };

    await ctx.db.patch(doc._id, {
      content: updatedContent,
      lastUpdated: now,
    });

    return updatedContent;
  },
});

export const saveAll = mutation({
  args: {
    content: v.any(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);

    const doc = await ctx.db
      .query("websiteContent")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();

    const now = new Date().toISOString();
    const updatedContent = {
      ...args.content,
      lastUpdated: now,
    };

    if (!doc) {
      await ctx.db.insert("websiteContent", {
        key: "main",
        content: updatedContent,
        lastUpdated: now,
      });
    } else {
      await ctx.db.patch(doc._id, {
        content: updatedContent,
        lastUpdated: now,
      });
    }

    return updatedContent;
  },
});

export const resetToDefault = mutation({
  args: {
    defaultContent: v.any(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);

    const doc = await ctx.db
      .query("websiteContent")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();

    const now = new Date().toISOString();
    const resetData = {
      ...args.defaultContent,
      lastUpdated: now,
    };

    if (!doc) {
      await ctx.db.insert("websiteContent", {
        key: "main",
        content: resetData,
        lastUpdated: now,
      });
    } else {
      await ctx.db.patch(doc._id, {
        content: resetData,
        lastUpdated: now,
      });
    }

    return resetData;
  },
});

// Patch contact info directly in DB — no auth required.
// Run: npx convex run content:patchContactInfo
export const patchContactInfo = mutation({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db
      .query("websiteContent")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();

    if (!doc) throw new Error("No content found. Seed first.");

    const existing = doc.content || {};
    const now = new Date().toISOString();

    const updatedContent = {
      ...existing,
      general: {
        ...(existing.general || {}),
        siteName: "Linksys Fiber Networks",
        displayName: "Linksys Fiber Networks",
        email: "info@linksysfiber.ke",
        phone: "+254 713 366 366",
        location: "Generis Hotel Building, Ground Floor, Molo, Nakuru County",
      },
      contact: {
        ...(existing.contact || {}),
        email: "info@linksysfiber.ke",
        location: "Generis Hotel Building, Ground Floor, Molo, Nakuru County",
      },
      footer: {
        ...(existing.footer || {}),
        copyright: "© 2026 Linksys Fiber Networks LTD. All rights reserved.",
        links: [
          { label: "Back to top", href: "#top" },
          { label: "Packages", href: "/packages" },
          { label: "Services", href: "/services" },
          { label: "Blog", href: "/blog" },
          { label: "Contact", href: "/contact" },
          { label: "Email Us", href: "mailto:info@linksysfiber.ke" },
        ],
      },
      lastUpdated: now,
    };

    await ctx.db.patch(doc._id, { content: updatedContent, lastUpdated: now });
    return { success: true, email: "info@linksysfiber.ke", phone: "+254 713 366 366" };
  },
});

