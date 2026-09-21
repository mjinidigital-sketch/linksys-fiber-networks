import { mutation } from "./_generated/server";

export const init = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if it already exists
    const existing = await ctx.db
      .query("websiteContent")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();

    if (!existing) {
      await ctx.db.insert("websiteContent", {
        key: "main",
        content: {
          general: { siteName: "Linksys Fiber Networks" }
        },
        lastUpdated: new Date().toISOString(),
      });
      return "Successfully seeded baseline document!";
    }
    return "Document already exists.";
  },
});
