import nextDynamic from "next/dynamic";
import HeroSlider from "./components/hero/HeroSlider";
import ServicesPreview from "./components/home/ServicesPreview";
import AboutBanner from "./components/home/AboutBanner";
import QuoteBanner from "./components/home/QuoteBanner";
import Contact from "./components/contact/Contact";
import StatsStrip from "./components/home/StatsStrip";
import BookingCTA from "./components/home/BookingCTA";
import GalleryPreview from "./components/home/GalleryPreview";
import {
  getAvailableBarbers,
  getEnabledHeroSlides,
  getFeaturedReviews,
  getGalleryImages,
  getPageContentBySlug,
  getPopularServices,
} from "@/lib/data/public-server";
import { getPageMetadata } from "@/lib/data/seo";
import type { Barber, GalleryImage, HeroSlide, Review, Service } from "@/lib/api/client";
import { mapGalleryRow, filterVisibleGalleryItems } from "@/lib/utils/gallery";

export async function generateMetadata() {
  return getPageMetadata("Ana Sayfa");
}

const TeamPreview = nextDynamic(() => import("./components/home/TeamPreview"));
const HowItWorks = nextDynamic(() => import("./components/home/HowItWorks"));
const ExperienceHighlights = nextDynamic(() => import("./components/home/ExperienceHighlights"));
const TestimonialsSlider = nextDynamic(() => import("./components/home/TestimonialsSlider"));

function mapServices(rows: Awaited<ReturnType<typeof getPopularServices>>): Service[] {
  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    duration: s.duration,
    price: s.price,
    image: s.image,
    popular: s.popular,
  }));
}

function mapGallery(rows: Awaited<ReturnType<typeof getGalleryImages>>): GalleryImage[] {
  return filterVisibleGalleryItems(rows.map(mapGalleryRow));
}

function mapHeroSlides(rows: Awaited<ReturnType<typeof getEnabledHeroSlides>>): HeroSlide[] {
  return rows.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    description: s.description,
    image: s.image,
    badge: s.badge,
    ctaText: s.ctaText,
    ctaLink: s.ctaLink,
    sortOrder: s.sortOrder,
    enabled: s.enabled,
  }));
}

function mapBarbers(rows: Awaited<ReturnType<typeof getAvailableBarbers>>): Barber[] {
  return rows.slice(0, 3).map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    position: b.position,
    avatar: b.avatar,
    specialty: b.specialty,
    available: b.available,
    performance: b.performance ?? undefined,
  }));
}

function mapReviews(rows: Awaited<ReturnType<typeof getFeaturedReviews>>): Review[] {
  return rows.map((r) => ({
    id: r.id,
    customerName: r.customerName,
    rating: r.rating,
    review: r.review,
    source: r.source,
    featured: r.featured,
    approved: r.approved,
    createdAt: r.createdAt,
  }));
}

export default async function HomePage() {
  const [serviceRows, galleryRows, heroRows, barberRows, reviewRows, aboutPage, quotePage] = await Promise.all([
    getPopularServices(4),
    getGalleryImages(6),
    getEnabledHeroSlides(),
    getAvailableBarbers(),
    getFeaturedReviews(8),
    getPageContentBySlug("about"),
    getPageContentBySlug("home_quote"),
  ]);

  const services = mapServices(serviceRows);
  const gallery = mapGallery(galleryRows);
  const heroSlides = mapHeroSlides(heroRows);
  const barbers = mapBarbers(barberRows);
  const reviews = mapReviews(reviewRows);

  return (
    <main>
      <HeroSlider initialSlides={heroSlides} />
      <section id="stats"><StatsStrip /></section>
      <section id="hizmetler"><ServicesPreview initialServices={services} /></section>
      <section id="hakkimizda"><AboutBanner initialPage={aboutPage} /></section>
      <section id="ekip"><TeamPreview initialBarbers={barbers} /></section>
      <section id="nasil-calisir"><HowItWorks /></section>
      <section id="galeri"><GalleryPreview initialImages={gallery} /></section>
      <section id="deneyim"><ExperienceHighlights /></section>
      <section id="felsefe"><QuoteBanner initialPage={quotePage} /></section>
      <section id="yorumlar"><TestimonialsSlider initialReviews={reviews} /></section>
      <section id="randevu-cta"><BookingCTA initialServices={services} /></section>
      <section id="iletisim"><Contact /></section>
    </main>
  );
}
