import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
import {
  MAX_SAMPLES_PER_CREATOR,
  PLAYBACK_URL_TTL_SECONDS,
  SAMPLE_CONTENT_TYPES,
  SAMPLE_MAX_BYTES,
  SAMPLE_MAX_SECONDS,
} from "./lib/config";
import { deleteObject, headObject, presignGet, presignPut } from "./lib/r2";

type SampleContentType = (typeof SAMPLE_CONTENT_TYPES)[number];

const EXTENSIONS: Record<SampleContentType, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
};

function isSampleContentType(value: string): value is SampleContentType {
  return (SAMPLE_CONTENT_TYPES as readonly string[]).includes(value);
}

export const createUploadUrl = action({
  args: {
    contentType: v.string(),
    sizeBytes: v.number(),
    durationSeconds: v.number(),
  },
  handler: async (
    ctx,
    { contentType, sizeBytes, durationSeconds },
  ): Promise<{ sampleId: Id<"sampleVideos">; uploadUrl: string }> => {
    // Throws unless the caller is a creator.
    const { userId, count } = await ctx.runQuery(
      internal.samples.countForCreator,
      {},
    );

    if (!isSampleContentType(contentType)) {
      throw new ConvexError("Upload an MP4 or MOV video.");
    }
    if (!Number.isInteger(sizeBytes) || sizeBytes <= 0) {
      throw new ConvexError("The file is empty or its size is invalid.");
    }
    if (sizeBytes > SAMPLE_MAX_BYTES) {
      throw new ConvexError(
        `The video must be ${SAMPLE_MAX_BYTES / (1024 * 1024)} MB or smaller.`,
      );
    }
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      throw new ConvexError("The video length is invalid.");
    }
    if (durationSeconds > SAMPLE_MAX_SECONDS) {
      throw new ConvexError(
        `The video must be ${SAMPLE_MAX_SECONDS} seconds or shorter.`,
      );
    }
    if (count >= MAX_SAMPLES_PER_CREATOR) {
      throw new ConvexError(
        `You can have up to ${MAX_SAMPLES_PER_CREATOR} samples. Delete one to add another.`,
      );
    }

    const key = `samples/${userId}/${crypto.randomUUID()}.${EXTENSIONS[contentType]}`;
    // Sign first, so a signing failure leaves no pending row behind.
    const uploadUrl = await presignPut(key, contentType, sizeBytes);
    const sampleId: Id<"sampleVideos"> = await ctx.runMutation(
      internal.samples.insertPending,
      { key, contentType, sizeBytes, durationSeconds },
    );

    return { sampleId, uploadUrl };
  },
});

export const confirmUpload = action({
  args: { sampleId: v.id("sampleVideos") },
  handler: async (ctx, { sampleId }): Promise<null> => {
    const sample = await ctx.runQuery(internal.samples.getOwned, { sampleId });
    const { status, sizeBytes } = await headObject(sample.key);

    if (status === 404) {
      throw new ConvexError("The upload has not arrived. Please try again.");
    }
    if (status !== 200) {
      throw new ConvexError("Could not check the upload. Please try again.");
    }
    if (sizeBytes !== sample.sizeBytes) {
      throw new ConvexError(
        "The uploaded file does not match the one you chose. Delete it and try again.",
      );
    }

    await ctx.runMutation(internal.samples.markReady, { sampleId });
    return null;
  },
});

export const deleteSample = action({
  args: { sampleId: v.id("sampleVideos") },
  handler: async (ctx, { sampleId }): Promise<null> => {
    const sample = await ctx.runQuery(internal.samples.getOwned, { sampleId });
    // Object first: if this fails, the row stays and the delete can be retried.
    await deleteObject(sample.key);
    await ctx.runMutation(internal.samples.remove, { sampleId });
    return null;
  },
});

/**
 * A short-lived URL to stream a sample. The owner and admins get any status;
 * everyone else, signed in or not, only `ready` samples of approved creators.
 */
export const getPlaybackUrl = action({
  args: { sampleId: v.id("sampleVideos") },
  handler: async (
    ctx,
    { sampleId },
  ): Promise<{ url: string; expiresAt: number }> => {
    const found = await ctx.runQuery(internal.samples.getForPlayback, {
      sampleId,
    });
    const allowed =
      found !== null &&
      (found.viewer?.role === "admin" ||
        found.viewer?.userId === found.sample.creatorId ||
        (found.sample.status === "ready" && found.approvedByAdmin));

    if (!allowed) {
      throw new ConvexError("This video is not available.");
    }

    // Taken before signing, so it is never later than the real expiry.
    const expiresAt = Date.now() + PLAYBACK_URL_TTL_SECONDS * 1000;
    return { url: await presignGet(found.sample.key), expiresAt };
  },
});
