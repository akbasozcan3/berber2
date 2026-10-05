import Link from "next/link";
import Image from "next/image";
import { Scissors, Sparkles, Crown, CheckCircle2, ShieldCheck, Clock, Calendar, ArrowRight } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import { getEnabledServices, getPublicSettingsSnapshot } from "@/lib/data/public-server";
import { buildPageMetadata } from "@/lib/data/seo";
import { M_STUDIO_SERVICES } from "@/lib/data/services-fallback";

export async function generateMetadata() {
  const settings = await getPublicSettingsSnapshot();
  return buildPageMetadata(settings, settings.servicesPageTitle, settings.servicesPageSubtitle);
}

export default async function HizmetlerPage() {
  const [settings, servicesList] = await Promise.all([
    getPublicSettingsSnapshot(),
    getEnabledServices(),
  ]);

  const services = servicesList.length > 0 ? servicesList : M_STUDIO_SERVICES;

  return (
    <main className="bg-[#FAF9F6] text-neutral-900">
      <PageHeader
        title={settings.servicesPageTitle || "M Studio Hizmetleri"}
        subtitle={
          settings.servicesPageSubtitle ||
          "Mehmet İis ustalığıyla saç anatomisine ve tarzınıza özel saç kesimi, sakal heykeltıraşlığı ve VIP erkek bakım menüsü."
        }
        bg={settings.servicesPageBanner || "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=85&w=2560&auto=format&fit=crop"}
      />

      {/* ─── GİRİŞ & FELSEFE VURGUSU ─── */}
      <section className="py-14 sm:py-20 border-b border-black/[0.06] bg-white">
        <div className="container mx-auto px-6 md:px-16 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8703A] block mb-3">
                Zanaat & Kişisel Tarz
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-light text-black tracking-tight leading-tight">
                Her Kesim, <br />
                <span className="italic text-neutral-500 font-normal">Kişisel Bir İmzadır</span>
              </h2>
            </div>
            <div className="md:col-span-8 space-y-4 text-neutral-600 text-sm sm:text-base font-light leading-relaxed">
              <p>
                M Studio Hairdresser&apos;da saç ve sakal bakımını sıradan bir berber rutini olarak değil,
                yüz anatomisi, kemik yapısı ve yaşam tarzınıza göre şekillendirilen bir sanat ritüeli olarak ele alıyoruz.
              </p>
              <p>
                Kullandığımız tüm ürünler dermatolojik olarak test edilmiş dünya markalarından seçilmekte;
                usturalarımız ve aletlerimiz her misafirimiz için sterilize edilerek kişiye özel sunulmaktadır.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HİZMET LİSTESİ KATALOĞU ─── */}
      <section className="py-16 sm:py-24 container mx-auto px-6 md:px-16 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8703A] bg-[#C8703A]/10 px-3.5 py-1 rounded-full inline-block mb-3">
            Güncel Fiyat Listesi & Menü
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-light text-black tracking-tight">
            Özenle Tasarlanmış Hizmetler
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base font-light mt-3">
            Aşağıdaki hizmetlerden dilediğinizi seçerek anında online randevunuzu oluşturabilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <article
              key={service.id || index}
              className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_45px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col group hover:-translate-y-1.5"
            >
              {/* Görsel */}
              <div className="relative h-56 w-full overflow-hidden bg-neutral-100 shrink-0">
                {service.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-white font-serif text-2xl">
                    M Studio
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                {service.popular && (
                  <span className="absolute top-4 right-4 bg-[#C8703A] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    En Çok Tercih Edilen
                  </span>
                )}

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <span className="text-xs font-mono bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md">
                    ⏱ {service.duration} Dakika
                  </span>
                  <span className="font-serif text-2xl font-bold tracking-tight text-white drop-shadow-md">
                    ₺{service.price}
                  </span>
                </div>
              </div>

              {/* İçerik */}
              <div className="p-7 flex flex-col flex-grow justify-between space-y-6">
                <div>
                  <h3 className="text-xl font-serif font-semibold text-black tracking-tight mb-2.5">
                    {service.name}
                  </h3>
                  <p className="text-neutral-600 text-sm font-light leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-400">
                    M Studio Standart
                  </span>
                  <Link
                    href={`/randevu`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C8703A] group-hover:text-black transition-colors"
                  >
                    Randevu Al <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─── VIP PAKET ÖNE ÇIKAN BANNER ─── */}
      <section className="py-20 bg-[#0E1523] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C8703A]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="container mx-auto px-6 md:px-16 max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C8703A]/20 border border-[#C8703A]/40 text-[#E5A869] text-[10px] font-bold uppercase tracking-widest">
                <Crown size={12} />
                <span>Özel VIP Ayrıcalığı</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif font-light text-white leading-tight">
                M Studio VIP Deneyim & <br />
                <span className="italic text-[#E5A869] font-normal">Damat Bakım Protokolü</span>
              </h2>
              <p className="text-white/60 text-sm sm:text-base font-light leading-relaxed">
                Özel günleriniz ve kendinize ayırdığınız prestijli anlar için tasarlanmış eksiksiz bakım paketi.
                Mehmet İis tarafından birebir uygulanan bu seans; saç tasarımı, sıcak havlu tıraşı, ozonlu yüz buharı,
                arındırıcı kil maskesi ve kafa masajını bir araya getirir.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  "Kişiye özel saç kesimi & tasarım",
                  "Sıcak havlu & organik sakal yağı",
                  "Ozon buharı ve derin yüz temizliği",
                  "Rahatlatıcı kafa & omuz masajı",
                  "Özel içecek & espresso ikramı",
                  "Sıra beklemeden VIP koltuk",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-xs text-white/80">
                    <CheckCircle2 size={15} className="text-[#E5A869] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  href="/randevu"
                  className="inline-flex items-center gap-3 bg-white text-black hover:bg-white/90 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-[0_4px_25px_rgba(255,255,255,0.2)]"
                >
                  <Calendar size={15} /> VIP Randevu Al
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative h-96 sm:h-[460px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=85&w=1200&auto=format&fit=crop"
                  alt="M Studio VIP"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
                  <span className="text-[10px] text-[#E5A869] font-bold uppercase tracking-widest block mb-1">
                    Mehmet İis Master Stylist
                  </span>
                  <p className="text-white text-sm font-serif">
                    &ldquo;Bizim için her detay, misafirimizin konforu ve tarzı içindir.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HİJYEN VE SALON STANDARTLARI ─── */}
      <section className="py-20 bg-white border-t border-black/[0.06]">
        <div className="container mx-auto px-6 md:px-16 max-w-6xl">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8703A] block mb-2">
              Standartlarımız
            </span>
            <h2 className="text-3xl font-serif font-light text-black">
              M Studio Güvencesi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-black/[0.08] bg-[#FAF9F6] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#C8703A]/10 text-[#C8703A] flex items-center justify-center mx-auto">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-base font-semibold text-black">Steril & Kişiye Özel</h3>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                Tüm ustura uçları tek kullanımlık olup, metal ekipmanlar her işlem öncesi UV ve medikal dezenfektanla sterilize edilir.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-black/[0.08] bg-[#FAF9F6] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#C8703A]/10 text-[#C8703A] flex items-center justify-center mx-auto">
                <Sparkles size={22} />
              </div>
              <h3 className="text-base font-semibold text-black">Seçkin Bakım Ürünleri</h3>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                Saç ve saç derisi sağlığı için yalnızca profesyonel, sülfatsız ve doğal içerikli premium bakım ürünleri tercih edilir.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-black/[0.08] bg-[#FAF9F6] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#C8703A]/10 text-[#C8703A] flex items-center justify-center mx-auto">
                <Clock size={22} />
              </div>
              <h3 className="text-base font-semibold text-black">Randevulu Tam Zamanında</h3>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                Online randevu sistemimiz sayesinde salonumuzda bekleme yapmaz, planladığınız saatte koltuğunuza oturursunuz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SIKÇA SORULAN SORULAR ─── */}
      <section className="py-20 border-t border-black/[0.06] bg-[#FAF9F6]">
        <div className="container mx-auto px-6 md:px-16 max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8703A] block mb-2">
              Merak Edilenler
            </span>
            <h2 className="text-3xl font-serif font-light text-black">
              Sıkça Sorulan Sorular
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Randevusuz gelebilir miyim?",
                a: "Yoğunluğumuz sebebiyle randevulu misafirlerimize öncelik verilmektedir. Sıra beklememek adına web sitemizden veya WhatsApp üzerinden birkaç saat önceden randevu almanızı tavsiye ederiz.",
              },
              {
                q: "Saç kesimi ve sakal tasarımı ne kadar sürer?",
                a: "Standart saç kesimi yaklaşık 30 dakika, sakal heykeltıraşlığı 25 dakika, saç-sakal full kombo ise yaklaşık 50 dakika sürmektedir.",
              },
              {
                q: "Damat traşı için ne zaman randevu almalıyım?",
                a: "Damat traşları ve VIP paketler özel hazırlık gerektirdiğinden, düğün veya etkinlik tarihinizden en az 1-2 hafta önce rezervasyon yaptırmanızı öneriyoruz.",
              },
            ].map((faq, i) => (
              <div key={i} className="p-6 rounded-xl bg-white border border-black/[0.08] space-y-2">
                <h3 className="text-base font-semibold text-black">{faq.q}</h3>
                <p className="text-sm text-neutral-600 font-light leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/randevu"
              className="inline-flex items-center gap-2 bg-black text-white hover:bg-neutral-800 px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
            >
              Hemen Randevu Al
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
