import { ensureDb } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import { pageContent } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const LEGAL_DEFAULTS: Record<string, { title: string; content: string }> = {
  legal_privacy: {
    title: "Gizlilik Politikası",
    content: `<p>M Studio Hairdresser olarak kişisel verilerinizin güvenliğine önem veriyoruz. Randevu ve iletişim formları aracılığıyla paylaştığınız ad, telefon, e-posta ve mesaj bilgileri yalnızca hizmet sunumu ve iletişim amacıyla kullanılır.</p><p>Verileriniz üçüncü taraflarla paylaşılmaz; yasal zorunluluklar dışında ifşa edilmez. Verilerinize erişim, düzeltme veya silme talepleriniz için bizimle iletişime geçebilirsiniz.</p>`,
  },
  legal_kvkk: {
    title: "KVKK Aydınlatma Metni",
    content: `<p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, randevu ve iletişim süreçlerinde toplanan kişisel verileriniz veri sorumlusu sıfatıyla işlenmektedir.</p><p>Toplanan veriler: ad soyad, telefon, e-posta ve randevu bilgileri. Amaç: randevu yönetimi ve müşteri iletişimi. Haklarınız için iletişim sayfamızdan bize ulaşabilirsiniz.</p>`,
  },
  legal_cookies: {
    title: "Çerez Politikası",
    content: `<p>Web sitemiz, temel işlevler ve kullanıcı deneyimini iyileştirmek için çerezler kullanabilir. Tarayıcı ayarlarınızdan çerezleri yönetebilir veya devre dışı bırakabilirsiniz.</p><p>Zorunlu çerezler site güvenliği ve oturum yönetimi için gereklidir.</p>`,
  },
  legal_terms: {
    title: "Kullanım Koşulları",
    content: `<p>Bu web sitesini kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Site içeriği bilgilendirme amaçlıdır; randevu saatlerine uyum sorumluluğu müşteriye aittir.</p><p>İşletme, teknik aksaklıklar veya mücbir sebepler nedeniyle hizmette değişiklik yapma hakkını saklı tutar.</p>`,
  },
};

export async function getLegalContent(slug: keyof typeof LEGAL_DEFAULTS) {
  try {
    await ensureDb();
    const row = await db.select().from(pageContent).where(eq(pageContent.slug, slug)).limit(1);
    if (row[0]?.content) {
      return { title: row[0].title || LEGAL_DEFAULTS[slug].title, content: row[0].content };
    }
  } catch {
    // build/runtime without DB
  }
  return LEGAL_DEFAULTS[slug];
}

export { LEGAL_DEFAULTS };
export const LEGAL_SLUGS = Object.keys(LEGAL_DEFAULTS) as (keyof typeof LEGAL_DEFAULTS)[];
