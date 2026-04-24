import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter, Noto_Sans_Devanagari, Noto_Serif, Poppins } from "next/font/google";
import { AuthProvider } from "@/hooks/useAuth";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoHindi = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-hindi",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Latin only — Devanagari serif loaded via globals.css (Noto Serif Devanagari). */
const notoSerifLatin = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto-serif",
  weight: ["400", "600", "700"],
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sevasansaar | Bharat's Digital Infrastructure",
  description:
    "Private premium chat and local services. Sevasansaar is Bharat's digital service infrastructure.",
  keywords: ["Seva Sansaar", "local services Jamshedpur", "verified electricians India", "book tutor Jamshedpur", "plumbing services Jamshedpur", "Bharat digital services", "Digital India", "local experts", "home services"],
  authors: [{ name: "Mohit Raj" }],
  metadataBase: new URL("https://sevasansaar.live"),
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/en",
      "hi-IN": "/hi",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Sevasansaar | Trusted Local Services",
    description: "Connect verified local professionals in your city. Zero commission, direct access.",
    url: "https://sevasansaar.live",
    siteName: "Sevasansaar",
    images: [
      {
        url: "/logo-horizontal.png",
        width: 1200,
        height: 630,
        alt: "Seva Sansaar - Bharat's Digital Service Infrastructure",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seva Sansaar | Trusted Experts at Your Doorstep",
    description: "Find certified local professionals in Jamshedpur. Fast, reliable, and transparent.",
    images: ["/logo-horizontal.png"],
  },
  verification: {
    google: "google-site-verification-id", // Replace with actual Google verification ID
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: ["/icon-192.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sevasansaar",
    startupImage: ["/icon-512.png"],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

import { LayoutWrapper } from '@/components/LayoutWrapper';

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${notoHindi.variable} ${notoSerifLatin.variable} ${poppins.variable}`} data-scroll-behavior="smooth">
      <body className="bg-white font-sans text-gray-900 antialiased overflow-x-hidden">
        <AuthProvider>
          <NextIntlClientProvider messages={messages}>
            <LayoutWrapper>{children}</LayoutWrapper>
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


