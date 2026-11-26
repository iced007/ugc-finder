import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireRole } from "./lib/roles";

/** Creator profiles by approval state with ready samples, or null if not admin. */
export const listCreators = query({
  args: { approved: v.boolean() },
  handler: async (ctx, { approved }) => {
    const userId = await getAuthUserId<"users">(ctx);

    if (userId === null) {
      return null;
    }

    const user = await ctx.db.get("users", userId);

    if (user?.role !== "admin") {
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

        return {
          _id: profile._id,
          displayName: profile.displayName,
          bio: profile.bio,
          categories: profile.categories,
          pricePerVideo: profile.pricePerVideo,
          socialAccounts: profile.socialAccounts,
          sampleIds: samples
            .filter((sample) => sample.status === "ready")
            .map((sample) => sample._id),
        };
      }),
    );
  },
});

export const setCreatorApproval = mutation({
  args: { profileId: v.id("creatorProfiles"), approved: v.boolean() },
  handler: async (ctx, { profileId, approved }) => {
    await requireRole(ctx, ["admin"]);

    if ((await ctx.db.get("creatorProfiles", profileId)) === null) {
      throw new ConvexError("Creator profile not found.");
    }

    await ctx.db.patch("creatorProfiles", profileId, {
      approvedByAdmin: approved,
    });
  },
});
