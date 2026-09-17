import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
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

      return {
        user: authUser,
        profile: profile || null,
        role: profile?.role || "user",
      };
    } catch {
      return null;
    }
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
