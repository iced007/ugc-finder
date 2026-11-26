import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireRole } from "./lib/roles";
import {
  CATEGORIES,
  MAX_SOCIAL_ACCOUNTS,
  PLATFORMS,
  PRICE_MAX_TAKA,
  PRICE_MIN_TAKA,
  assertHttpsUrl,
  assertNonNegativeInt,
} from "./lib/validation";

const socialAccountValidator = v.object({
  platform: v.string(),
  pageUrl: v.string(),
  followerCount: v.number(),
  avgViews: v.number(),
});

/** The signed-in creator's own profile, or null if not saved yet. */
export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireRole(ctx, ["creator"]);

    return await ctx.db
      .query("creatorProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
  },
});

export const upsertMine = mutation({
  args: {
    displayName: v.string(),
    bio: v.string(),
    categories: v.array(v.string()),
    pricePerVideo: v.number(),
    socialAccounts: v.array(socialAccountValidator),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["creator"]);

    const displayName = args.displayName.trim();
    const bio = args.bio.trim();

    if (displayName.length < 2 || displayName.length > 80) {
      throw new Error("Display name must be 2 to 80 characters.");
    }
    if (bio.length === 0 || bio.length > 1000) {
      throw new Error("Bio must be 1 to 1,000 characters.");
    }
    if (args.categories.length === 0) {
      throw new Error("Choose at least one category.");
    }
    for (const category of args.categories) {
      if (!(CATEGORIES as readonly string[]).includes(category)) {
        throw new Error(`Unknown category: ${category}.`);
      }
    }
    if (new Set(args.categories).size !== args.categories.length) {
      throw new Error("Categories must not repeat.");
    }

    assertNonNegativeInt(args.pricePerVideo, "Price");
    if (args.pricePerVideo < PRICE_MIN_TAKA || args.pricePerVideo > PRICE_MAX_TAKA) {
      throw new Error(
        `Price must be between ${PRICE_MIN_TAKA} and ${PRICE_MAX_TAKA} taka.`,
      );
    }

    if (args.socialAccounts.length > MAX_SOCIAL_ACCOUNTS) {
      throw new Error(`Add up to ${MAX_SOCIAL_ACCOUNTS} social accounts.`);
    }
    const socialAccounts = args.socialAccounts.map((account) => {
      if (!(PLATFORMS as readonly string[]).includes(account.platform)) {
        throw new Error(`Unknown platform: ${account.platform}.`);
      }
      const pageUrl = account.pageUrl.trim();
      assertHttpsUrl(pageUrl, "Page URL");
      assertNonNegativeInt(account.followerCount, "Followers");
      assertNonNegativeInt(account.avgViews, "Average views");
      return { ...account, pageUrl };
    });

    const fields = {
      displayName,
      bio,
      categories: args.categories,
      pricePerVideo: args.pricePerVideo,
      socialAccounts,
    };

    const existing = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existing === null) {
      await ctx.db.insert("creatorProfiles", {
        userId: user._id,
        ...fields,
        approvedByAdmin: false,
      });
    } else {
      // approvedByAdmin is deliberately left untouched on update.
      await ctx.db.patch(existing._id, fields);
    }
  },
});
