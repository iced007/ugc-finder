"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    await signOut();
    router.push("/");
  }

  return (
    <button
      className="min-h-11 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-950 transition-colors hover:border-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      onClick={handleSignOut}
      type="button"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
