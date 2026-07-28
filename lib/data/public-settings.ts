import { ensureDb } from "@/lib/db/ensure";
import { isDbAvailable } from "@/lib/db";
import { getSettings } from "@/lib/services/booking";
import type { PublicSettings } from "@/lib/api/client";
import { publicSettingsDefaults } from "./public-settings-defaults";
import { parseWorkingHoursJson } from "./working-hours";
import { normalizeMultilineSettingValue } from "./multiline-settings";

function ml(value: string | undefined, fallback: string): string {
  return normalizeMultilineSettingValue(value || fallback);
}

export function mapSettingsToPublic(all: Record<string, string>): PublicSettings {
  return {
    businessName: all.business_name || publicSettingsDefaults.businessName,
    logoUrl: all.logo_url || "",
    faviconUrl: all.favicon_url || "",
    address: all.address || publicSettingsDefaults.address,
    phone: all.phone || publicSettingsDefaults.phone,
    instagram: all.instagram || publicSettingsDefaults.instagram,
    googleMaps: all.google_maps || publicSettingsDefaults.googleMaps,
    contactEmail: all.contact_email || publicSettingsDefaults.contactEmail,
    contactIntro: all.contact_intro || publicSettingsDefaults.contactIntro,
    navServicesLabel: all.nav_services_label || publicSettingsDefaults.navServicesLabel,
    navGalleryLabel: all.nav_gallery_label || publicSettingsDefaults.navGalleryLabel,
    navReviewsLabel: all.nav_reviews_label || publicSettingsDefaults.navReviewsLabel,
    navAboutLabel: all.nav_about_label || publicSettingsDefaults.navAboutLabel,
    navContactLabel: all.nav_contact_label || publicSettingsDefaults.navContactLabel,
    servicesPageTitle: all.services_page_title || publicSettingsDefaults.servicesPageTitle,
    servicesPageSubtitle: all.services_page_subtitle || publicSettingsDefaults.servicesPageSubtitle,
    servicesSectionEyebrow: all.services_section_eyebrow || publicSettingsDefaults.servicesSectionEyebrow,
    servicesSectionTitle: ml(all.services_section_title, publicSettingsDefaults.servicesSectionTitle),
    servicesSectionSubtitle: all.services_section_subtitle || publicSettingsDefaults.servicesSectionSubtitle,
    galleryPageTitle: all.gallery_page_title || publicSettingsDefaults.galleryPageTitle,
    galleryPageSubtitle: all.gallery_page_subtitle || publicSettingsDefaults.galleryPageSubtitle,
    reviewsPageTitle: all.reviews_page_title || publicSettingsDefaults.reviewsPageTitle,
    reviewsPageSubtitle: all.reviews_page_subtitle || publicSettingsDefaults.reviewsPageSubtitle,
    aboutPageTitle: all.about_page_title || publicSettingsDefaults.aboutPageTitle,
    aboutPageSubtitle: all.about_page_subtitle || publicSettingsDefaults.aboutPageSubtitle,
    contactPageTitle: all.contact_page_title || publicSettingsDefaults.contactPageTitle,
    contactPageSubtitle: all.contact_page_subtitle || publicSettingsDefaults.contactPageSubtitle,
    servicesPageBanner: all.services_page_banner || publicSettingsDefaults.servicesPageBanner,
    galleryPageBanner: all.gallery_page_banner || publicSettingsDefaults.galleryPageBanner,
    reviewsPageBanner: all.reviews_page_banner || publicSettingsDefaults.reviewsPageBanner,
    aboutPageBanner: all.about_page_banner || publicSettingsDefaults.aboutPageBanner,
    contactPageBanner: all.contact_page_banner || publicSettingsDefaults.contactPageBanner,
    workingHours: parseWorkingHoursJson(all.working_hours),
    googleRating: all.google_rating || publicSettingsDefaults.googleRating,
    googleReviewCount: all.google_review_count || publicSettingsDefaults.googleReviewCount,
    locationShort: all.location_short || publicSettingsDefaults.locationShort,
    footerIntro: all.footer_intro || publicSettingsDefaults.footerIntro,
    footerCopyright: all.footer_copyright || "",
    navCtaLabel: all.nav_cta_label || publicSettingsDefaults.navCtaLabel,
    appointmentInterval: Number(all.appointment_interval || publicSettingsDefaults.appointmentInterval),
    maxFutureBooking: Number(all.max_future_booking || publicSettingsDefaults.maxFutureBooking),
    maxBookingsPerSlot: Number(all.max_bookings_per_slot || publicSettingsDefaults.maxBookingsPerSlot),
    siteUrl: all.site_url || publicSettingsDefaults.siteUrl,
    seoHomeTitle: all.seo_home_title || publicSettingsDefaults.seoHomeTitle,
    seoDefaultDescription: all.seo_default_description || publicSettingsDefaults.seoDefaultDescription,
    seoKeywords: all.seo_keywords || publicSettingsDefaults.seoKeywords,
    bookingPageTitle: all.booking_page_title || publicSettingsDefaults.bookingPageTitle,
    bookingPageSubtitle: all.booking_page_subtitle || publicSettingsDefaults.bookingPageSubtitle,
    bookingPageBanner: all.booking_page_banner || publicSettingsDefaults.bookingPageBanner,
    homeTeamEyebrow: all.home_team_eyebrow || publicSettingsDefaults.homeTeamEyebrow,
    homeTeamTitle: all.home_team_title || publicSettingsDefaults.homeTeamTitle,
    homeGalleryEyebrow: all.home_gallery_eyebrow || publicSettingsDefaults.homeGalleryEyebrow,
    homeGalleryTitle: ml(all.home_gallery_title, publicSettingsDefaults.homeGalleryTitle),
    homeGalleryCtaLabel: all.home_gallery_cta_label || publicSettingsDefaults.homeGalleryCtaLabel,
    homeGalleryCtaUrl: all.home_gallery_cta_url || publicSettingsDefaults.homeGalleryCtaUrl,
    homeTestimonialsEyebrow:
      all.home_testimonials_eyebrow || publicSettingsDefaults.homeTestimonialsEyebrow,
    homeTestimonialsTitle: ml(
      all.home_testimonials_title,
      publicSettingsDefaults.homeTestimonialsTitle
    ),
    homeBookingCtaEyebrow: all.home_booking_cta_eyebrow || publicSettingsDefaults.homeBookingCtaEyebrow,
    homeBookingCtaTitle: ml(all.home_booking_cta_title, publicSettingsDefaults.homeBookingCtaTitle),
    homeBookingCtaSubtitle: all.home_booking_cta_subtitle || publicSettingsDefaults.homeBookingCtaSubtitle,
    homeBookingCtaBanner: all.home_booking_cta_banner || publicSettingsDefaults.homeBookingCtaBanner,
    experienceEyebrow: all.experience_eyebrow || publicSettingsDefaults.experienceEyebrow,
    experienceTitle: ml(all.experience_title, publicSettingsDefaults.experienceTitle),
    experienceYears: all.experience_years || publicSettingsDefaults.experienceYears,
    experienceHygiene: all.experience_hygiene || publicSettingsDefaults.experienceHygiene,
    reviewsSectionIntro: all.reviews_section_intro || publicSettingsDefaults.reviewsSectionIntro,
    reviewsFeaturedQuote: all.reviews_featured_quote || publicSettingsDefaults.reviewsFeaturedQuote,
    homeStatsJson: all.home_stats_json || publicSettingsDefaults.homeStatsJson,
    breakTimes: all.break_times || publicSettingsDefaults.breakTimes,
  };
}

export async function getPublicSettingsServer(): Promise<PublicSettings> {
  try {
    if (!(await ensureDb()) || !isDbAvailable()) return publicSettingsDefaults;
    const all = await getSettings();
    return mapSettingsToPublic(all);
  } catch {
    return publicSettingsDefaults;
  }
}
