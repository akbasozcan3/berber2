import type { Service } from "@/lib/api/client";

export const M_STUDIO_SERVICES: Service[] = [
  {
    id: 1,
    name: "Klasik & Modern Saç Kesimi",
    slug: "sac-kesimi",
    description:
      "Yüz hatlarınıza ve saç yapınıza özel ustalıkla tasarlanan saç kesimi. Çift aşamalı arındırıcı saç yıkama, saç derisi masajı, canlandırıcı tonik ve profesyonel fön şekillendirme dahildir.",
    duration: 30,
    price: 450,
    image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=85&w=1200&auto=format&fit=crop",
    popular: true,
  },
  {
    id: 2,
    name: "Sakal Heykeltıraşlığı & Sıcak Havlu",
    slug: "sakal",
    description:
      "Geleneksel ustura zanaatı ile çene ve elmacık kemiği hatlarının milimetrik çizimi. Gözenekleri rahatlatan sıcak havlu ritüeli, besleyici organik sakal yağı ve yatıştırıcı balsam masajı.",
    duration: 25,
    price: 300,
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=85&w=1200&auto=format&fit=crop",
    popular: true,
  },
  {
    id: 3,
    name: "Saç + Sakal Full Kombo Ritüeli",
    slug: "sac-sakal",
    description:
      "Baştan aşağı kusursuz erkek bakım paketi: Modern saç kesimi, sakal tasarımı ve ustura hatları, sıcak havlu kompresi, derinlemesine saç yıkama ve stil sabitleme.",
    duration: 50,
    price: 650,
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=85&w=1200&auto=format&fit=crop",
    popular: true,
  },
  {
    id: 4,
    name: "Damat & Özel Gün Tasarımı",
    slug: "damat-ozel-gun",
    description:
      "Düğün, nişan ve özel davetleriniz için Mehmet İis tarafından birebir uygulanan VIP protokolü: Saç kesimi, sakal kontürleme, cilt canlandırıcı maske ve gün boyu kalıcı stil çalışması.",
    duration: 60,
    price: 850,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=85&w=1200&auto=format&fit=crop",
    popular: false,
  },
  {
    id: 5,
    name: "Keratin & Derin Saç Terapisi",
    slug: "sac-bakimi",
    description:
      "Yıpranmış, mat ve dökülmeye eğilimli saç telleri için yoğun keratin yüklemesi, kafa derisi kan dolaşımını artıran akupresür masajı ve canlandırıcı ampul terapisi.",
    duration: 40,
    price: 400,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=85&w=1200&auto=format&fit=crop",
    popular: false,
  },
  {
    id: 6,
    name: "M Studio VIP Deneyim (Full Paket)",
    slug: "vip-deneyim",
    description:
      "Salonumuzun en seçkin deneyimi: Özel saç kesimi, sıcak havlu sakal tasarımı, ozon buharı eşliğinde derin yüz temizliği & kil maskesi, kafa-omuz masajı ve özel içecek ikramı.",
    duration: 90,
    price: 1100,
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=85&w=1200&auto=format&fit=crop",
    popular: true,
  },
];
