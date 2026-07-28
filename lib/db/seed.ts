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
  { name: "Ahmet Nazik", rating: 5, review: "Gayet başarılı memnun kaldım tavsiye ederim", featured: true },
  { name: "Turgay Mert Erdem", rating: 5, review: "Yıllardır Mehmet Bey'e tıraş olurum, bir kere üzgün ayrılmadım.", featured: true },
  { name: "Yakup Akbaş", rating: 5, review: "Kendini Mehmet'in eline bırak, adam işi biliyor.", featured: true },
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
    telegram_recipient_name: "Mehmet Abi",
    contact_email: "info@newlifeerkekkuaforu.com",
    contact_intro:
      "Her türlü soru, randevu sorgulama ve istekleriniz için ekibimizle dilediğiniz an iletişime geçebilirsiniz.",
    nav_services_label: "Hizmetler",
    nav_gallery_label: "Galeri",
    nav_reviews_label: "Yorumlar",
    nav_about_label: "Hakkımızda",
    nav_contact_label: "İletişim",
    services_page_title: "Hizmetlerimiz",
    services_page_subtitle: "Profesyonel saç kesimi, sakal tasarımı, cilt bakımı ve lüks VIP paketlerimizi keşfedin.",
    services_section_eyebrow: "Küratörlü Hizmetlerimiz",
    services_section_title: "Özenle Tasarlanmış\nBakım Ritüelleri",
    services_section_subtitle: "Klasik berberlik geleneklerini çağdaş tekniklerle harmanlayarak, her seansı ayrıcalıklı bir deneyime dönüştürüyoruz.",
    gallery_page_title: "Galeri",
    gallery_page_subtitle: "Stüdyomuzdan saç tasarımı, sakal tıraşı ve bakım çalışmalarımıza göz atın.",
    reviews_page_title: "Müşteri Yorumları",
    reviews_page_subtitle: "Gerçek müşteri deneyimleri ve değerlendirmeleri",
    about_page_title: "Hakkımızda",
    about_page_subtitle: "Sade, temiz ve profesyonel hizmet anlayışımızla tanışın.",
    contact_page_title: "İletişim",
    contact_page_subtitle: "Sorularınız ve talepleriniz için bizimle iletişime geçin.",
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
    { title: "Saçınız Sizin\nİmzanızdır", subtitle: "Premium Berberlik", description: "Profesyonel kadromuzla kaliteli saç & sakal bakımı. Randevu alın, fark yaratan tarzınıza kavuşun.", image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=85&w=2560&auto=format&fit=crop", badge: "Saç Kesimi", sortOrder: 1 },
    { title: "Sakalınız da\nTarzınızın Parçası", subtitle: "Ustura İşçiliği", description: "Yüz hatlarınıza özel sakal şekillendirme, sıcak havlu tıraşı ve premium cilt bakımı.", image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=85&w=2560&auto=format&fit=crop", badge: "Sakal Tıraşı", sortOrder: 2 },
    { title: "Kendinize En İyi\nBakımı Hak Ediyorsunuz", subtitle: "VIP Deneyim", description: "Saç, sakal, cilt bakımı ve kafa masajından oluşan lüks VIP paketimizle ayrıcalığı yaşayın.", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=85&w=2560&auto=format&fit=crop", badge: "VIP Paket", sortOrder: 3 },
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
    const aboutArticle = `<p>New Life Erkek Kuaförü, İstanbul Çekmeköy Taşdelen'de erkek bakımında kaliteyi ve konforu bir araya getiren modern bir berber salonudur.</p><h3>Hikayemiz</h3><p>Salonumuz, geleneksel berberlik ustalığını çağdaş tasarım anlayışıyla birleştirerek Taşdelen bölgesinde fark yaratan bir adres haline gelmiştir.</p><h3>Misyonumuz</h3><p>Erkek bakımını sıradan bir rutinden çıkarıp, özgüveninizi artıran bir ritüele dönüştürmek.</p>`;

    await db.insert(pageContent).values({
      slug: "about",
      title: "New Life Deneyimi",
      subtitle: "Hakkımızda & Hikayemiz",
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
      title: "New Life\nDeneyimi",
      subtitle: "Hakkımızda",
      heroImage:
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1200&auto=format&fit=crop",
      content: "Saç ve sakal bakımını sıradan bir ihtiyaçtan öteye taşıyoruz.",
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
          "New Life Erkek Kuaförü olarak, modern tasarım tekniklerini geleneksel berberlik titizliğiyle harmanlıyoruz.",
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
      title: "3 Adımda Randevu",
      subtitle: "Nasıl Çalışır?",
      heroImage: null,
      content: "New Life deneyimi basit, hızlı ve konforlu. Randevunuzu alın, gerisini bize bırakın.",
      sections: JSON.stringify([
        { step: "01", title: "Randevu Seçin", desc: "Hizmet, berber, tarih ve saati online olarak birkaç tıkla belirleyin." },
        { step: "02", title: "Salona Gelin", desc: "Sıra beklemeden, seçtiğiniz saatte profesyonel ekibimiz sizi karşılasın." },
        { step: "03", title: "Tarzınızı Yenileyin", desc: "Kişiye özel kesim ve bakımla salonumuzdan özgüvenle ayrılın." },
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
      name: "Klasik Saç Kesimi",
      slug: "sac-kesimi",
      description: "Yüz hatlarınıza uygun profesyonel saç kesimi ve şekillendirme.",
      duration: 30,
      price: 400,
      image:
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=300&fit=crop",
      popular: true,
      sortOrder: 1,
    },
    {
      name: "Sakal Tasarımı",
      slug: "sakal",
      description: "Ustura ile sakal şekillendirme ve bakım.",
      duration: 20,
      price: 250,
      image:
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop",
      popular: true,
      sortOrder: 2,
    },
    {
      name: "Saç + Sakal Kombo",
      slug: "sac-sakal",
      description: "Tam bakım paketi: saç kesimi ve sakal tasarımı.",
      duration: 45,
      price: 550,
      image:
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop",
      popular: true,
      sortOrder: 3,
    },
    {
      name: "Çocuk Saç Kesimi",
      slug: "cocuk",
      description: "12 yaş altı çocuklar için özel saç kesimi.",
      duration: 25,
      price: 300,
      image:
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop",
      popular: false,
      sortOrder: 4,
    },
    {
      name: "Saç Bakımı",
      slug: "sac-bakimi",
      description: "Profesyonel saç bakımı ve maske uygulaması.",
      duration: 40,
      price: 350,
      image:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop",
      popular: false,
      sortOrder: 5,
    },
    {
      name: "VIP Deneyim",
      slug: "vip",
      description: "Premium saç kesimi, sakal, yüz maskesi ve kafa masajı.",
      duration: 90,
      price: 900,
      image:
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop",
      popular: true,
      sortOrder: 6,
    },
  ];

  const barberData = [
    {
      name: "Mehmet Abi",
      slug: "mehmet",
      position: "Kurucu & Usta Berber",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      specialty: "Klasik Kesim & VIP Bakım",
      performance: 98,
      sortOrder: 1,
    },
  ];

  const galleryData = [
    {
      url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70b?w=600&h=800&fit=crop",
      title: "Salon İç Mekan",
      sortOrder: 1,
    },
    {
      url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=400&fit=crop",
      title: "Saç Kesimi",
      sortOrder: 2,
    },
    {
      url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=500&fit=crop",
      title: "Sakal Tasarımı",
      sortOrder: 3,
    },
    {
      url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=700&fit=crop",
      title: "Berber Koltuğu",
      sortOrder: 4,
    },
    {
      url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=500&fit=crop",
      title: "Salon Atmosferi",
      sortOrder: 5,
    },
    {
      url: "https://images.unsplash.com/photo-1593702275687-f6b0f4d0c5e3?w=600&h=750&fit=crop",
      title: "Ustura İşçiliği",
      sortOrder: 6,
    },
  ];

  const settingsData: Record<string, string> = {
    business_name: "New Life Erkek Kuaförü",
    logo_url: "",
    favicon_url: "",
    address: "Taşdelen Mah. Dekor Sok. No:26B, 34788 Çekmeköy / İstanbul",
    phone: "+905327104355",
    instagram: "@newlifekuaforr",
    google_maps: "https://maps.google.com/?q=New+Life+Erkek+Kuaförü+Taşdelen",
    contact_email: "info@newlifeerkekkuaforu.com",
    contact_intro:
      "Her türlü soru, randevu sorgulama ve istekleriniz için ekibimizle dilediğiniz an iletişime geçebilirsiniz.",
    nav_services_label: "Hizmetler",
    nav_gallery_label: "Galeri",
    nav_reviews_label: "Yorumlar",
    nav_about_label: "Hakkımızda",
    nav_contact_label: "İletişim",
    services_page_title: "Hizmetlerimiz",
    services_page_subtitle: "Profesyonel saç kesimi, sakal tasarımı, cilt bakımı ve lüks VIP paketlerimizi keşfedin.",
    services_section_eyebrow: "Küratörlü Hizmetlerimiz",
    services_section_title: "Özenle Tasarlanmış\nBakım Ritüelleri",
    services_section_subtitle: "Klasik berberlik geleneklerini çağdaş tekniklerle harmanlayarak, her seansı ayrıcalıklı bir deneyime dönüştürüyoruz.",
    gallery_page_title: "Galeri",
    gallery_page_subtitle: "Stüdyomuzdan saç tasarımı, sakal tıraşı ve bakım çalışmalarımıza göz atın.",
    reviews_page_title: "Müşteri Yorumları",
    reviews_page_subtitle: "Gerçek müşteri deneyimleri ve değerlendirmeleri",
    about_page_title: "Hakkımızda",
    about_page_subtitle: "Sade, temiz ve profesyonel hizmet anlayışımızla tanışın.",
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
    telegram_recipient_name: "Mehmet Abi",
    telegram_last_test_at: "",
    admin_url: "http://localhost:3000/admin/appointments",
    google_rating: "4.87",
    google_review_count: "30",
    location_short: "Taşdelen, Çekmeköy / İstanbul",
    footer_intro:
      "İstanbul Çekmeköy Taşdelen'de profesyonel saç kesimi, sakal tasarımı ve kişisel erkek bakımı hizmetleri.",
    footer_copyright: "",
    nav_cta_label: "Randevu Al",
    seo_default_description:
      "İstanbul Çekmeköy Taşdelen'de profesyonel saç kesimi, sakal tasarımı, cilt bakımı ve erkek bakım hizmetleri.",
    seo_keywords:
      "erkek kuaförü, barber, kuaför, saç kesimi, sakal tıraşı, Çekmeköy, Taşdelen, İstanbul",
    site_url: "",
    loading_color: "#C8703A",
    booking_page_title: "Online Randevu",
    booking_page_subtitle:
      "Zamanınız değerlidir. Sıra beklemeden, dilediğiniz gün ve saatte yerinizi rezerve edin.",
    booking_page_banner:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop",
    home_team_eyebrow: "Uzman Kadro",
    home_team_title: "Berberlerimiz",
    home_gallery_eyebrow: "Instagram",
    home_gallery_title: "Instagram\nReels & Çalışmalar",
    home_gallery_cta_label: "Instagram'da Gör",
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
    experience_years: "10+",
    experience_hygiene: "100%",
    reviews_section_intro:
      "Bölgenizde güvenilir erkek kuaförü deneyimi. Gerçek müşteri geri bildirimleri.",
    reviews_featured_quote: "Kaliteli hizmet, temiz salon ve profesyonel ekip.",
    home_stats_json: JSON.stringify([
      { title: "Randevulu Hizmet", desc: "Beklemeden tam saatinde hizmet." },
      { title: "Uzman Berberler", desc: "Kişiye özel modern kesimler." },
      { title: "Premium Bakım", desc: "Profesyonel saç ve sakal bakımı." },
      { title: "Konforlu Salon", desc: "Rahat ve modern atmosfer." },
      { title: "Kaliteli Ürünler", desc: "Dünya markalarıyla bakım." },
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

  // CMS içeriği kısmi doldurulmuş olabilir; her zaman ensureCMS çağır.
  await ensureCMS();

  console.log("Database seeded successfully!");
  if (ADMIN_EMAIL) console.log(`Admin login email: ${ADMIN_EMAIL}`);
}

if (require.main === module) {
  seedDatabase().catch(console.error);
}
