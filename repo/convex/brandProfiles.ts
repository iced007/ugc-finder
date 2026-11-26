import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireRole } from "./lib/roles";
import { CATEGORIES, assertHttpsUrl } from "./lib/validation";

/** The signed-in brand's own profile, or null if not saved yet. */
export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireRole(ctx, ["brand"]);

    return await ctx.db
      .query("brandProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
  },
});

export const upsertMine = mutation({
  args: {
    businessName: v.string(),
    facebookPageUrl: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["brand"]);

    const businessName = args.businessName.trim();
    const facebookPageUrl = args.facebookPageUrl.trim();

    if (businessName.length < 2 || businessName.length > 80) {
      throw new Error("Business name must be 2 to 80 characters.");
    }
    assertHttpsUrl(facebookPageUrl, "Facebook page link");
    if (!(CATEGORIES as readonly string[]).includes(args.category)) {
      throw new Error(`Unknown category: ${args.category}.`);
    }

    const fields = { businessName, facebookPageUrl, category: args.category };

    const existing = await ctx.db
      .query("brandProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existing === null) {
      await ctx.db.insert("brandProfiles", { userId: user._id, ...fields });
    } else {
      await ctx.db.patch(existing._id, fields);
    }
  },
});
