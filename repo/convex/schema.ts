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
  })
    .index("by_user", ["userId"])
    .index("by_approved", ["approvedByAdmin"])
    .searchIndex("search_name", {
      searchField: "displayName",
      filterFields: ["approvedByAdmin"],
    }),
  brandProfiles: defineTable({
    userId: v.id("users"),
    businessName: v.string(),
    facebookPageUrl: v.string(),
    category: v.string(),
  }).index("by_user", ["userId"]),
  sampleVideos: defineTable({
    creatorId: v.id("users"),
    key: v.string(),
    contentType: v.string(),
    sizeBytes: v.number(),
    durationSeconds: v.number(),
    status: v.union(v.literal("pending"), v.literal("ready")),
    // Missing means approved: samples uploaded before reviews stay public.
    reviewStatus: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("declined"),
      ),
    ),
    createdAt: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_status_and_createdAt", ["status", "createdAt"])
    .index("by_review", ["reviewStatus", "status"]),
});
