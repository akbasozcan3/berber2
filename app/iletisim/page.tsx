import PageHeader from "../components/ui/PageHeader";
import Contact from "../components/contact/Contact";
import { getPublicSettingsSnapshot } from "@/lib/data/public-server";
import { buildPageMetadata } from "@/lib/data/seo";

export async function generateMetadata() {
  const settings = await getPublicSettingsSnapshot();
  return buildPageMetadata(settings, settings.contactPageTitle, settings.contactPageSubtitle);
}

export default async function IletisimPage() {
  const settings = await getPublicSettingsSnapshot();
  return (
    <main>
      <PageHeader
        title={settings.contactPageTitle}
        subtitle={settings.contactPageSubtitle}
        bg={settings.contactPageBanner}
      />
      <Contact showHeading={false} />
    </main>
  );
}
