import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsAccessToken } from "@/lib/convexAuth";

export default async function AdminPage() {
  const accessToken = await convexAuthNextjsAccessToken();
  const user = await fetchQuery(api.users.me, {}, { token: accessToken ?? undefined });

  if (user?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <main>
      <h1>Admin dashboard</h1>
      <SignOutButton />
    </main>
  );
}
