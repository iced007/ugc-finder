import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { APP_NAME } from "@/lib/config";
import { ConvexAuthNextjsServerProvider } from "@/lib/convexAuth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} | Bangladesh UGC marketplace`,
  description: "A marketplace where brands hire talented UGC creators.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense
          fallback={
            <div
              className="flex min-h-dvh flex-1 items-center justify-center text-sm text-stone-600"
              role="status"
            >
              Loading…
            </div>
          }
        >
          <ConvexAuthNextjsServerProvider>
            {children}
          </ConvexAuthNextjsServerProvider>
        </Suspense>
      </body>
    </html>
  );
}
