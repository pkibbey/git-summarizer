import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat, Poppins } from "next/font/google";
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

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "700"]
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
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
