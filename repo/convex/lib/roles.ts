import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export const ROLES = ["creator", "brand", "admin"] as const;

export type Role = (typeof ROLES)[number];

type AuthContext = QueryCtx | MutationCtx;

export async function requireUser(ctx: AuthContext) {
  const userId = await getAuthUserId<"users">(ctx);

  if (userId === null) {
    throw new Error("You must be signed in to do that.");
  }

  const user = await ctx.db.get("users", userId);

  if (user === null) {
    throw new Error("Signed-in user was not found.");
  }

  return user;
}

export async function requireRole(
  ctx: AuthContext,
  allowed: readonly Role[],
) {
  const user = await requireUser(ctx);

  if (user.role === undefined) {
    throw new Error("Choose a role before doing that.");
  }

  if (!allowed.includes(user.role)) {
    throw new Error("You do not have permission to do that.");
  }

  return user;
}
