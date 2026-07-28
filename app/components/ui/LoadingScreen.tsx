import BarberPoleLoader from "./BarberPoleLoader";

type LoadingScreenVariant = "site" | "admin-shell" | "admin-content";

interface LoadingScreenProps {
  variant?: LoadingScreenVariant;
}

function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`loading-shimmer rounded-lg ${className}`} />;
}

function SiteLoading() {
  return (
    <div className="loading-screen-root loading-enter-root fixed inset-0 z-[120] overflow-hidden bg-black text-white font-sans">
      <div className="loading-screen-noise loading-enter-fade" aria-hidden />
      <div className="loading-screen-vignette loading-enter-fade" aria-hidden />
      <div className="loading-screen-glow loading-enter-glow" aria-hidden />

      <div className="loading-screen-corner loading-screen-corner-tl loading-enter-corner" aria-hidden />
      <div className="loading-screen-corner loading-screen-corner-tr loading-enter-corner loading-enter-corner-delay" aria-hidden />
      <div className="loading-screen-corner loading-screen-corner-bl loading-enter-corner loading-enter-corner-delay-2" aria-hidden />
      <div className="loading-screen-corner loading-screen-corner-br loading-enter-corner loading-enter-corner-delay-3" aria-hidden />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
        <BarberPoleLoader
          label="Salon hazırlanıyor"
          sublabel="Deneyiminiz birazdan başlayacak"
          size="lg"
        />
      </div>
    </div>
  );
}

function AdminShellLoading() {
  return (
    <div className="min-h-screen bg-[#080D15] text-[#EEE9E0]">
      <div className="fixed inset-y-0 left-0 hidden w-[260px] border-r border-white/[0.06] bg-[#0D1420] p-4 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <Shimmer className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-3 w-28" />
            <Shimmer className="h-2.5 w-20" />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <Shimmer key={index} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div className="lg:ml-[260px]">
        <div className="h-16 border-b border-white/[0.06] bg-[#0A0F18]/85 px-5 lg:px-8">
          <div className="flex h-full items-center justify-between">
            <Shimmer className="h-9 w-36" />
            <div className="flex items-center gap-3">
              <Shimmer className="h-10 w-10 rounded-xl" />
              <Shimmer className="hidden h-10 w-32 sm:block" />
            </div>
          </div>
        </div>
        <main className="mx-auto w-full max-w-[1600px] p-4 lg:p-8">
          <AdminContentLoading />
        </main>
      </div>
    </div>
  );
}

function AdminContentLoading() {
  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-3">
          <Shimmer className="h-3 w-32" />
          <Shimmer className="h-8 w-56" />
          <Shimmer className="h-4 w-72 max-w-full" />
        </div>
        <Shimmer className="h-11 w-40 rounded-xl" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-[8px] border border-white/[0.06] bg-[#141E2E] p-5">
            <div className="mb-8 flex items-start justify-between">
              <div className="space-y-3">
                <Shimmer className="h-3 w-28" />
                <Shimmer className="h-8 w-20" />
              </div>
              <Shimmer className="h-11 w-11 rounded-xl" />
            </div>
            <Shimmer className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="rounded-[8px] border border-white/[0.06] bg-[#141E2E]">
        <div className="border-b border-white/[0.06] p-6">
          <Shimmer className="h-5 w-44" />
          <Shimmer className="mt-3 h-3 w-28" />
        </div>
        <div className="divide-y divide-white/[0.04]">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-4">
              <Shimmer className="h-9 w-12 rounded-xl" />
              <Shimmer className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Shimmer className="h-3 w-40" />
                <Shimmer className="h-3 w-56 max-w-full" />
              </div>
              <Shimmer className="hidden h-8 w-24 rounded-full sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoadingScreen({ variant = "site" }: LoadingScreenProps) {
  if (variant === "admin-shell") return <AdminShellLoading />;
  if (variant === "admin-content") return <AdminContentLoading />;
  return <SiteLoading />;
}
