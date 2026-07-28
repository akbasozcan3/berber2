import PageHeader from "../components/ui/PageHeader";
import ReviewsSection from "../components/testimonials/ReviewsSection";
import { getApprovedReviews, getPublicSettingsSnapshot } from "@/lib/data/public-server";
import { buildPageMetadata } from "@/lib/data/seo";

export async function generateMetadata() {
  const settings = await getPublicSettingsSnapshot();
  return buildPageMetadata(settings, settings.reviewsPageTitle, settings.reviewsPageSubtitle);
}

export default async function YorumlarPage() {
  const [reviews, settings] = await Promise.all([
    getApprovedReviews(50),
    getPublicSettingsSnapshot(),
  ]);

  const mapped = reviews.map((r) => ({
    id: r.id,
    customerName: r.customerName,
    rating: r.rating,
    review: r.review,
    source: r.source,
    featured: r.featured,
    approved: r.approved,
    createdAt: r.createdAt,
  }));

  return (
    <main>
      <PageHeader
        title={settings.reviewsPageTitle}
        subtitle={`${settings.reviewsPageSubtitle} · Google'da ${settings.googleRating} puan · ${settings.googleReviewCount}+ yorum`}
        breadcrumb="Yorumlar"
        bg={settings.reviewsPageBanner}
      />
      <ReviewsSection
        initialReviews={mapped}
        googleRating={settings.googleRating}
        googleReviewCount={settings.googleReviewCount}
      />
    </main>
  );
}
