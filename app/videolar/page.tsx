import PageHeader from "../components/ui/PageHeader";
import VideoShowcase from "../components/home/VideoShowcase";
import { getPublicSettingsSnapshot } from "@/lib/data/public-server";
import { buildPageMetadata } from "@/lib/data/seo";

export async function generateMetadata() {
  const settings = await getPublicSettingsSnapshot();
  return buildPageMetadata(
    settings,
    "Videolar & Reels",
    "Mehmet İis ve M Studio ekibinin en popüler saç kesimi, sakal tasarımı, dönüşüm ve VIP bakım videoları."
  );
}

export default async function VideolarPage() {
  const settings = await getPublicSettingsSnapshot();

  return (
    <main>
      <PageHeader
        title="Videolar & Reels"
        subtitle="Mehmet İis ve M Studio Hairdresser'ın ustalıkla hazırlanan saç tasarım, sakal şekillendirme ve VIP bakım videoları."
        breadcrumb="Videolar & Reels"
        bg={settings.galleryPageBanner || "/images/hero-1.jpg"}
      />
      <VideoShowcase />
    </main>
  );
}
