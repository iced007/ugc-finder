const APP_NAME = "APP_NAME";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-stone-600 sm:px-8">
        <p className="font-bold text-stone-950">{APP_NAME}</p>
        <p>Good products deserve creator-made stories.</p>
        <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      </div>
    </footer>
  );
}
