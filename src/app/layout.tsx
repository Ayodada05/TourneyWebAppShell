import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Tournament Website",
  description: "Tournament MVP shell"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 antialiased">
        <SiteHeader />
        <main className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl py-10 sm:py-12">{children}</div>
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
