import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { CreatorProfileForm } from "@/components/creator/CreatorProfileForm";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsAccessToken } from "@/lib/convexAuth";

export default async function CreatorProfilePage() {
  const accessToken = await convexAuthNextjsAccessToken();
  const user = await fetchQuery(api.users.me, {}, { token: accessToken ?? undefined });

  if (user?.role !== "creator") {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-stone-900 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <CreatorProfileForm />
      </div>
    </main>
  );
}
