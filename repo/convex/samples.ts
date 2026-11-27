import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  query,
  type QueryCtx,
} from "./_generated/server";
import {
  MAX_SAMPLES_PER_CREATOR,
  SAMPLE_CLEANUP_BATCH_SIZE,
  SAMPLE_PENDING_MAX_AGE_SECONDS,
  UPLOAD_URL_TTL_SECONDS,
} from "./lib/config";
import { requireRole } from "./lib/roles";

function samplesOf(ctx: QueryCtx, creatorId: Id<"users">) {
  return ctx.db
    .query("sampleVideos")
    .withIndex("by_creator", (q) => q.eq("creatorId", creatorId));
}

/** Whether people other than the owner and admins may see this sample. */
export function isPublicSample(
  sample: Pick<Doc<"sampleVideos">, "status" | "reviewStatus">,
) {
  return (
    sample.status === "ready" &&
    (sample.reviewStatus ?? "approved") === "approved"
  );
}

/** Throws unless the caller is the creator who owns this sample. */
async function requireOwnSample(ctx: QueryCtx, sampleId: Id<"sampleVideos">) {
  const user = await requireRole(ctx, ["creator"]);
  const sample = await ctx.db.get("sampleVideos", sampleId);

  if (sample === null || sample.creatorId !== user._id) {
    throw new ConvexError("Sample not found.");
  }

  return sample;
}

/** The signed-in creator's samples, newest first, or null if not a creator. */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId<"users">(ctx);

    if (userId === null) {
      return null;
    }

    const user = await ctx.db.get("users", userId);

    if (user?.role !== "creator") {
      return null;
    }

    const samples = await samplesOf(ctx, user._id).order("desc").collect();

    // Storage keys stay on the server.
    return samples.map((sample) => ({
      _id: sample._id,
      contentType: sample.contentType,
      sizeBytes: sample.sizeBytes,
      durationSeconds: sample.durationSeconds,
      status: sample.status,
      reviewStatus: sample.reviewStatus ?? "approved",
      createdAt: sample.createdAt,
    }));
  },
});

/** The calling creator's ID and sample count, pending uploads included. */
export const countForCreator = internalQuery({
  args: {},
  handler: async (ctx) => {
    const user = await requireRole(ctx, ["creator"]);
    const samples = await samplesOf(ctx, user._id).collect();
    return { userId: user._id, count: samples.length };
  },
});

export const getOwned = internalQuery({
  args: { sampleId: v.id("sampleVideos") },
  handler: async (ctx, { sampleId }) => requireOwnSample(ctx, sampleId),
});

/**
 * A sample, its creator's approval and the caller (null if signed out), or null
 * if the sample is gone. No role check here: `getPlaybackUrl` decides access.
 */
export const getForPlayback = internalQuery({
  args: { sampleId: v.id("sampleVideos") },
  handler: async (ctx, { sampleId }) => {
    const sample = await ctx.db.get("sampleVideos", sampleId);

    if (sample === null) {
      return null;
    }

    const profile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_user", (q) => q.eq("userId", sample.creatorId))
      .unique();
    const userId = await getAuthUserId<"users">(ctx);
    const user = userId === null ? null : await ctx.db.get("users", userId);

    return {
      sample,
      approvedByAdmin: profile?.approvedByAdmin === true,
      viewer: user === null ? null : { userId: user._id, role: user.role },
    };
  },
});

export const insertPending = internalMutation({
  args: {
    key: v.string(),
    contentType: v.string(),
    sizeBytes: v.number(),
    durationSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["creator"]);

    // Checked here, in the same transaction as the insert, so parallel
    // requests cannot pass the limit.
    const samples = await samplesOf(ctx, user._id).collect();
    if (samples.length >= MAX_SAMPLES_PER_CREATOR) {
      throw new ConvexError(
        `You can have up to ${MAX_SAMPLES_PER_CREATOR} samples. Delete one to add another.`,
      );
    }

    return await ctx.db.insert("sampleVideos", {
      ...args,
      creatorId: user._id,
      status: "pending",
      reviewStatus: "pending",
      createdAt: Date.now(),
    });
  },
});

export const markReady = internalMutation({
  args: { sampleId: v.id("sampleVideos") },
  handler: async (ctx, { sampleId }) => {
    await requireOwnSample(ctx, sampleId);
    await ctx.db.patch("sampleVideos", sampleId, { status: "ready" });
  },
});

export const remove = internalMutation({
  args: { sampleId: v.id("sampleVideos") },
  handler: async (ctx, { sampleId }) => {
    const sample = await requireOwnSample(ctx, sampleId);
    await ctx.db.delete("sampleVideos", sampleId);

    // The URL was signed before the row was created, so it has expired by then.
    // A PUT made with it after this delete is removed by the second delete.
    const uploadExpiresAt = sample.createdAt + UPLOAD_URL_TTL_SECONDS * 1000;
    if (uploadExpiresAt > Date.now()) {
      await ctx.scheduler.runAt(
        uploadExpiresAt,
        internal.sampleActions.deleteStoredObject,
        { key: sample.key },
      );
    }
  },
});

/** Cron: drops uploads that never finished, then deletes their objects. */
export const removeStalePending = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - SAMPLE_PENDING_MAX_AGE_SECONDS * 1000;
    const stale = await ctx.db
      .query("sampleVideos")
      .withIndex("by_status_and_createdAt", (q) =>
        q.eq("status", "pending").lt("createdAt", cutoff),
      )
      .take(SAMPLE_CLEANUP_BATCH_SIZE);

    for (const sample of stale) {
      await ctx.db.delete("sampleVideos", sample._id);
      await ctx.scheduler.runAfter(
        0,
        internal.sampleActions.deleteStoredObject,
        { key: sample.key },
      );
    }
  },
});
