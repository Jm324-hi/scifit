import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SciFit - Science-Based Smart Training",
    template: "%s | SciFit",
  },
  description:
    "SciFit is your intelligent training assistant — grounded in exercise science, it helps you plan workouts, track progressive overload, and optimize recovery so every effort counts.",
  keywords: [
    "fitness",
    "workout tracker",
    "progressive overload",
    "training plan",
    "recovery",
    "exercise science",
    "smart training",
    "gym",
    "strength training",
  ],
  authors: [{ name: "SciFit" }],
  creator: "SciFit",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://scifit.app",
  ),
  openGraph: {
    type: "website",
    siteName: "SciFit",
    title: "SciFit - Science-Based Smart Training",
    description:
      "Plan workouts, track progressive overload, and optimize recovery with an intelligent training assistant grounded in exercise science.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SciFit - Science-Based Smart Training",
    description:
      "Plan workouts, track progressive overload, and optimize recovery with an intelligent training assistant grounded in exercise science.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-svh flex-col antialiased`}
      >
        <Navbar />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
