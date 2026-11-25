import { v } from "convex/values";

import { internalMutation, mutation, query } from "./_generated/server";
import { requireUser } from "./lib/roles";

/** Creates the application user row for a new username-password account. */
export const createUser = internalMutation({
  args: {
    method: v.object({
      name: v.literal("usernamePassword"),
      profile: v.object({}),
    }),
  },
  returns: v.id("users"),
  handler: async (ctx) => {
    return await ctx.db.insert("users", {});
  },
});

export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      return null;
    }

    const user = await requireUser(ctx);

    return { _id: user._id, role: user.role };
  },
});

export const setRole = mutation({
  args: { role: v.union(v.literal("creator"), v.literal("brand")) },
  handler: async (ctx, { role }) => {
    const user = await requireUser(ctx);

    if (user.role !== undefined) {
      throw new Error("Your role has already been set.");
    }

    await ctx.db.patch(user._id, { role });
  },
});
