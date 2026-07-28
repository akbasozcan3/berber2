"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-2xl font-serif">Bir şeyler ters gitti</h1>
          <p className="text-white/50 text-sm">
            Sayfa yüklenirken beklenmeyen bir hata oluştu. Lütfen tekrar deneyin veya ana sayfaya dönün.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="px-6 py-3 bg-white text-black rounded-sm text-xs font-bold uppercase tracking-wider"
            >
              Tekrar Dene
            </button>
            <Link
              href="/"
              className="px-6 py-3 border border-white/20 rounded-sm text-xs font-bold uppercase tracking-wider"
            >
              Ana Sayfa
            </Link>
            <Link
              href="/randevu"
              className="px-6 py-3 border border-white/20 rounded-sm text-xs font-bold uppercase tracking-wider"
            >
              Randevu Al
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
