import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  bg?: string;
}

export default function PageHeader({ title, subtitle, breadcrumb, bg }: PageHeaderProps) {
  return (
    <div className="relative pt-[120px] bg-[#0D1117] overflow-hidden group">
      {bg && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 grayscale transition-transform duration-[4s] ease-out group-hover:scale-105"
          style={{ backgroundImage: `url('${bg}')` }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-[#0D1117]/60 to-[#0D1117]/30 z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-10 py-14 md:py-20">
        <nav className="flex items-center gap-2 text-[10px] font-bold tracking-[0.24em] uppercase text-white/40 mb-5">
          <Link href="/" className="hover:text-white transition-colors duration-200">
            Ana Sayfa
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-[#E5A869] font-semibold">{breadcrumb || title}</span>
        </nav>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light text-white tracking-tight leading-[1.08] mb-5">
          {title}
        </h1>

        {subtitle && (
          <p className="text-white/60 text-base md:text-lg font-light max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}

        <div className="flex items-center gap-3 mt-8">
          <span className="w-12 h-px bg-[#C8703A]" />
          <span className="w-4 h-px bg-[#C8703A]/40" />
          <span className="w-1.5 h-px bg-[#C8703A]/20" />
        </div>
      </div>

      <div className="relative z-10 h-px bg-gradient-to-r from-white/[0.04] via-white/[0.12] to-white/[0.04]" />
    </div>
  );
}
