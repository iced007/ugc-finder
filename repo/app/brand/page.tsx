import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProfileStatusCard } from "@/components/dashboard/ProfileStatusCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsAccessToken } from "@/lib/convexAuth";

export default async function BrandPage() {
  const accessToken = await convexAuthNextjsAccessToken();
  const token = accessToken ?? undefined;
  const user = await fetchQuery(api.users.me, {}, { token });

  if (user?.role !== "brand") {
    redirect("/dashboard");
  }

  const profile = await fetchQuery(api.brandProfiles.getMine, {}, { token });

  return (
    <DashboardShell role="brand">
      <h1 className="text-2xl font-semibold">Brand dashboard</h1>
      <div className="mt-6 space-y-4">
        <ProfileStatusCard hasProfile={profile !== null} role="brand" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Business name" value={profile?.businessName ?? "Not set"} />
          <StatCard label="Category" value={profile?.category ?? "Not set"} />
          <StatCard label="Facebook page" value={profile?.facebookPageUrl ?? "Not set"} />
          <StatCard badge={{ text: "Phase 3", tone: "empty" }} label="Orders" value="No orders yet" />
        </div>
      </div>
    </DashboardShell>
  );
}
