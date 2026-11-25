"use client";

import {
  useSignInWithUsernamePassword,
  useSignUpWithUsernamePassword,
} from "@convex-dev/auth/methods/username-password/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/convex/_generated/api";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
};

type UserError = {
  error: string;
  minimumLength?: number;
  maximumLength?: number;
  retryAfterMs?: number;
};

function errorMessage(userError: UserError) {
  switch (userError.error) {
    case "USERNAME_TAKEN":
      return "That username is already taken.";
    case "USERNAME_TOO_SHORT":
      return userError.minimumLength
        ? `Username must be at least ${userError.minimumLength} characters.`
        : "Username is too short.";
    case "USERNAME_TOO_LONG":
      return userError.maximumLength
        ? `Username must be at most ${userError.maximumLength} characters.`
        : "Username is too long.";
    case "USERNAME_HAS_SURROUNDING_WHITESPACE":
      return "Username can't start or end with whitespace.";
    case "USERNAME_HAS_INVALID_CHARACTERS":
      return "Username contains characters that aren't allowed.";
    case "USER_NOT_FOUND":
    case "INVALID_CREDENTIALS":
      return "Wrong username or password.";
    case "PASSWORD_TOO_SHORT":
      return userError.minimumLength
        ? `Password must be at least ${userError.minimumLength} characters.`
        : "Password is too short.";
    case "PASSWORD_TOO_LONG":
      return userError.maximumLength
        ? `Password must be at most ${userError.maximumLength} characters.`
        : "Password is too long.";
    case "PASSWORD_HAS_SURROUNDING_WHITESPACE":
      return "Password can't start or end with whitespace.";
    case "PASSWORD_TOO_COMMON":
      return "Choose a less common password.";
    case "RATE_LIMITED":
      return userError.retryAfterMs
        ? `Too many attempts. Try again in ${Math.ceil(userError.retryAfterMs / 1000)} seconds.`
        : "Too many attempts. Please try again shortly.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { signUp, pending: signUpPending } = useSignUpWithUsernamePassword(
    api.auth,
  );
  const { signIn, pending: signInPending } = useSignInWithUsernamePassword(
    api.auth,
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isSignUp = mode === "sign-up";
  const pending = isSignUp ? signUpPending : signInPending;
  const title = isSignUp ? "Create your account" : "Welcome back";
  const submitLabel = isSignUp ? "Create account" : "Sign in";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = isSignUp
      ? await signUp({ username, password })
      : await signIn({ username, password });

    if (result.status === "complete") {
      router.push("/dashboard");
      return;
    }

    setError(errorMessage(result.userError));
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-950">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          {isSignUp
            ? "Start finding the right creator for your next project."
            : "Sign in to continue to your account."}
        </p>
      </div>

      <div className="space-y-4">
        <label
          className="block text-sm font-medium text-stone-800"
          htmlFor="username"
        >
          Username
          <input
            autoComplete="username"
            className="mt-1.5 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-base text-stone-950 transition outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-stone-100"
            disabled={pending}
            id="username"
            name="username"
            onChange={(event) => setUsername(event.target.value)}
            required
            type="text"
            value={username}
          />
        </label>
        <label
          className="block text-sm font-medium text-stone-800"
          htmlFor="password"
        >
          Password
          <input
            autoComplete={isSignUp ? "new-password" : "current-password"}
            className="mt-1.5 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-base text-stone-950 transition outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-stone-100"
            disabled={pending}
            id="password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <button
        className="min-h-11 w-full rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
        disabled={pending}
        type="submit"
      >
        {pending
          ? isSignUp
            ? "Creating account…"
            : "Signing in…"
          : submitLabel}
      </button>

      <p className="text-center text-sm text-stone-600">
        {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
        <Link
          className="font-semibold text-emerald-800 underline underline-offset-4"
          href={isSignUp ? "/signin" : "/signup"}
        >
          {isSignUp ? "Sign in" : "Sign up"}
        </Link>
      </p>
    </form>
  );
}
