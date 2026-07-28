import PageHeader from "../components/ui/PageHeader";
import Services from "../components/services/Services";
import { getEnabledServices, getPublicSettingsSnapshot } from "@/lib/data/public-server";
import { buildPageMetadata } from "@/lib/data/seo";

export async function generateMetadata() {
  const settings = await getPublicSettingsSnapshot();
  return buildPageMetadata(settings, settings.servicesPageTitle, settings.servicesPageSubtitle);
}

export default async function HizmetlerPage() {
  const [settings, servicesList] = await Promise.all([
    getPublicSettingsSnapshot(),
    getEnabledServices(),
  ]);

  const initialServices = servicesList.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    duration: s.duration,
    price: s.price,
    image: s.image,
    popular: s.popular,
  }));

  return (
    <main>
      <PageHeader
        title={settings.servicesPageTitle}
        subtitle={settings.servicesPageSubtitle}
        bg={settings.servicesPageBanner}
      />
      <Services showHeading={false} theme="light" initialServices={initialServices} />
    </main>
  );
}
