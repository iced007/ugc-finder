import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    role: v.optional(
      v.union(v.literal("creator"), v.literal("brand"), v.literal("admin")),
    ),
  }),
  creatorProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    bio: v.string(),
    categories: v.array(v.string()),
    pricePerVideo: v.number(),
    socialAccounts: v.array(
      v.object({
        platform: v.string(),
        pageUrl: v.string(),
        followerCount: v.number(),
        avgViews: v.number(),
      }),
    ),
    approvedByAdmin: v.boolean(),
  }).index("by_user", ["userId"]),
  brandProfiles: defineTable({
    userId: v.id("users"),
    businessName: v.string(),
    facebookPageUrl: v.string(),
    category: v.string(),
  }).index("by_user", ["userId"]),
});
