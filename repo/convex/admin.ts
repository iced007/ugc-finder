import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";

import { mutation, query, type QueryCtx } from "./_generated/server";
import { requireRole } from "./lib/roles";

async function isAdmin(ctx: QueryCtx) {
  const userId = await getAuthUserId<"users">(ctx);

  if (userId === null) {
    return false;
  }

  return (await ctx.db.get("users", userId))?.role === "admin";
}

/** Creator profiles by approval state with ready samples, or null if not admin. */
export const listCreators = query({
  args: { approved: v.boolean() },
  handler: async (ctx, { approved }) => {
    if (!(await isAdmin(ctx))) {
      return null;
    }

    const profiles = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_approved", (q) => q.eq("approvedByAdmin", approved))
      .collect();

    return await Promise.all(
      profiles.map(async (profile) => {
        const samples = await ctx.db
          .query("sampleVideos")
          .withIndex("by_creator", (q) => q.eq("creatorId", profile.userId))
          .order("desc")
          .collect();
        const ready = samples.filter((sample) => sample.status === "ready");

        return {
          _id: profile._id,
          displayName: profile.displayName,
          bio: profile.bio,
          categories: profile.categories,
          pricePerVideo: profile.pricePerVideo,
          socialAccounts: profile.socialAccounts,
          samples: ready.map((sample) => ({
            _id: sample._id,
            reviewStatus: sample.reviewStatus ?? "approved",
          })),
        };
      }),
    );
  },
});

/**
 * Uploaded samples of approved creators waiting for review, or null if not
 * admin.
 */
export const listSamplesForReview = query({
  args: {},
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) {
      return null;
    }

    const samples = await ctx.db
      .query("sampleVideos")
      .withIndex("by_review", (q) =>
        q.eq("reviewStatus", "pending").eq("status", "ready"),
      )
      .collect();
    const waiting = await Promise.all(
      samples.map(async (sample) => {
        const profile = await ctx.db
          .query("creatorProfiles")
          .withIndex("by_user", (q) => q.eq("userId", sample.creatorId))
          .unique();

        return profile?.approvedByAdmin
          ? {
              _id: sample._id,
              profileId: profile._id,
              displayName: profile.displayName,
            }
          : null;
      }),
    );

    return waiting.filter((sample) => sample !== null);
  },
});

export const setSampleReview = mutation({
  args: {
    sampleId: v.id("sampleVideos"),
    decision: v.union(v.literal("approved"), v.literal("declined")),
  },
  handler: async (ctx, { sampleId, decision }) => {
    await requireRole(ctx, ["admin"]);

    if ((await ctx.db.get("sampleVideos", sampleId)) === null) {
      throw new ConvexError("Sample not found.");
    }

    await ctx.db.patch("sampleVideos", sampleId, { reviewStatus: decision });
  },
});

export const setCreatorApproval = mutation({
  args: { profileId: v.id("creatorProfiles"), approved: v.boolean() },
  handler: async (ctx, { profileId, approved }) => {
    await requireRole(ctx, ["admin"]);

    const profile = await ctx.db.get("creatorProfiles", profileId);

    if (profile === null) {
      throw new ConvexError("Creator profile not found.");
    }

    await ctx.db.patch("creatorProfiles", profileId, {
      approvedByAdmin: approved,
    });

    // Approval covers the samples the creator has now; declined ones stay so.
    if (approved) {
      const samples = await ctx.db
        .query("sampleVideos")
        .withIndex("by_creator", (q) => q.eq("creatorId", profile.userId))
        .collect();

      for (const sample of samples) {
        if (sample.reviewStatus === "pending") {
          await ctx.db.patch("sampleVideos", sample._id, {
            reviewStatus: "approved",
          });
        }
      }
    }
  },
});
