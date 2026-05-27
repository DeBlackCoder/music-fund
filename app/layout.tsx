import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/app/components/Navbar";
import { MobileNav } from "@/app/components/MobileNav";
import { Toaster } from "sonner";
import { QueryProvider } from "@/src/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vibefund — Fund the Next African Hit",
  description: "The premier music crowdfunding platform for African artists. Fund the next African hit before the world hears it.",
  keywords: ["music", "crowdfunding", "african music", "afrobeats", "artists"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-[#09090b] text-white antialiased">
        <QueryProvider>
          <Navbar />
          <main className="pt-16 pb-6">
            {children}
          </main>
          <MobileNav />
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "#121214",
                border: "1px solid #27272a",
                color: "#fafafa",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
