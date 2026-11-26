import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProfileStatusCard } from "@/components/dashboard/ProfileStatusCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsAccessToken } from "@/lib/convexAuth";

export const instant = false;

export default async function CreatorPage() {
  const accessToken = await convexAuthNextjsAccessToken();
  const token = accessToken ?? undefined;
  const user = await fetchQuery(api.users.me, {}, { token });

  if (user?.role !== "creator") {
    redirect("/dashboard");
  }

  const profile = await fetchQuery(api.creatorProfiles.getMine, {}, { token });

  return (
    <DashboardShell role="creator">
      <h1 className="text-2xl font-semibold">Creator dashboard</h1>
      <div className="mt-6 space-y-4">
        <ProfileStatusCard hasProfile={profile !== null} role="creator" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Price per video" value={profile ? `৳${profile.pricePerVideo.toLocaleString("en-US")}` : "Not set"} />
          <StatCard label="Social accounts" value={profile ? String(profile.socialAccounts.length) : "0"} />
          <StatCard label="Categories" value={profile && profile.categories.length > 0 ? profile.categories.join(", ") : "None yet"} />
          <StatCard
            badge={profile ? (profile.approvedByAdmin ? { text: "Approved", tone: "done" } : { text: "Pending", tone: "pending" }) : { text: "No profile", tone: "empty" }}
            label="Review status"
            value={profile ? (profile.approvedByAdmin ? "Approved" : "Waiting for review") : "Save your profile first"}
          />
          <StatCard badge={{ text: "Phase 3", tone: "empty" }} label="Orders" value="No orders yet" />
        </div>
      </div>
    </DashboardShell>
  );
}
