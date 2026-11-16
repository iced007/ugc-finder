import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-stone-50 text-stone-900">
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero />
      </main>
      <Footer />
    </div>
  );
}
