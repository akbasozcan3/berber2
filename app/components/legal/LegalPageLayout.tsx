import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalPageLayout({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <main className="pt-32 pb-28 bg-[#070B12] min-h-screen text-white">
      <div className="container mx-auto px-6 md:px-16 max-w-4xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase text-[#C8703A] hover:text-white transition-colors"
          >
            <ArrowLeft size={12} />
            <span>Ana Sayfa</span>
          </Link>
        </div>

        {/* Card Box with Hairline Border */}
        <div className="bg-[#0B111A] border border-white/[0.08] rounded-2xl p-8 sm:p-12 md:p-16 shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C8703A]/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Title & Hairline Accent */}
          <div className="pb-8 mb-8 border-b border-white/[0.08]">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8703A] block mb-2">
              Yasal Bilgilendirme · M Studio Hairdresser
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-light text-white tracking-tight leading-tight">
              {title}
            </h1>
            <div className="flex items-center gap-2.5 mt-4">
              <span className="w-10 h-px bg-[#C8703A]" />
              <span className="w-3 h-px bg-[#C8703A]/40" />
            </div>
          </div>

          {/* Legal Content */}
          <div
            className="prose prose-invert prose-base max-w-none text-white/65 font-light leading-relaxed
              [&_h2]:text-xl [&_h2]:font-serif [&_h2]:text-white [&_h2]:font-normal [&_h2]:mt-8 [&_h2]:mb-3
              [&_h3]:text-lg [&_h3]:font-serif [&_h3]:text-white/90 [&_h3]:font-normal [&_h3]:mt-6 [&_h3]:mb-2
              [&_p]:mb-4 [&_p]:leading-relaxed
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_li]:text-white/60
              [&_strong]:text-white/90 [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Footer Info */}
          <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-white/40">
            <span>M Studio Hairdresser · Mehmet İis</span>
            <span>Son Güncelleme: {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
