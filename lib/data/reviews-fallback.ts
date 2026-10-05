import type { Review } from "@/lib/api/client";

export const M_STUDIO_REVIEWS_FALLBACK: Review[] = [
  {
    id: 1,
    customerName: "Burak Kaya",
    rating: 5,
    review:
      "Mehmet İis'in eline sağlık, Taşdelen'de bu kalitede kesim yapan başka bir yer yok. Skin fade geçişleri adeta cetvelle çizilmiş gibi milimetrik.",
    source: "google",
    featured: true,
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    customerName: "Emre Demir",
    rating: 5,
    review:
      "Sakal heykeltıraşlığı ve sıcak havlu kompresi harikaydı. Tertemiz bir ortam, aletler gözünüzün önünde sterilize ediliyor. Kesinlikle tavsiye ederim.",
    source: "google",
    featured: true,
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    customerName: "Caner Yılmaz",
    rating: 5,
    review:
      "Düğün öncesi VIP bakım paketini tercih ettim. Mehmet Usta saç tasarımımdan cilt bakımına kadar her detayla bizzat ilgilendi. Çok memnun kaldım.",
    source: "google",
    featured: true,
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    customerName: "Serhat Öztürk",
    rating: 5,
    review:
      "Randevu saatinde koltuğa oturuyorsunuz, gereksiz bekleme yok. Salon atmosferi ve kahve ikramı bile ayrıcalıklı hissettiriyor.",
    source: "google",
    featured: true,
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    customerName: "Ahmet Turan",
    rating: 5,
    review:
      "Instagram'dan görüp Çekmeköy dışından geldim, beklentimin çok üstünde çıktı. Mehmet İis saç yapınıza göre doğru stili öneriyor.",
    source: "google",
    featured: true,
    approved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    customerName: "Murat Şahin",
    rating: 5,
    review:
      "Yıllardır berber değiştirmezdim ama M Studio'yu deneyince farkı anladım. Ustalık, hijyen ve güler yüz bir arada.",
    source: "google",
    featured: true,
    approved: true,
    createdAt: new Date().toISOString(),
  },
];
