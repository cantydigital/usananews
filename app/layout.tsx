import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/app/components/footer";
import Header from "@/app/components/header";
import { getSiteIndexable, getSiteInfo } from "@/app/lib/wordpress";
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
  const [indexable, site] = await Promise.all([getSiteIndexable(), getSiteInfo()]);
  const siteName = site?.name ?? "USANA News";

  // Defaults for pages without Yoast data; pages override them via seoMetadata().
  return {
    title: { default: siteName, template: `%s | ${siteName}` },
    description: site?.tagline ?? undefined,
    // Controlled by "Site Indexing Status" in WordPress Site Settings.
    robots: { index: indexable, follow: indexable },
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
