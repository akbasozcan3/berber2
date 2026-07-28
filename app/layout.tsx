import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "./components/SiteChrome";
import RouteProgressTheme from "./components/ui/RouteProgressTheme";
import { geistMono, geistSans, geistSerif } from "./fonts";
import { getPublicSettingsServer } from "@/lib/data/public-settings";
import { buildRootMetadata } from "@/lib/data/seo";
import { PublicSettingsProvider } from "@/lib/context/PublicSettingsContext";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettingsServer();
  return buildRootMetadata(settings);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSettings = await getPublicSettingsServer();

  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistSerif.variable} ${geistMono.variable} scroll-smooth subpixel-antialiased`}
    >
      <head>
        {initialSettings.logoUrl ? (
          <link rel="preload" as="image" href={initialSettings.logoUrl} />
        ) : null}
        {initialSettings.faviconUrl ? (
          <>
            <link rel="icon" href="/favicon.ico" sizes="32x32" />
            <link rel="apple-touch-icon" href="/api/favicon?size=180" sizes="180x180" />
          </>
        ) : null}
      </head>
      <body className="min-h-screen text-white flex flex-col font-sans selection:bg-[#C8703A] selection:text-white">
        <PublicSettingsProvider initialSettings={initialSettings}>
          <RouteProgressTheme />
          <SiteChrome>{children}</SiteChrome>
        </PublicSettingsProvider>
      </body>
    </html>
  );
}
