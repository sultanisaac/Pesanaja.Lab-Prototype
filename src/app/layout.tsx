import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pesanajalab-prototype.vercel.app/"),
  title: {
    default: "Pesanaja.Lab | Find Trusted Local Services Near You",
    template: "%s | Pesanaja.Lab",
  },
  description: "Discover verified professionals, compare prices, and book appointments instantly. Your one-stop destination for everyday needs.",
  keywords: ["local services", "booking", "professionals", "appointments", "Pesanaja", "Indonesia", "marketplace"],
  authors: [{ name: "AsimetriLab" }],
  creator: "AsimetriLab",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://pesanajalab-prototype.vercel.app/",
    title: "Pesanaja.Lab | Find Trusted Local Services Near You",
    description: "Discover verified professionals, compare prices, and book appointments instantly. Your one-stop destination for everyday needs.",
    siteName: "Pesanaja.Lab",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pesanaja.Lab | Find Trusted Local Services Near You",
    description: "Discover verified professionals, compare prices, and book appointments instantly.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { TestAccountsWidget } from "@/components/shared/TestAccountsWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          manrope.variable
        )}
      >
        {children}
        <TestAccountsWidget />
      </body>
    </html>
  );
}
