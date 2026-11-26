import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { BrandProfileForm } from "@/components/brand/BrandProfileForm";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsAccessToken } from "@/lib/convexAuth";

export default async function BrandProfilePage() {
  const accessToken = await convexAuthNextjsAccessToken();
  const user = await fetchQuery(api.users.me, {}, { token: accessToken ?? undefined });

  if (user?.role !== "brand") {
    redirect("/dashboard");
  }

  return (
    <DashboardShell role="brand">
      <div className="mx-auto w-full max-w-3xl">
        <BrandProfileForm />
      </div>
    </DashboardShell>
  );
}
