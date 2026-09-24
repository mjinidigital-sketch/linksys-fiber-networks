import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { components, internal } from "./_generated/api";
import { authComponent } from "./auth";

export const getCurrentUserWithProfile = query({
  args: {},
  handler: async (ctx) => {
    try {
      const authUser = await authComponent.safeGetAuthUser(ctx);
      if (!authUser) {
        return null;
      }

      const profile = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", authUser._id))
        .unique();

      let role = profile?.role;
      if (!role) {
        // If profile does not exist yet, check if any admins exist in the table
        const anyAdmin = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("role"), "admin"))
          .first();

        // If no admins exist yet, grant admin role to the first authenticated user
        role = !anyAdmin ? "admin" : "user";
      }

      return {
        user: authUser,
        profile: profile || null,
        role: role || "user",
      };
    } catch {
      return null;
    }
  },
});

export const ensureCurrentUserProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      return null;
    }

    let existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", authUser._id))
      .unique();

    if (!existing && authUser.email) {
      existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", authUser.email))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          userId: authUser._id,
          updatedAt: Date.now(),
        });
      }
    }

    if (existing) {
      return existing;
    }

    const anyAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .first();

    const isFirstAdmin = !anyAdmin;
    const now = Date.now();

    const newProfile = {
      userId: authUser._id,
      email: authUser.email || "",
      name: authUser.name || "Administrator",
      role: isFirstAdmin ? ("admin" as const) : ("user" as const),
      profilePic: authUser.image ?? undefined,
      socials: [
        { platform: "github", label: "GitHub", url: "https://github.com" },
        { platform: "twitter", label: "X / Twitter", url: "https://twitter.com" },
        { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com" },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const id = await ctx.db.insert("users", newProfile);
    return { _id: id, ...newProfile };
  },
});

/**
 * Internal mutation used by Better Auth signup/update hooks
 * to guarantee that a user document is created or updated in the Convex users table.
 */
export const createUserProfileFromAuth = internalMutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!existing && args.email) {
      existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .unique();
    }

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        userId: args.userId,
        name: args.name || existing.name,
        email: args.email || existing.email,
        profilePic: args.image ?? existing.profilePic,
        phone: args.phone ?? existing.phone,
        updatedAt: now,
      });
      return existing._id;
    }

    const anyAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .first();

    const role = !anyAdmin ? ("admin" as const) : ("user" as const);

    const newId = await ctx.db.insert("users", {
      userId: args.userId,
      email: args.email,
      name: args.name || "User",
      role,
      profilePic: args.image,
      phone: args.phone,
      socials: [
        { platform: "github", label: "GitHub", url: "https://github.com" },
        { platform: "twitter", label: "X / Twitter", url: "https://twitter.com" },
        { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com" },
      ],
      createdAt: now,
      updatedAt: now,
    });

    return newId;
  },
});

/**
 * Internal query that fetches one page of users from the Better Auth component.
 * Actions cannot call component-internal functions directly — they must go through
 * an app-level query/mutation wrapper like this one.
 */
export const getAuthUserPage = internalQuery({
  args: {
    cursor: v.union(v.string(), v.null()),
    numItems: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.runQuery(components.betterAuth.adapter.findMany, {
      model: "user",
      paginationOpts: {
        numItems: args.numItems,
        cursor: args.cursor,
      },
    });
  },
});

/**
 * Internal mutation that upserts one page of Better Auth users into the Convex users table.
 * Called once per page from the `syncExistingUsers` action so each batch runs in its own
 * transaction and never hits Convex's per-transaction read/write limits.
 */
export const syncUsersBatch = internalMutation({
  args: {
    users: v.array(
      v.object({
        _id: v.string(),
        email: v.optional(v.string()),
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        phoneNumber: v.optional(v.string()),
        createdAt: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
      })
    ),
    overwriteExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let created = 0;
    let updated = 0;

    for (const authUser of args.users) {
      const userId = authUser._id;
      const email = authUser.email ?? "";
      const name = authUser.name ?? (email ? email.split("@")[0] : "User");
      const image = authUser.image ?? undefined;
      const phone = authUser.phoneNumber ?? undefined;

      let existing = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();

      if (!existing && email) {
        existing = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", email))
          .unique();
      }

      const now = Date.now();

      if (existing) {
        if (args.overwriteExisting || existing.userId !== userId) {
          await ctx.db.patch(existing._id, {
            userId,
            name: existing.name || name,
            email: existing.email || email,
            profilePic: existing.profilePic || image,
            phone: existing.phone || phone,
            updatedAt: now,
          });
          updated++;
        }
      } else {
        const anyAdmin = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("role"), "admin"))
          .first();

        const role = !anyAdmin ? ("admin" as const) : ("user" as const);

        await ctx.db.insert("users", {
          userId,
          email,
          name,
          role,
          profilePic: image,
          phone,
          socials: [
            { platform: "github", label: "GitHub", url: "https://github.com" },
            { platform: "twitter", label: "X / Twitter", url: "https://twitter.com" },
            { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com" },
          ],
          createdAt: typeof authUser.createdAt === "number" ? authUser.createdAt : now,
          updatedAt: typeof authUser.updatedAt === "number" ? authUser.updatedAt : now,
        });
        created++;
      }
    }

    return { created, updated };
  },
});

/**
 * Public action to sync all existing Better Auth users into the Convex users table.
 * Runs the pagination loop outside any transaction (actions have no DB transaction limits)
 * and commits each page via `syncUsersBatch` — its own isolated mutation transaction.
 */
export const syncExistingUsers = action({
  args: {
    overwriteExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let cursor: string | null = null;
    let isDone = false;
    let totalFound = 0;
    let created = 0;
    let updated = 0;

    while (!isDone) {
      const result: {
        page: Array<{
          _id: string;
          email?: string;
          name?: string;
          image?: string | null;
          phoneNumber?: string | null;
          createdAt?: number;
          updatedAt?: number;
        }>;
        isDone: boolean;
        continueCursor: string;
      } = await ctx.runQuery(internal.users.getAuthUserPage, {
        cursor,
        numItems: 50,
      });

      if (result.page.length > 0) {
        // Normalize nullable fields before passing across the action→mutation boundary
        const batch = result.page.map((u) => ({
          _id: u._id,
          email: u.email ?? undefined,
          name: u.name ?? undefined,
          image: u.image ?? undefined,
          phoneNumber: u.phoneNumber ?? undefined,
          createdAt: typeof u.createdAt === "number" ? u.createdAt : undefined,
          updatedAt: typeof u.updatedAt === "number" ? u.updatedAt : undefined,
        }));

        const batchResult: { created: number; updated: number } =
          await ctx.runMutation(internal.users.syncUsersBatch, {
            users: batch,
            overwriteExisting: args.overwriteExisting,
          });

        totalFound += result.page.length;
        created += batchResult.created;
        updated += batchResult.updated;
      }

      isDone = result.isDone;
      cursor = result.continueCursor ?? null;
    }

    return {
      success: true,
      totalFound,
      created,
      updated,
      alreadyInSync: totalFound - created - updated,
    };
  },
});

export const syncUser = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    const now = Date.now();

    if (existing) {
      // Update name/email/image if changed
      await ctx.db.patch(existing._id, {
        name: args.name || existing.name,
        email: args.email || existing.email,
        profilePic: args.image || existing.profilePic,
        updatedAt: now,
      });
      return existing;
    }

    // Check if any users exist in the table. If 0 users, first user becomes admin!
    const allUsers = await ctx.db.query("users").take(2);
    const isFirstUser = allUsers.length === 0;

    const newProfile = {
      userId: args.userId,
      email: args.email,
      name: args.name || "User",
      role: isFirstUser ? ("admin" as const) : ("user" as const),
      profilePic: args.image,
      socials: [
        { platform: "github", label: "GitHub", url: "https://github.com" },
        { platform: "twitter", label: "X / Twitter", url: "https://twitter.com" },
        { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com" },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const id = await ctx.db.insert("users", newProfile);
    return { _id: id, ...newProfile };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").order("desc").collect();
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("user"), v.literal("editor")),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new Error("Unauthorized");
    }

    const currentCallerProfile = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", authUser._id))
      .unique();

    if (currentCallerProfile && currentCallerProfile.role !== "admin") {
      throw new Error("Only administrators can update user roles");
    }

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!targetUser) {
      throw new Error("User not found");
    }

    await ctx.db.patch(targetUser._id, {
      role: args.role,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.string(),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    phone: v.optional(v.string()),
    profilePic: v.optional(v.string()),
    profilePicStorageId: v.optional(v.id("_storage")),
    socials: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          url: v.string(),
          label: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new Error("Unauthorized");
    }

    const currentCallerProfile = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", authUser._id))
      .unique();

    const isSelf = args.userId === authUser._id;
    const isAdmin = currentCallerProfile?.role === "admin";

    if (!isSelf && !isAdmin) {
      throw new Error("Only administrators can edit other users' profiles");
    }

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    const now = Date.now();

    if (!targetUser) {
      const id = await ctx.db.insert("users", {
        userId: args.userId,
        name: args.name || authUser.name || "User",
        email: authUser.email || "",
        role: "user",
        bio: args.bio,
        phone: args.phone,
        profilePic: args.profilePic,
        profilePicStorageId: args.profilePicStorageId,
        socials: args.socials,
        createdAt: now,
        updatedAt: now,
      });
      return { _id: id };
    }

    await ctx.db.patch(targetUser._id, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.bio !== undefined && { bio: args.bio }),
      ...(args.phone !== undefined && { phone: args.phone }),
      ...(args.profilePic !== undefined && { profilePic: args.profilePic }),
      ...(args.profilePicStorageId !== undefined && { profilePicStorageId: args.profilePicStorageId }),
      ...(args.socials !== undefined && { socials: args.socials }),
      updatedAt: now,
    });

    return { success: true };
  },
});
