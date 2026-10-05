import bcrypt from "bcryptjs";
import { loadLocalEnv } from "@/lib/utils/load-local-env";
import { db, initDatabase } from "./index";
import {
  barbers, services, barberServices, reviews, galleryImages, settings, users,
  heroSlides, pageContent,
} from "./schema";
import { eq } from "drizzle-orm";
import { LEGAL_DEFAULTS } from "../data/legal";

loadLocalEnv();

const now = () => new Date().toISOString();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim() || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

const GOOGLE_REVIEWS = [
  { name: "Ahmet Nazik", rating: 5, review: "Gayet başarılı memnun kaldım tavsiye ederim. Mehmet İis'in işçiliği gerçekten harika.", featured: true },
  { name: "Turgay Mert Erdem", rating: 5, review: "Yıllardır Mehmet Bey'e tıraş olurum, bir kere üzgün ayrılmadım.", featured: true },
  { name: "Yakup Akbaş", rating: 5, review: "Kendini Mehmet'in eline bırak, adam işi biliyor. M Studio Taşdelen'de tek geçerim.", featured: true },
  { name: "Yusuf Keçeci", rating: 5, review: "Mehmet abiye çok teşekkür ederim, müşteriyle çok iyi ilgileniyorlar.", featured: true },
  { name: "Bedirhan Tanrıverdi", rating: 5, review: "Çok iyi çok beğendim. Mehmet beyden daha iyisi bu Taşdelen'de yok.", featured: true },
];

export async function ensureAdminUser() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn("ADMIN_EMAIL ve ADMIN_PASSWORD tanımlı değil — admin kullanıcısı atlandı.");
    return;
  }
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const existing = await db.select().from(users).limit(1);
  if (existing.length === 0) {
    await db.insert(users).values({
      name: "Özcan Akbaş",
      email: ADMIN_EMAIL,
      password: hashed,
      role: "admin",
      createdAt: now(),
    });
  } else {
    await db.update(users).set({
      email: ADMIN_EMAIL,
      password: hashed,
      name: "Özcan Akbaş",
    }).where(eq(users.id, existing[0].id));
  }
}

export async function ensureTelegramSettings() {
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (chatId) {
    const existing = await db.select().from(settings).where(eq(settings.key, "telegram_chat_id")).limit(1);
    if (existing.length === 0) {
      await db.insert(settings).values({ key: "telegram_chat_id", value: chatId });
    } else if (!existing[0].value) {
      await db.update(settings).set({ value: chatId }).where(eq(settings.key, "telegram_chat_id"));
    }
  }

  const defaults: Record<string, string> = {
    notifications_telegram: "true",
    telegram_recipient_name: "Mehmet İis",
    contact_email: "info@mstudiohairdresser.com",
    contact_intro:
      "Her türlü soru, randevu sorgulama ve istekleriniz için Mehmet İis ve ekibimizle dilediğiniz an iletişime geçebilirsiniz.",
    nav_services_label: "Hizmetler",
    nav_gallery_label: "Galeri & Reels",
    nav_reviews_label: "Yorumlar",
    nav_about_label: "Hakkımızda",
    nav_contact_label: "İletişim",
    services_page_title: "M Studio Hizmetleri",
    services_page_subtitle: "Mehmet İis ustalığıyla profesyonel saç kesimi, sakal tasarımı, cilt bakımı ve lüks VIP paketler.",
    services_section_eyebrow: "M Studio Hairdresser",
    services_section_title: "Özenle Tasarlanmış\nSaç & Bakım Ritüelleri",
    services_section_subtitle: "Geleneksel berberlik ustalığını modern teknikler ve titiz işçilikle harmanlıyoruz.",
    gallery_page_title: "Reels & Videolar",
    gallery_page_subtitle: "Instagram ve TikTok paylaşımlarımız, saç dönüşümleri ve stüdyomuzdan özel anlar.",
    reviews_page_title: "Müşteri Yorumları",
    reviews_page_subtitle: "Gerçek müşteri deneyimleri ve Mehmet İis değerlendirmeleri",
    about_page_title: "Hakkımızda",
    about_page_subtitle: "M Studio Hairdresser vizyonu ve profesyonel hizmet anlayışıyla tanışın.",
    contact_page_title: "İletişim",
    contact_page_subtitle: "Sorularınız ve randevu talepleriniz için bizimle iletişime geçin.",
    services_page_banner: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1200&auto=format&fit=crop",
    gallery_page_banner: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1200&auto=format&fit=crop",
    reviews_page_banner: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1200&auto=format&fit=crop",
    about_page_banner: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1200&auto=format&fit=crop",
    contact_page_banner: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop",
  };

  for (const [key, value] of Object.entries(defaults)) {
    const row = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    if (row.length === 0) {
      await db.insert(settings).values({ key, value });
    }
  }
}

export async function ensureCMS() {
  const slides = [
    {
      title: "Kişisel Tarzınızın\nİmzası",
      subtitle: "M Studio Hairdresser · Mehmet İis",
      description: "Profesyonel kadromuzla kaliteli saç & sakal tasarımı. Randevu alın, fark yaratan tarzınıza kavuşun.",
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=85&w=2560&auto=format&fit=crop",
      badge: "Master Hair Stylist",
      sortOrder: 1,
    },
    {
      title: "Sakal Heykeltıraşlığı &\nUstura İşçiliği",
      subtitle: "Geleneksel & Modern Zanaat",
      description: "Yüz hatlarınıza özel sakal şekillendirme, sıcak havlu tıraşı ve premium doğal bakım yağları.",
      image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=85&w=2560&auto=format&fit=crop",
      badge: "Sakal Tasarımı",
      sortOrder: 2,
    },
    {
      title: "Ayrıcalıklı VIP Bakım &\nLüks Konfor",
      subtitle: "M Studio VIP Deneyim",
      description: "Saç, sakal, derinlemesine yüz bakımı ve kafa masajından oluşan lüks VIP paketimizle ayrıcalığı yaşayın.",
      image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=85&w=2560&auto=format&fit=crop",
      badge: "VIP Deneyim",
      sortOrder: 3,
    },
  ];

  const existingSlides = await db.select().from(heroSlides).limit(1);
  if (existingSlides.length === 0) {
    for (const s of slides) {
      await db.insert(heroSlides).values({
        ...s,
        ctaText: "Hemen Randevu Al",
        ctaLink: "/randevu",
        enabled: true,
        createdAt: now(),
      });
    }
  }

  const existingAbout = await db
    .select()
    .from(pageContent)
    .where(eq(pageContent.slug, "about"))
    .limit(1);

  if (existingAbout.length === 0) {
    const aboutArticle = `<p>M Studio Hairdresser, İstanbul Çekmeköy Taşdelen'de Mehmet İis öncülüğünde erkek bakımında zanaatı, kaliteyi ve konforu bir araya getiren modern bir saç tasarım stüdyosudur.</p><h3>Hikayemiz</h3><p>Mehmet İis'in yıllara dayanan deneyimi ve saç sanatına olan tutkusu, modern salon atmosferi ve hijyen standartlarıyla buluşarak Taşdelen'de fark yaratan bir marka haline gelmiştir.</p><h3>Misyonumuz</h3><p>Erkek bakımını sıradan bir tıraş rutini olmaktan çıkarıp, tarzınızı ve özgüveninizi en üst seviyeye taşıyan bir sanat ritüeline dönüştürmek.</p>`;

    await db.insert(pageContent).values({
      slug: "about",
      title: "M Studio Deneyimi",
      subtitle: "Hakkımızda & Mehmet İis",
      heroImage:
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1000&auto=format&fit=crop",
      content: aboutArticle,
      sections: JSON.stringify([
        { title: "Zanaat", desc: "Özenli İşçilik" },
        { title: "Konfor", desc: "Rahat Deneyim" },
        { title: "Hijyen", desc: "Temiz Standart" },
      ]),
      meta: null,
      updatedAt: now(),
    });

    await db.insert(pageContent).values({
      slug: "home_about",
      title: "M Studio\nDeneyimi",
      subtitle: "Hakkımızda",
      heroImage:
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1200&auto=format&fit=crop",
      content: "Saç ve sakal bakımını sıradan bir ihtiyaçtan öteye taşıyoruz. Mehmet İis ustalığıyla tanışın.",
      sections: JSON.stringify([
        { title: "Zanaat", desc: "Özenli İşçilik" },
        { title: "Konfor", desc: "Rahat Deneyim" },
        { title: "Hijyen", desc: "Temiz Standart" },
      ]),
      meta: null,
      updatedAt: now(),
    });

    await db.insert(pageContent).values({
      slug: "home_quote",
      title: "Felsefemiz",
      subtitle: "",
      heroImage: null,
      content:
        "Her kesim ve sakal tasarımı, tarzınızı yansıtan benzersiz bir imzadır.",
      sections: JSON.stringify({
        description:
          "M Studio Hairdresser olarak, Mehmet İis ustalığında modern tasarım tekniklerini geleneksel berberlik titizliğiyle harmanlıyoruz.",
      }),
      meta: null,
      updatedAt: now(),
    });
  }

  for (const [slug, data] of Object.entries(LEGAL_DEFAULTS)) {
    const exists = await db.select().from(pageContent).where(eq(pageContent.slug, slug)).limit(1);
    if (exists.length === 0) {
      await db.insert(pageContent).values({
        slug,
        title: data.title,
        subtitle: "",
        heroImage: null,
        content: data.content,
        sections: null,
        meta: null,
        updatedAt: now(),
      });
    }
  }

  const howExists = await db
    .select()
    .from(pageContent)
    .where(eq(pageContent.slug, "home_how_it_works"))
    .limit(1);
  if (howExists.length === 0) {
    await db.insert(pageContent).values({
      slug: "home_how_it_works",
      title: "3 Adımda Kolay Randevu",
      subtitle: "Nasıl Çalışır?",
      heroImage: null,
      content: "M Studio deneyimi hızlı, konforlu ve randevulu. Mehmet İis ile yerinizi ayırtın, gerisini bize bırakın.",
      sections: JSON.stringify([
        { step: "01", title: "Randevu Seçin", desc: "Hizmet, tarih ve saati online sistemimizden saniyeler içinde belirleyin." },
        { step: "02", title: "Stüdyoya Gelin", desc: "Sıra beklemeden, randevu saatinizde Mehmet İis ve ekibimiz tarafından karşılanın." },
        { step: "03", title: "Tarzınızı Yenileyin", desc: "Kişiye özel saç kesimi ve sakal tasarımı ile stüdyomuzdan özgüvenle ayrılın." },
      ]),
      meta: JSON.stringify({ ctaLabel: "Hemen Randevu Al" }),
      updatedAt: now(),
    });
  }
}

export async function seedDatabase() {
  await initDatabase();
  await ensureAdminUser();
  await ensureTelegramSettings();

  const serviceData = [
    {
      name: "Klasik & Modern Saç Kesimi",
      slug: "sac-kesimi",
      description: "Yüz hatlarınıza özel oranlarda profesyonel saç kesimi, yıkama ve şekillendirme.",
      duration: 30,
      price: 450,
      image:
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=300&fit=crop",
      popular: true,
      sortOrder: 1,
    },
    {
      name: "Sakal Heykeltıraşlığı & Ustura",
      slug: "sakal",
      description: "Ustura ile sakal hatlarının belirlenmesi, sıcak havlu ritüeli ve organik sakal yağı bakımı.",
      duration: 25,
      price: 300,
      image:
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop",
      popular: true,
      sortOrder: 2,
    },
    {
      name: "Saç + Sakal Full Kombo",
      slug: "sac-sakal",
      description: "Eksiksiz erkek bakım paketi: saç kesimi, sakal tasarımı, saç yıkama ve fön şekillendirme.",
      duration: 50,
      price: 650,
      image:
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop",
      popular: true,
      sortOrder: 3,
    },
    {
      name: "Damat & Özel Gün Tasarımı",
      slug: "damat-ozel-gun",
      description: "Düğün, nişan ve özel davetler için kusursuz saç, sakal, cilt arındırma ve stil çalışması.",
      duration: 60,
      price: 850,
      image:
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop",
      popular: false,
      sortOrder: 4,
    },
    {
      name: "Keratin & Canlandırıcı Saç Bakımı",
      slug: "sac-bakimi",
      description: "Yıpranmış saç telleri için derinlemesine onarıcı keratin maskesi ve kafa derisi masajı.",
      duration: 40,
      price: 400,
      image:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop",
      popular: false,
      sortOrder: 5,
    },
    {
      name: "M Studio VIP Deneyim",
      slug: "vip-deneyim",
      description: "Saç kesimi, sakal tasarımı, yüz buharı & kil maskesi, kafa masajı ve özel içecek ikramı.",
      duration: 90,
      price: 1100,
      image:
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop",
      popular: true,
      sortOrder: 6,
    },
  ];

  const barberData = [
    {
      name: "Mehmet İis",
      slug: "mehmet-iis",
      position: "Kurucu & Master Hairdresser",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      specialty: "Klasik & Modern Saç Tasarımı, Sakal Heykeltıraşlığı, VIP Bakım",
      performance: 99,
      sortOrder: 1,
    },
  ];

  const galleryData = [
    {
      url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&h=1000&fit=crop",
      title: "Skin Fade & Quiff Kesimi",
      mediaType: "instagram",
      instagramUrl: "https://www.instagram.com/mstudiohairdresser/",
      coverUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&h=1000&fit=crop",
      isVideo: true,
      sortOrder: 1,
    },
    {
      url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=1000&fit=crop",
      title: "Sakal Tasarımı & Ustura Çizgileri",
      mediaType: "tiktok",
      instagramUrl: "https://www.tiktok.com/@mehmetiis",
      coverUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=1000&fit=crop",
      isVideo: true,
      sortOrder: 2,
    },
    {
      url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=1000&fit=crop",
      title: "İtalyan Dokulu Saç Kesimi",
      mediaType: "instagram",
      instagramUrl: "https://www.instagram.com/mstudiohairdresser/",
      coverUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=1000&fit=crop",
      isVideo: true,
      sortOrder: 3,
    },
    {
      url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&h=1000&fit=crop",
      title: "Sıcak Havlu Tıraşı & Bakım",
      mediaType: "tiktok",
      instagramUrl: "https://www.tiktok.com/@mehmetiis",
      coverUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&h=1000&fit=crop",
      isVideo: true,
      sortOrder: 4,
    },
    {
      url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=1000&fit=crop",
      title: "M Studio Atmosferi & Detaylar",
      mediaType: "image",
      coverUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=1000&fit=crop",
      isVideo: false,
      sortOrder: 5,
    },
    {
      url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=1000&fit=crop",
      title: "Saç Dönüşümü & Şekillendirme",
      mediaType: "instagram",
      instagramUrl: "https://www.instagram.com/mstudiohairdresser/",
      coverUrl: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=1000&fit=crop",
      isVideo: true,
      sortOrder: 6,
    },
  ];

  const settingsData: Record<string, string> = {
    business_name: "M Studio Hairdresser",
    logo_url: "",
    favicon_url: "",
    address: "Taşdelen Mah. Dekor Sok. No:26B, 34788 Çekmeköy / İstanbul",
    phone: "+905327104355",
    instagram: "https://www.instagram.com/mstudiohairdresser/",
    tiktok: "https://www.tiktok.com/@mehmetiis",
    google_maps: "https://maps.google.com/?q=M+Studio+Hairdresser+Taşdelen",
    contact_email: "info@mstudiohairdresser.com",
    contact_intro:
      "Her türlü soru, randevu sorgulama ve istekleriniz için Mehmet İis ve ekibimizle dilediğiniz an iletişime geçebilirsiniz.",
    nav_services_label: "Hizmetler",
    nav_gallery_label: "Galeri & Reels",
    nav_reviews_label: "Yorumlar",
    nav_about_label: "Hakkımızda",
    nav_contact_label: "İletişim",
    services_page_title: "M Studio Hizmetleri",
    services_page_subtitle: "Mehmet İis ustalığıyla profesyonel saç kesimi, sakal tasarımı, cilt bakımı ve lüks VIP paketler.",
    services_section_eyebrow: "M Studio Hairdresser",
    services_section_title: "Özenle Tasarlanmış\nSaç & Bakım Ritüelleri",
    services_section_subtitle: "Klasik berberlik geleneklerini çağdaş tekniklerle harmanlayarak, her seansı ayrıcalıklı bir deneyime dönüştürüyoruz.",
    gallery_page_title: "Reels & Videolar",
    gallery_page_subtitle: "Instagram ve TikTok paylaşımlarımız, saç dönüşümleri ve stüdyomuzdan özel anlar.",
    reviews_page_title: "Müşteri Yorumları",
    reviews_page_subtitle: "Gerçek müşteri deneyimleri ve Mehmet İis değerlendirmeleri",
    about_page_title: "Hakkımızda",
    about_page_subtitle: "M Studio Hairdresser kalitesi ve profesyonel hizmet anlayışıyla tanışın.",
    contact_page_title: "İletişim",
    contact_page_subtitle: "Sorularınız ve talepleriniz için bizimle iletişime geçin.",
    services_page_banner: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1200&auto=format&fit=crop",
    gallery_page_banner: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1200&auto=format&fit=crop",
    reviews_page_banner: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1200&auto=format&fit=crop",
    about_page_banner: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1200&auto=format&fit=crop",
    contact_page_banner: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop",
    working_hours: JSON.stringify([
      { day: "Pazartesi", open: "09:00", close: "22:00" },
      { day: "Salı", open: "09:00", close: "22:00" },
      { day: "Çarşamba", open: "09:00", close: "22:00" },
      { day: "Perşembe", open: "09:00", close: "22:00" },
      { day: "Cuma", open: "09:00", close: "22:00" },
      { day: "Cumartesi", open: "09:00", close: "22:00" },
      { day: "Pazar", open: "", close: "", closed: true },
    ]),
    break_times: "[]",
    holidays: JSON.stringify([]),
    appointment_interval: "30",
    max_future_booking: "30",
    max_bookings_per_slot: "1",
    notifications_telegram: "true",
    notifications_email: "true",
    telegram_chat_id: process.env.TELEGRAM_CHAT_ID?.trim() || "",
    telegram_recipient_name: "Mehmet İis",
    telegram_last_test_at: "",
    admin_url: "http://localhost:3000/admin/appointments",
    google_rating: "4.92",
    google_review_count: "85",
    location_short: "Taşdelen, Çekmeköy / İstanbul",
    footer_intro:
      "İstanbul Çekmeköy Taşdelen'de Mehmet İis öncülüğünde profesyonel saç kesimi, sakal heykeltıraşlığı ve VIP erkek bakım hizmetleri.",
    footer_copyright: "",
    nav_cta_label: "Randevu Al",
    seo_default_description:
      "M Studio Hairdresser - Mehmet İis. İstanbul Çekmeköy Taşdelen'de profesyonel saç kesimi, sakal tasarımı, cilt bakımı ve modern erkek bakım deneyimi.",
    seo_keywords:
      "m studio hairdresser, mehmet iis, erkek kuaförü, berber, saç kesimi, sakal tıraşı, çekmeköy, taşdelen, istanbul berber",
    site_url: "",
    loading_color: "#C8703A",
    booking_page_title: "Online Randevu",
    booking_page_subtitle:
      "Zamanınız değerlidir. Sıra beklemeden, Mehmet İis ve ekibimizden dilediğiniz gün ve saatte yerinizi rezerve edin.",
    booking_page_banner:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop",
    home_team_eyebrow: "Master Stylist",
    home_team_title: "Mehmet İis & Kadromuz",
    home_gallery_eyebrow: "Reels & TikTok",
    home_gallery_title: "M Studio\nReels & Videolar",
    home_gallery_cta_label: "Instagram'da Takip Et",
    home_gallery_cta_url: "https://www.instagram.com/mstudiohairdresser/",
    home_testimonials_eyebrow: "Müşteri Yorumları",
    home_testimonials_title: "Deneyimleyenlerin\nGözünden",
    home_booking_cta_eyebrow: "Online Rezervasyon",
    home_booking_cta_title: "Randevunuzu\nHemen Oluşturun",
    home_booking_cta_subtitle:
      "Sıra beklemeden, size uygun tarih ve saati seçin. Güncel hizmet ve fiyat listesini inceleyip randevunuzu oluşturun.",
    home_booking_cta_banner:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2560&auto=format&fit=crop",
    experience_eyebrow: "Rakamlarla",
    experience_title: "Güvenin Sayılarla Kanıtı",
    experience_years: "12+",
    experience_hygiene: "100%",
    reviews_section_intro:
      "Taşdelen Çekmeköy'ün en çok tercih edilen erkek kuaförü deneyimi. Gerçek müşteri geri bildirimleri.",
    reviews_featured_quote: "Mehmet İis ile saç kesimi bir rutinden öte, gerçek bir sanat ve yenilenme deneyimi.",
    home_stats_json: JSON.stringify([
      { title: "Randevulu Hizmet", desc: "Beklemeden tam vaktinde hizmet." },
      { title: "Mehmet İis Ustalığı", desc: "Kişiye özel modern saç & sakal tasarımı." },
      { title: "Reels & Trend Stiller", desc: "En güncel saç ve sakal modası." },
      { title: "Premium VIP Konfor", desc: "Lüks, rahat ve modern atmosfer." },
      { title: "Seçkin Markalar", desc: "Dünya standartlarında bakım ürünleri." },
    ]),
  };

  // Settings: key yoksa ekle, varsa ama boşsa değerini tamamla.
  for (const [key, value] of Object.entries(settingsData)) {
    const row = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    if (row.length === 0) {
      await db.insert(settings).values({ key, value });
    } else if (!row[0].value) {
      await db.update(settings).set({ value }).where(eq(settings.key, key));
    }
  }

  // Services
  const existingServices = await db.select().from(services).limit(1);
  if (existingServices.length === 0) {
    for (const s of serviceData) {
      await db
        .insert(services)
        .values({ ...s, enabled: true, createdAt: now() });
    }
  }

  // Barbers
  const existingBarbers = await db.select().from(barbers).limit(1);
  if (existingBarbers.length === 0) {
    for (const b of barberData) {
      await db.insert(barbers).values({
        ...b,
        workingDays: "1,2,3,4,5,6",
        workingStart: "09:00",
        workingEnd: "22:00",
        onVacation: false,
        available: true,
        createdAt: now(),
      });
    }
  }

  // Barber-Service relations
  const existingRelations = await db.select().from(barberServices).limit(1);
  if (existingRelations.length === 0) {
    const allServices = await db.select().from(services);
    const allBarbers = await db.select().from(barbers);

    for (const barber of allBarbers) {
      for (const service of allServices) {
        await db
          .insert(barberServices)
          .values({ barberId: barber.id, serviceId: service.id });
      }
    }
  }

  // Reviews
  const existingReviews = await db.select().from(reviews).limit(1);
  if (existingReviews.length === 0) {
    for (const r of GOOGLE_REVIEWS) {
      await db.insert(reviews).values({
        customerName: r.name,
        rating: r.rating,
        review: r.review,
        source: "google",
        featured: r.featured,
        approved: true,
        replied: false,
        createdAt: now(),
      });
    }
  }

  // Gallery
  const existingGallery = await db.select().from(galleryImages).limit(1);
  if (existingGallery.length === 0) {
    for (const g of galleryData) {
      await db.insert(galleryImages).values({ ...g, createdAt: now() });
    }
  }

  // CMS içeriği
  await ensureCMS();

  console.log("Database seeded successfully with M Studio Hairdresser data!");
  if (ADMIN_EMAIL) console.log(`Admin login email: ${ADMIN_EMAIL}`);
}

if (require.main === module) {
  seedDatabase().catch(console.error);
}
