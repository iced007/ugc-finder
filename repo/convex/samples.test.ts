/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test, vi } from "vitest";

import { api, internal } from "./_generated/api";
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

const upload = {
  key: "samples/test/video.mp4",
  contentType: "video/mp4",
  sizeBytes: 1000,
  durationSeconds: 10,
};

async function setup({ approved }: { approved: boolean }) {
  const t = convexTest(schema, modules);
  const ids = await t.run(async (ctx) => {
    const creatorId = await ctx.db.insert("users", { role: "creator" });
    const profileId = await ctx.db.insert("creatorProfiles", {
      userId: creatorId,
      displayName: "Test Creator",
      bio: "Makes videos.",
      categories: ["food"],
      pricePerVideo: 1000,
      socialAccounts: [],
      approvedByAdmin: approved,
    });
    return {
      creatorId,
      profileId,
      brandId: await ctx.db.insert("users", { role: "brand" }),
      adminId: await ctx.db.insert("users", { role: "admin" }),
    };
  });
  const creator = t.withIdentity({ subject: ids.creatorId });
  const brand = t.withIdentity({ subject: ids.brandId });
  const admin = t.withIdentity({ subject: ids.adminId });

  // A finished upload, made the way the upload actions make it.
  const sampleId = await creator.mutation(
    internal.samples.insertPending,
    upload,
  );
  await creator.mutation(internal.samples.markReady, { sampleId });

  const publicIds = async () =>
    (await t.query(api.creators.getPublic, { profileId: ids.profileId }))
      ?.sampleIds;

  return { t, ...ids, creator, brand, admin, sampleId, publicIds };
}

describe("sample review", () => {
  test("a new sample is public only once approved", async () => {
    const { t, admin, sampleId, publicIds } = await setup({ approved: true });

    expect(await publicIds()).toEqual([]);
    expect(await admin.query(api.admin.listSamplesForReview, {})).toMatchObject(
      [{ _id: sampleId, displayName: "Test Creator" }],
    );
    await expect(
      t.action(api.sampleActions.getPlaybackUrl, { sampleId }),
    ).rejects.toThrow("This video is not available.");

    await admin.mutation(api.admin.setSampleReview, {
      sampleId,
      decision: "approved",
    });
    expect(await publicIds()).toEqual([sampleId]);

    await admin.mutation(api.admin.setSampleReview, {
      sampleId,
      decision: "declined",
    });
    expect(await publicIds()).toEqual([]);
    expect(await admin.query(api.admin.listSamplesForReview, {})).toEqual([]);
  });

  test("approving a creator makes their pending samples public", async () => {
    const { admin, profileId, sampleId, publicIds } = await setup({
      approved: false,
    });

    expect(await admin.query(api.admin.listSamplesForReview, {})).toEqual([]);
    await admin.mutation(api.admin.setCreatorApproval, {
      profileId,
      approved: true,
    });
    expect(await publicIds()).toEqual([sampleId]);
  });

  test("a sample with no reviewStatus stays public", async () => {
    const { t, creator, creatorId, sampleId, publicIds } = await setup({
      approved: true,
    });
    const oldId = await t.run((ctx) =>
      ctx.db.insert("sampleVideos", {
        ...upload,
        creatorId,
        status: "ready",
        createdAt: Date.now(),
      }),
    );

    expect(await publicIds()).toEqual([oldId]);
    expect(await creator.query(api.samples.listMine, {})).toMatchObject([
      { _id: oldId, reviewStatus: "approved" },
      { _id: sampleId, reviewStatus: "pending" },
    ]);
  });

  test("only admins can review samples", async () => {
    const { t, creator, brand, sampleId } = await setup({ approved: true });

    for (const caller of [creator, brand]) {
      await expect(
        caller.mutation(api.admin.setSampleReview, {
          sampleId,
          decision: "approved",
        }),
      ).rejects.toThrow("You do not have permission to do that.");
    }
    for (const caller of [t, creator, brand]) {
      expect(await caller.query(api.admin.listSamplesForReview, {})).toBeNull();
    }
  });
});
