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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
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
