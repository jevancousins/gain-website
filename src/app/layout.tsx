import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { LocalBusinessSchema } from "@/components/structured-data";
import { SITE } from "@/lib/utils";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const isPreview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Strength training in Eastbourne`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — Strength training in Eastbourne`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
  },
  alternates: { canonical: SITE.url },
  icons: { icon: "/favicon.ico" },
  // Keep preview deploys out of the index so the real domain stays canonical.
  robots: isPreview
    ? { index: false, follow: false, nocache: true }
    : { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-paper">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-flame focus:text-ink focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <ScrollToTop />
        <SiteNav />
        <main id="main" className="flex-1">{children}</main>
        <SiteFooter />
        <LocalBusinessSchema />
      </body>
    </html>
  );
}
