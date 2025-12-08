import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import blogData from '../public/blog-data/gemma-3n/v2.json'
import type { BlogData } from '@/lib/types';
import Navigation from "@/components/Navigation";
import VersionModelSelector from "@/components/VersionModelSelector";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Peak Blooms - A 2-Week Web Development Journey",
  description:
    "Documenting the daily progress, architectural decisions, and learnings from building a fully featured website in 2 weeks. Featuring AI-powered analysis of development commits and a focus on user-centric design thinking.",
  keywords: [
    "web development",
    "architecture",
    "software engineering",
    "portfolio",
    "full-stack",
    "Next.js",
    "design thinking",
  ],
  authors: [{ name: "Phineas Kibbey" }],
  openGraph: {
    title: "Peak Blooms - A 2-Week Web Development Journey",
    description:
      "An alternative portfolio site showcasing architectural thinking and engineering excellence through daily development logs.",
    type: "website",
    url: "https://peak-blooms-blog.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Peak Blooms - Development Journal",
    description:
      "See how a full-featured website is built in 2 weeks with thoughtful design and architecture decisions.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <header className="flex items-start justify-between gap-6 mb-6">
            <Link href="/">
              <div>
                <h1 className="text-lg font-bold">Peak Blooms</h1>
                <p className="text-sm text-muted-foreground">
                  A 2-Week Web Development Journey
                </p>
              </div>
            </Link>

            <div className="ml-auto flex items-center gap-4">
              <VersionModelSelector />
              <Navigation blogData={blogData as BlogData} />
            </div>
          </header>

          <main>{children}</main>
        </div>
      </body >
    </html >
  );
}
