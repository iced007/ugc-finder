/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test, vi } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";

// Convex Auth runs as a component that convex-test does not load, so the user
// lookup is mocked: the identity's subject (set by withIdentity) is the user ID.
vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: async (ctx: {
    auth: { getUserIdentity: () => Promise<{ subject: string } | null> };
  }) => (await ctx.auth.getUserIdentity())?.subject ?? null,
}));

// Includes _generated (convex-test uses it to find the functions root).
const modules = import.meta.glob(["./**/*.{ts,js}", "!./**/*.{test,d}.ts"]);

describe("creatorProfiles", () => {
  test("getMine returns null when signed out", async () => {
    const t = convexTest(schema, modules);

    expect(await t.query(api.creatorProfiles.getMine, {})).toBeNull();
  });

  test("upsertMine rejects a brand", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run((ctx) =>
      ctx.db.insert("users", { role: "brand" }),
    );

    await expect(
      t.withIdentity({ subject: userId }).mutation(api.creatorProfiles.upsertMine, {
        displayName: "Test Brand",
        bio: "Not a creator.",
        categories: ["food"],
        pricePerVideo: 1000,
        socialAccounts: [],
      }),
    ).rejects.toThrow("You do not have permission to do that.");
  });
});
