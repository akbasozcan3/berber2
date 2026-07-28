import PageHeader from "../components/ui/PageHeader";
import Booking from "../components/booking/Booking";
import { getPublicSettingsSnapshot, getEnabledServices, getAvailableBarbers } from "@/lib/data/public-server";
import { buildPageMetadata } from "@/lib/data/seo";
import type { Barber, Service } from "@/lib/api/client";

export async function generateMetadata() {
  const settings = await getPublicSettingsSnapshot();
  return buildPageMetadata(settings, settings.bookingPageTitle, settings.seoDefaultDescription);
}

export default async function RandevuPage() {
  const [settings, serviceRows, barberRows] = await Promise.all([
    getPublicSettingsSnapshot(),
    getEnabledServices(),
    getAvailableBarbers(),
  ]);

  const initialServices: Service[] = serviceRows.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    duration: s.duration,
    price: s.price,
    image: s.image,
    popular: s.popular,
  }));

  const initialBarbers: Barber[] = barberRows.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    position: b.position,
    avatar: b.avatar,
    specialty: b.specialty,
    available: b.available,
    performance: b.performance ?? undefined,
  }));

  return (
    <main>
      <PageHeader
        title={settings.bookingPageTitle}
        subtitle={settings.bookingPageSubtitle}
        bg={settings.bookingPageBanner}
      />
      <Booking initialServices={initialServices} initialBarbers={initialBarbers} />
    </main>
  );
}
