import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { DIRECTORY_PAGE_SIZE, DIRECTORY_SCAN_LIMIT } from "./lib/config";

// Fields are listed one by one so new columns stay private by default.
function publicFields(profile: Doc<"creatorProfiles">) {
  return {
    displayName: profile.displayName,
    bio: profile.bio,
    categories: profile.categories,
    pricePerVideo: profile.pricePerVideo,
    socialAccounts: profile.socialAccounts.map((account) => ({
      platform: account.platform,
      pageUrl: account.pageUrl,
      followerCount: account.followerCount,
      avgViews: account.avgViews,
    })),
  };
}

/**
 * Public: one approved creator's profile and ready sample IDs, or null if the
 * ID is malformed, unknown or not approved. Never returns user IDs or keys.
 */
export const getPublic = query({
  args: { profileId: v.string() },
  handler: async (ctx, args) => {
    const profileId = ctx.db.normalizeId("creatorProfiles", args.profileId);

    if (profileId === null) {
      return null;
    }

    const profile = await ctx.db.get("creatorProfiles", profileId);

    if (profile === null || !profile.approvedByAdmin) {
      return null;
    }

    const samples = await ctx.db
      .query("sampleVideos")
      .withIndex("by_creator", (q) => q.eq("creatorId", profile.userId))
      .collect();

    return {
      ...publicFields(profile),
      sampleIds: samples
        .filter((sample) => sample.status === "ready")
        .map((sample) => sample._id),
    };
  },
});

/**
 * Public: one page (counted from 0) of approved creators matching the filters.
 * Looks at no more than DIRECTORY_SCAN_LIMIT profiles. Never returns user IDs,
 * sample IDs or keys.
 */
export const listPublic = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    platform: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    minFollowers: v.optional(v.number()),
    page: v.number(),
  },
  handler: async (ctx, args) => {
    const { category, platform, minPrice, maxPrice, minFollowers } = args;
    const search = args.search?.trim();
    const profiles = ctx.db.query("creatorProfiles");
    const scanned = await (
      search
        ? profiles.withSearchIndex("search_name", (q) =>
            q.search("displayName", search).eq("approvedByAdmin", true),
          )
        : profiles.withIndex("by_approved", (q) =>
            q.eq("approvedByAdmin", true),
          )
    ).take(DIRECTORY_SCAN_LIMIT);

    const matches = scanned.filter(
      (profile) =>
        (category === undefined || profile.categories.includes(category)) &&
        (platform === undefined ||
          profile.socialAccounts.some(
            (account) => account.platform === platform,
          )) &&
        (minPrice === undefined || profile.pricePerVideo >= minPrice) &&
        (maxPrice === undefined || profile.pricePerVideo <= maxPrice) &&
        (minFollowers === undefined ||
          profile.socialAccounts.some(
            (account) => account.followerCount >= minFollowers,
          )),
    );
    const start = Math.max(0, Math.floor(args.page)) * DIRECTORY_PAGE_SIZE;
    const end = start + DIRECTORY_PAGE_SIZE;

    return {
      creators: matches
        .slice(start, end)
        .map((profile) => ({
          profileId: profile._id,
          ...publicFields(profile),
        })),
      hasMore: matches.length > end,
    };
  },
});
