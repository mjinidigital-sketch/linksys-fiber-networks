import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { resend } from "./sendEmails";
import { components } from "./_generated/api";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

// Endpoint to directly serve Convex storage files
http.route({
  pathPrefix: "/api/storage/",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const { pathname } = new URL(req.url);
    const storageId = pathname.replace("/api/storage/", "").trim();
    if (!storageId) {
      return new Response("Missing storageId", { status: 400 });
    }

    try {
      const blob = await ctx.storage.get(storageId as any);
      if (!blob) {
        return new Response("File not found", { status: 404 });
      }

      return new Response(blob, {
        status: 200,
        headers: {
          "Content-Type": blob.type || "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err: any) {
      return new Response("Error retrieving file", { status: 500 });
    }
  }),
});

// Endpoint to send password reset email
http.route({
  path: "/api/sendPasswordResetEmail",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const body = await req.json();
      const { email, url } = body;

      if (!email || !url) {
        return new Response("Missing email or url", { status: 400 });
      }

      // Import Resend and send email directly in the HTTP endpoint
      const { Resend } = await import("@convex-dev/resend");
      const resendClient = new Resend(components.resend);
      
      await resendClient.sendEmail(ctx, {
        from: process.env.RESEND_FROM_EMAIL || "noreply@yourdomain.com",
        to: email,
        subject: "Reset your password",
        html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
      });

      return new Response("Email sent successfully", { status: 200 });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return new Response("Failed to send email", { status: 500 });
    }
  }),
});

http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    return await resend.handleResendEventWebhook(ctx, req);
  }),
});

export default http;