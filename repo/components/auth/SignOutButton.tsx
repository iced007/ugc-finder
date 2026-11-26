"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setError(null);
    setPending(true);

    try {
      await signOut();
    } catch (error) {
      console.error(error);
      setError("We couldn't sign you out. Please try again.");
      setPending(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        className="min-h-11 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-950 transition-colors hover:border-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        onClick={handleSignOut}
        type="button"
      >
        {pending ? "Signing out…" : "Sign out"}
      </button>
      {error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
