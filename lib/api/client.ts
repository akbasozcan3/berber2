const API_BASE = "/api/v1";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    cache: "no-store",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Bir hata oluştu" }));
    throw new Error(err.error || "Bir hata oluştu");
  }
  return res.json();
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  description: string;
  duration: number;
  price: number;
  image: string | null;
  popular: boolean;
}

export interface Barber {
  id: number;
  name: string;
  slug: string;
  position: string;
  avatar: string | null;
  specialty: string | null;
  available: boolean;
  performance?: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export interface BookingResult {
  success: boolean;
  appointment: {
    id: number;
    date: string;
    time: string;
    status: string;
    service: string;
    barber?: string;
    price: number;
  };
}

export interface Review {
  id: number;
  customerName: string;
  rating: number;
  review: string;
  source: string;
  featured: boolean;
  approved: boolean;
  createdAt: string;
}

export interface GalleryImage {
  id: number;
  url: string;
  title: string;
  mediaType: "image" | "instagram";
  instagramUrl: string | null;
  coverUrl: string | null;
  isVideo: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface PublicSettings {
  businessName: string;
  logoUrl: string;
  faviconUrl: string;
  address: string;
  phone: string;
  instagram: string;
  googleMaps: string;
  contactEmail: string;
  contactIntro: string;
  navServicesLabel: string;
  navGalleryLabel: string;
  navReviewsLabel: string;
  navAboutLabel: string;
  navContactLabel: string;
  servicesPageTitle: string;
  servicesPageSubtitle: string;
  servicesSectionEyebrow: string;
  servicesSectionTitle: string;
  servicesSectionSubtitle: string;
  galleryPageTitle: string;
  galleryPageSubtitle: string;
  reviewsPageTitle: string;
  reviewsPageSubtitle: string;
  aboutPageTitle: string;
  aboutPageSubtitle: string;
  contactPageTitle: string;
  contactPageSubtitle: string;
  servicesPageBanner: string;
  galleryPageBanner: string;
  reviewsPageBanner: string;
  aboutPageBanner: string;
  contactPageBanner: string;
  workingHours: Array<{ day: string; open: string; close: string; closed?: boolean }>;
  googleRating: string;
  googleReviewCount: string;
  locationShort: string;
  footerIntro: string;
  footerCopyright: string;
  navCtaLabel: string;
  appointmentInterval: number;
  maxFutureBooking: number;
  maxBookingsPerSlot: number;
  siteUrl: string;
  loadingColor: string;
  seoHomeTitle: string;
  seoDefaultDescription: string;
  seoKeywords: string;
  bookingPageTitle: string;
  bookingPageSubtitle: string;
  bookingPageBanner: string;
  homeTeamEyebrow: string;
  homeTeamTitle: string;
  homeGalleryEyebrow: string;
  homeGalleryTitle: string;
  homeGalleryCtaLabel: string;
  homeGalleryCtaUrl: string;
  homeTestimonialsEyebrow: string;
  homeTestimonialsTitle: string;
  homeBookingCtaEyebrow: string;
  homeBookingCtaTitle: string;
  homeBookingCtaSubtitle: string;
  homeBookingCtaBanner: string;
  experienceEyebrow: string;
  experienceTitle: string;
  experienceYears: string;
  experienceHygiene: string;
  reviewsSectionIntro: string;
  reviewsFeaturedQuote: string;
  homeStatsJson: string;
  breakTimes: string;
}

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  badge: string | null;
  ctaText: string;
  ctaLink: string;
  sortOrder: number;
  enabled: boolean;
}

export interface PageContent {
  slug: string;
  title: string;
  subtitle: string | null;
  heroImage: string | null;
  content: string;
  sections: unknown;
  meta: unknown;
  updatedAt: string;
}

export const api = {
  getServices: () => fetchApi<Service[]>("/services"),
  getBarbers: () => fetchApi<Barber[]>("/barbers"),
  getSlots: (date: string, serviceId: number, barberId?: number) =>
    fetchApi<TimeSlot[]>(
      `/slots?date=${date}&serviceId=${serviceId}${barberId ? `&barberId=${barberId}` : ""}`
    ),
  createBooking: (data: {
    customerName: string;
    phone: string;
    email: string;
    serviceId: number;
    barberId?: number | null;
    date: string;
    time: string;
    notes?: string;
    agreed: boolean;
  }) => fetchApi<BookingResult>("/appointments", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  cancelBooking: (data: { appointmentId: number; phone: string }) =>
    fetchApi<{ success: boolean; message: string }>("/appointments/cancel", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getReviews: (featured?: boolean) =>
    fetchApi<Review[]>(`/reviews${featured ? "?featured=true" : ""}`),
  submitReview: (data: { customerName: string; customerEmail: string; rating: number; review: string }) =>
    fetchApi<{ success: boolean }>("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getPublicSettings: () => fetchApi<PublicSettings>("/settings/public"),
  getGallery: () => fetchApi<GalleryImage[]>("/gallery"),
  getHeroSlides: () => fetchApi<HeroSlide[]>("/hero"),
  getPageContent: (slug: string) => fetchApi<PageContent>(`/content?slug=${slug}`),
  submitContact: (data: { name: string; email: string; message: string }) =>
    fetchApi<{ success: boolean }>("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (email: string, password: string) =>
    fetchApi<{ success: boolean; user: { name: string; email: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  getSession: () =>
    fetchApi<{ authenticated: boolean; user: { name: string; email: string } | null }>(
      "/auth/session"
    ),
  logout: () => fetchApi<{ success: boolean }>("/auth/session", { method: "POST" }),
};
