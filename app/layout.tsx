import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/app/components/footer";
import Header from "@/app/components/header";
import { getSiteFavicon, getSiteIndexable, getSiteInfo } from "@/app/lib/wordpress";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const [indexable, site, favicon] = await Promise.all([getSiteIndexable(), getSiteInfo(), getSiteFavicon()]);
  const siteName = site?.name ?? "USANA News";

  // Defaults for pages without Yoast data; pages override them via seoMetadata().
  return {
    title: { default: siteName, template: `%s | ${siteName}` },
    description: site?.tagline ?? undefined,
    // Controlled by "Site Indexing Status" in WordPress Site Settings.
    robots: { index: indexable, follow: indexable },
    // "Site Favicon" in WordPress Site Settings, else public/favicon.ico. The fallback lives in public/
    // rather than app/ so Next.js doesn't add a second icon link that competes with the WordPress one.
    icons: {
      icon: favicon
        ? [
            {
              url: favicon.url,
              ...(favicon.mimeType && { type: favicon.mimeType }),
              ...(favicon.sizes && { sizes: favicon.sizes }),
            },
          ]
        : "/favicon.ico",
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
