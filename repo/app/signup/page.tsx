import { AuthForm } from "@/components/auth/AuthForm";
import { APP_NAME } from "@/lib/config";

export default function SignUpPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-stone-50 px-5 py-12 sm:px-8">
      <section className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="mb-8 text-center text-lg font-bold tracking-tight text-stone-950">
          {APP_NAME}
        </p>
        <AuthForm mode="sign-up" />
      </section>
    </main>
  );
}
