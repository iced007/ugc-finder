import { v } from "convex/values";

import { internalMutation } from "./_generated/server";

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
