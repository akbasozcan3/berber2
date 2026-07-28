import Link from "next/link";

export default function LegalPageLayout({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <main className="pt-32 pb-24 bg-black min-h-screen">
      <div className="container mx-auto px-6 md:px-16 max-w-3xl">
        <Link
          href="/"
          className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C8703A] hover:text-white transition-colors"
        >
          ← Ana Sayfa
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif font-light text-white mt-8 mb-8">{title}</h1>
        <div
          className="prose prose-invert prose-sm max-w-none space-y-6 text-white/60 font-light leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <p className="text-white/30 text-xs mt-10">Son güncelleme: {new Date().getFullYear()}</p>
      </div>
    </main>
  );
}
