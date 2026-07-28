import Link from "next/link";
import { ArrowRight, Calendar, Home, Scissors } from "lucide-react";
import { getPublicSettingsServer } from "@/lib/data/public-settings";

export default async function NotFound() {
  const settings = await getPublicSettingsServer();

  const links = [
    { href: "/", label: "Ana Sayfa", icon: Home },
    { href: "/randevu", label: settings.navCtaLabel || "Randevu Al", icon: Calendar },
    { href: "/hizmetler", label: settings.navServicesLabel, icon: Scissors },
    { href: "/iletisim", label: settings.navContactLabel, icon: ArrowRight },
  ];

  return (
    <main className="relative min-h-[calc(100dvh-8rem)] flex items-center justify-center overflow-hidden bg-[#0D1117] pt-28 pb-24 px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 80px), repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 80px)",
        }}
      />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
        <span className="text-[28vw] font-serif font-bold text-white/[0.02] leading-none tracking-tighter">
          404
        </span>
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="w-10 h-px bg-white/30" />
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/45">
            Sayfa Bulunamadı
          </span>
          <span className="w-10 h-px bg-white/30" />
        </div>

        <p className="text-8xl md:text-9xl font-serif font-light text-white tracking-tight leading-none mb-6">
          404
        </p>

        <h1 className="text-2xl md:text-4xl font-serif font-light text-white tracking-tight mb-5">
          Aradığınız sayfa mevcut değil
        </h1>

        <p className="text-white/45 text-base md:text-lg font-light leading-relaxed max-w-md mx-auto mb-12">
          Bağlantı hatalı olabilir veya sayfa kaldırılmış olabilir.{" "}
          <span className="text-white/70">{settings.businessName}</span> ana sayfasından devam
          edebilirsiniz.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2.5 bg-white text-black hover:bg-white/90 px-10 py-4 rounded-full text-[10px] font-bold tracking-[0.28em] uppercase transition-all duration-300 min-w-[200px]"
          >
            <Home size={14} />
            Ana Sayfaya Dön
            <ArrowRight
              size={13}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
          <Link
            href="/randevu"
            className="inline-flex items-center justify-center gap-2.5 border border-white/25 text-white hover:border-white/50 hover:bg-white/5 px-10 py-4 rounded-full text-[10px] font-bold tracking-[0.28em] uppercase transition-all duration-300 min-w-[200px]"
          >
            <Calendar size={14} />
            {settings.navCtaLabel || "Randevu Al"}
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10px] font-bold tracking-[0.22em] uppercase">
          {links.slice(2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/35 hover:text-white transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
