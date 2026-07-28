"use client";

interface BarberPoleLoaderProps {
  label?: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
  showBrand?: boolean;
}

const sizes = {
  sm: "h-24 w-24",
  md: "h-32 w-32",
  lg: "h-40 w-40 sm:h-48 sm:w-48",
};

export default function BarberPoleLoader({
  label = "Salon hazırlanıyor",
  sublabel = "Lütfen bekleyin",
  size = "lg",
  showBrand = true,
}: BarberPoleLoaderProps) {
  return (
    <div
      className="loading-screen-copy flex flex-col items-center justify-center text-center font-sans"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loading-pole-stage loading-enter-pole relative mb-10">
        <div className="loading-pole-halo" aria-hidden />
        <div className="loading-pole-ring loading-enter-ring" aria-hidden />
        <object
          type="image/svg+xml"
          data="/loading/barber-pole.svg"
          aria-label="Yükleniyor"
          className={`relative ${sizes[size]} barber-pole-svg loading-enter-pole-svg`}
        />
      </div>

      <div className="loading-screen-text flex w-full max-w-md flex-col items-center gap-5">
        {showBrand ? (
          <div className="loading-enter-brand flex w-full items-center gap-4">
            <span className="loading-line loading-enter-line-left" aria-hidden />
            <p className="loading-brand shrink-0 text-[10px] font-bold uppercase tracking-[0.24em] text-[#D4844A]">
              New Life
            </p>
            <span className="loading-line loading-enter-line-right" aria-hidden />
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="loading-title loading-enter-title font-serif text-[1.875rem] font-normal leading-tight tracking-normal text-white sm:text-[2.125rem]">
            {label}
          </p>
          <p className="loading-subtitle loading-enter-subtitle text-xs font-medium uppercase tracking-[0.14em] text-[#9CA3AF]">
            {sublabel}
          </p>
        </div>

        <div className="loading-progress-track loading-enter-progress" aria-hidden>
          <span className="loading-progress-bar" />
        </div>
      </div>
    </div>
  );
}
