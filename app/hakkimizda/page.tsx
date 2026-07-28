import PageHeader from "../components/ui/PageHeader";
import About from "../components/about/About";
import { getPageContentBySlug, getPublicSettingsSnapshot } from "@/lib/data/public-server";
import { buildPageMetadata } from "@/lib/data/seo";

export async function generateMetadata() {
  const settings = await getPublicSettingsSnapshot();
  return buildPageMetadata(settings, settings.aboutPageTitle, settings.aboutPageSubtitle);
}

export default async function HakkimizdaPage() {
  const [settings, aboutPage] = await Promise.all([
    getPublicSettingsSnapshot(),
    getPageContentBySlug("about"),
  ]);
  return (
    <main>
      <PageHeader
        title={settings.aboutPageTitle}
        subtitle={settings.aboutPageSubtitle}
        bg={settings.aboutPageBanner}
      />
      <About initialPage={aboutPage} />
    </main>
  );
}
