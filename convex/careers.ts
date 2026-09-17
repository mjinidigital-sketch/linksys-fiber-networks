import { v } from "convex/values";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";

// ─── Auth Helpers ─────────────────────────────────────────────────────────

async function requireAdminOrEditor(ctx: QueryCtx | MutationCtx) {
  const authUser = await authComponent.safeGetAuthUser(ctx as any);
  if (!authUser) throw new Error("Unauthorized");

  const profile = await (ctx as any).db
    .query("users")
    .withIndex("by_userId", (q: any) => q.eq("userId", authUser._id))
    .unique();

  if (!profile || (profile.role !== "admin" && profile.role !== "editor")) {
    throw new Error("Forbidden: admin or editor role required");
  }
  return { authUser, profile };
}

async function requireAdmin(ctx: MutationCtx) {
  const authUser = await authComponent.safeGetAuthUser(ctx as any);
  if (!authUser) throw new Error("Unauthorized");

  const profile = await (ctx as any).db
    .query("users")
    .withIndex("by_userId", (q: any) => q.eq("userId", authUser._id))
    .unique();

  if (!profile || profile.role !== "admin") {
    throw new Error("Forbidden: admin role required");
  }
  return { authUser, profile };
}

// ─── Jobs — Public ────────────────────────────────────────────────────────

export const listPublishedJobs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .take(100);
  },
});

export const getJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

// ─── File Storage ─────────────────────────────────────────────────────────

/** Generate a short-lived presigned upload URL. Requires the user to be signed in. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx as any);
    if (!authUser) throw new Error("You must be signed in to upload files.");
    return await ctx.storage.generateUploadUrl();
  },
});

/** Get the public URL for a stored file by its storage ID. */
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// ─── Jobs — Admin ─────────────────────────────────────────────────────────

export const listAllJobs = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminOrEditor(ctx);
    return await ctx.db.query("jobs").order("desc").take(200);
  },
});

export const createJob = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const { profile } = await requireAdminOrEditor(ctx);
    const now = Date.now();
    return await ctx.db.insert("jobs", {
      ...args,
      authorId: profile._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateJob = mutation({
  args: {
    jobId: v.id("jobs"),
    title: v.optional(v.string()),
    department: v.optional(v.string()),
    location: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("full-time"),
        v.literal("part-time"),
        v.literal("contract"),
        v.literal("remote")
      )
    ),
    description: v.optional(v.string()),
    requirements: v.optional(v.array(v.string())),
    salary: v.optional(v.string()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdminOrEditor(ctx);
    const { jobId, ...fields } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(jobId, patch as any);
    return { success: true };
  },
});

export const deleteJob = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Delete all applications for this job first
    const apps = await ctx.db
      .query("applications")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .collect();

    for (const app of apps) {
      await ctx.db.delete(app._id);
    }

    await ctx.db.delete(args.jobId);
    return { success: true };
  },
});

// ─── Applications — Authenticated User ───────────────────────────────────

export const applyToJob = mutation({
  args: {
    jobId: v.id("jobs"),
    applicantName: v.string(),
    applicantEmail: v.string(),
    phone: v.optional(v.string()),
    // Cover letter — text OR uploaded file
    coverLetter: v.optional(v.string()),
    coverLetterStorageId: v.optional(v.id("_storage")),
    // Resume
    resumeUrl: v.optional(v.string()),
    resumeStorageId: v.optional(v.id("_storage")),
    resumeFileName: v.optional(v.string()),
    // Additional docs
    additionalDocs: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          title: v.string(),
          fileName: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx as any);
    if (!authUser) throw new Error("You must be signed in to apply.");

    const tokenId: string = authUser._id;

    // Must provide cover letter (text or file)
    if (!args.coverLetter?.trim() && !args.coverLetterStorageId) {
      throw new Error("Please provide a cover letter (text or uploaded file).");
    }

    // Prevent duplicate applications
    const existing = await ctx.db
      .query("applications")
      .withIndex("by_jobId_and_userId", (q) =>
        q.eq("jobId", args.jobId).eq("userId", tokenId)
      )
      .unique();

    if (existing) {
      throw new Error("You have already applied to this position.");
    }

    // Verify job exists and is published
    const job = await ctx.db.get(args.jobId);
    if (!job || !job.published) {
      throw new Error("Job listing not found or no longer available.");
    }

    const now = Date.now();
    return await ctx.db.insert("applications", {
      jobId: args.jobId,
      userId: tokenId,
      applicantName: args.applicantName,
      applicantEmail: args.applicantEmail,
      phone: args.phone,
      coverLetter: args.coverLetter,
      coverLetterStorageId: args.coverLetterStorageId,
      resumeUrl: args.resumeUrl,
      resumeStorageId: args.resumeStorageId,
      resumeFileName: args.resumeFileName,
      additionalDocs: args.additionalDocs,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const hasApplied = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx as any);
    if (!authUser) return false;

    const tokenId: string = authUser._id;

    const existing = await ctx.db
      .query("applications")
      .withIndex("by_jobId_and_userId", (q) =>
        q.eq("jobId", args.jobId).eq("userId", tokenId)
      )
      .unique();

    return existing !== null;
  },
});

export const getMyApplications = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx as any);
    if (!authUser) return [];

    const tokenId: string = authUser._id;

    const apps = await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", tokenId))
      .order("desc")
      .take(50);

    return await Promise.all(
      apps.map(async (app) => {
        const job = await ctx.db.get(app.jobId);
        return { ...app, job };
      })
    );
  },
});

// ─── Applications — Admin ─────────────────────────────────────────────────

export const listAllApplications = query({
  args: { jobId: v.optional(v.id("jobs")) },
  handler: async (ctx, args) => {
    await requireAdminOrEditor(ctx);

    const apps = args.jobId
      ? await ctx.db
          .query("applications")
          .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId!))
          .order("desc")
          .take(200)
      : await ctx.db.query("applications").order("desc").take(200);

    return await Promise.all(
      apps.map(async (app) => {
        const job = await ctx.db.get(app.jobId);
        return { ...app, jobTitle: job?.title ?? "Deleted Job" };
      })
    );
  },
});

export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewing"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdminOrEditor(ctx);
    await ctx.db.patch(args.applicationId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const deleteApplication = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    await requireAdminOrEditor(ctx);
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new Error("Application not found");

    // Clean up uploaded files in storage if any exist
    if (app.coverLetterStorageId) {
      try {
        await ctx.storage.delete(app.coverLetterStorageId);
      } catch (e) {
        // file might already be removed
      }
    }
    if (app.resumeStorageId) {
      try {
        await ctx.storage.delete(app.resumeStorageId);
      } catch (e) {
        // file might already be removed
      }
    }
    if (app.additionalDocs && app.additionalDocs.length > 0) {
      for (const doc of app.additionalDocs) {
        if (doc.storageId) {
          try {
            await ctx.storage.delete(doc.storageId);
          } catch (e) {
            // file might already be removed
          }
        }
      }
    }

    await ctx.db.delete(args.applicationId);
    return { success: true };
  },
});

export const seedSampleJobs = mutation({
  args: {},
  handler: async (ctx) => {
    const { profile } = await requireAdminOrEditor(ctx);
    const existing = await ctx.db.query("jobs").collect();
    if (existing.length > 0) {
      return { seeded: false, count: existing.length };
    }

    const sampleJobs = [
      {
        title: "Fiber Optic Installation Technician",
        department: "Field Engineering",
        location: "Molo CBD & Environs",
        type: "full-time" as const,
        description: "Perform fiber cable drop installations, splicing, mounting subscriber ONUs, and configuring customer Wi-Fi routers across Molo.",
        requirements: [
          "Experience with fiber optic splicing & OTDR measurement tools",
          "Valid motorcycle or motor vehicle driving license",
          "Knowledge of basic IP networking & subscriber router configuration",
          "Strong customer service skills and problem-solving ability",
        ],
        salary: "KES 35,000 - 45,000 / month",
        published: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        title: "Network Operations Support Engineer",
        department: "Network Infrastructure",
        location: "Molo Office (Generis Hotel Bldg)",
        type: "full-time" as const,
        description: "Monitor fiber ISP backbone health, configure MikroTik and Ubiquiti routing gear, resolve client support tickets, and ensure high uptime.",
        requirements: [
          "CCNA or MikroTik (MTCNA) certification preferred",
          "Solid knowledge of PPPoE, VLANs, and IP routing",
          "Minimum 1 year experience in an ISP or Network Administrator role",
          "Good communication and troubleshooting skills under pressure",
        ],
        salary: "KES 40,000 - 60,000 / month",
        published: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        title: "Customer Care & Sales Representative",
        department: "Customer Relations",
        location: "Molo Office",
        type: "full-time" as const,
        description: "Serve walk-in subscribers at our Generis Hotel building office, handle phone/WhatsApp inquiries, manage billing subscriptions, and onboard new clients.",
        requirements: [
          "Diploma or Degree in Sales, Marketing, IT, or related field",
          "Fluent in Swahili and English with excellent telephone etiquette",
          "Proficient with computer tools and customer relation software",
          "Warm, friendly personality and strong sales drive",
        ],
        salary: "KES 25,000 - 35,000 / month + Commission",
        published: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        title: "CCTV & Security Systems Installer",
        department: "Technical Services",
        location: "Molo & Nakuru County",
        type: "contract" as const,
        description: "Install, wire, and configure IP and HD CCTV camera systems, NVRs, and remote mobile viewing for commercial clients, schools, and homes.",
        requirements: [
          "Hands-on experience in CCTV camera installation and LAN cabling",
          "Familiarity with Hikvision and Dahua security equipment",
          "Capability to work at heights and execute clean cable trunking",
        ],
        salary: "KES 1,500 - 2,500 / day per assignment",
        published: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    for (const j of sampleJobs) {
      await ctx.db.insert("jobs", j);
    }

    return { seeded: true, count: sampleJobs.length };
  },
});

