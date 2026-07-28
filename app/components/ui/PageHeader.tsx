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
        <nav className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-5">
          <Link href="/" className="hover:text-white/60 transition-colors">
            Ana Sayfa
          </Link>
          <ChevronRight size={10} className="text-white/20" />
          <span className="text-white/70">{breadcrumb || title}</span>
        </nav>

        <h1 className="text-4xl md:text-6xl font-serif font-light text-white tracking-tight leading-[1.1] mb-4">
          {title}
        </h1>

        {subtitle && (
          <p className="text-white/45 text-base md:text-lg font-light max-w-xl leading-relaxed">
            {subtitle}
          </p>
        )}

        <div className="flex items-center gap-3 mt-8">
          <span className="w-12 h-px bg-white/50" />
          <span className="w-3 h-px bg-white/20" />
        </div>
      </div>

      <div className="relative z-10 h-px bg-white/[0.06]" />
    </div>
  );
}
