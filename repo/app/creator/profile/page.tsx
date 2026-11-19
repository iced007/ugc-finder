import { CreatorProfileForm } from "@/components/creator/CreatorProfileForm";

export default function CreatorProfilePage() {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-stone-900 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <CreatorProfileForm />
      </div>
    </main>
  );
}
