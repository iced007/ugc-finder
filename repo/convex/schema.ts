import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    role: v.optional(
      v.union(v.literal("creator"), v.literal("brand"), v.literal("admin")),
    ),
  }),
});
