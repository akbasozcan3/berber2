"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors,
  Sparkles,
  Crown,
  ChevronRight,
  ChevronLeft,
  User,
  Phone,
  Mail,
  Check,
  Users,
  Loader2,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
} from "lucide-react";
import WhatsAppIcon from "@/app/components/icons/WhatsAppIcon";
import { api, type Service, type Barber, type TimeSlot } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import {
  toLocalIsoDate,
  formatIsoDateTr,
  getInitials,
  toWhatsAppHref,
} from "@/lib/utils/format";
import { listBookableIsoDates, nextBookableIsoDate } from "@/lib/utils/salon-schedule";

const SERVICE_ICONS: Record<string, typeof Scissors> = {
  "sac-kesimi": Scissors,
  sakal: Sparkles,
  "sac-sakal": Scissors,
  cocuk: Users,
  "sac-bakimi": Sparkles,
  vip: Crown,
};

function slotUnavailableLabel(reason?: string): string {
  if (reason === "Dolu") return "Dolu";
  if (reason === "Mola saati") return "Mola";
  if (reason === "Geçmiş saat") return "Geçti";
  return reason || "Dolu";
}

function slotUnavailableHint(time: string, reason?: string): string {
  if (reason === "Dolu") return `${time} — Bu saat dolu`;
  if (reason === "Mola saati") return `${time} — Mola saati`;
  if (reason === "Geçmiş saat") return `${time} — Geçmiş saat`;
  return `${time} — ${reason || "Müsait değil"}`;
}

export default function Booking({
  initialServices = [],
  initialBarbers = [],
  showHeader = false,
}: {
  initialServices?: Service[];
  initialBarbers?: Barber[];
  showHeader?: boolean;
}) {
  const settings = usePublicSettings();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [barbers, setBarbers] = useState<Barber[]>(initialBarbers);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loadingCatalog, setLoadingCatalog] = useState(
    initialServices.length === 0 || initialBarbers.length === 0
  );
  const [catalogError, setCatalogError] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [slotsRetry, setSlotsRetry] = useState(0);

  const [formData, setFormData] = useState({
    serviceId: 0,
    barberId: 0,
    noPreference: false,
    date: "",
    time: "",
    name: "",
    phone: "",
    email: "",
    notes: "",
    agreed: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [appointmentResult, setAppointmentResult] = useState<{
    id: number;
    service: string;
    barber: string;
    date: string;
    time: string;
    email: string;
    price: number;
  } | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialServices.length > 0 && initialBarbers.length > 0) {
      return;
    }

    Promise.all([api.getServices(), api.getBarbers()])
      .then(([s, b]) => {
        setServices(s);
        setBarbers(b);
        setCatalogError("");
      })
      .catch((err) => {
        setCatalogError(err instanceof Error ? err.message : "Hizmetler yüklenemedi.");
      })
      .finally(() => setLoadingCatalog(false));
  }, [initialServices.length, initialBarbers.length]);

  const getNextDays = useCallback((count: number) => {
    const locale = "tr-TR";
    return listBookableIsoDates(count).map((isoDate) => {
      const d = new Date(`${isoDate}T12:00:00`);
      return {
        dayNum: d.getDate(),
        month: d.toLocaleDateString(locale, { month: "short" }),
        dayName: d.toLocaleDateString(locale, { weekday: "short" }),
        fullDayName: d.toLocaleDateString(locale, { weekday: "long" }),
        isoDate,
      };
    });
  }, []);

  const bookingHorizon = Math.min(Math.max(settings.maxFutureBooking || 30, 7), 60);
  const nextDays = useMemo(() => getNextDays(bookingHorizon), [getNextDays, bookingHorizon]);
  const todayIso = toLocalIsoDate();
  const tomorrowIso = nextDays[1]?.isoDate ?? "";

  // Slot fetcher
  useEffect(() => {
    if (!formData.date || !formData.serviceId) return;

    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) {
        setLoadingSlots(true);
        setSlotsError("");
      }
    });

    api
      .getSlots(
        formData.date,
        formData.serviceId,
        formData.noPreference ? undefined : formData.barberId || undefined
      )
      .then((data) => {
        if (cancelled) return;
        setSlots(data);
        setFormData((prev) => {
          if (!prev.time) return prev;
          const stillValid = data.some((s) => s.time === prev.time && s.available);
          return stillValid ? prev : { ...prev, time: "" };
        });
      })
      .catch(() => {
        if (cancelled) return;
        setSlots([]);
        setSlotsError("Müsait saatler yüklenemedi. Lütfen tekrar deneyin.");
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [formData.date, formData.serviceId, formData.barberId, formData.noPreference, slotsRetry]);

  const selectedService = services.find((s) => s.id === formData.serviceId);
  const selectedBarber = barbers.find((b) => b.id === formData.barberId);
  const availableSlots = slots.filter((s) => s.available);
  const bookedSlots = slots.filter((s) => !s.available && s.reason === "Dolu");
  const passedSlots = slots.filter((s) => !s.available && s.reason === "Geçmiş saat");

  // Filtered services
  const filteredServices = useMemo(() => {
    if (selectedCategory === "all") return services;
    if (selectedCategory === "popular") return services.filter((s) => s.popular);
    if (selectedCategory === "hair") return services.filter((s) => s.slug.includes("sac"));
    if (selectedCategory === "beard") return services.filter((s) => s.slug.includes("sakal"));
    if (selectedCategory === "vip") return services.filter((s) => s.slug.includes("vip") || s.price >= 400);
    return services;
  }, [services, selectedCategory]);

  // Group slots into Morning, Afternoon, Evening
  const groupedSlots = useMemo(() => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];

    slots.forEach((s) => {
      const hour = parseInt(s.time.split(":")[0], 10);
      if (hour < 12) {
        morning.push(s);
      } else if (hour < 17) {
        afternoon.push(s);
      } else {
        evening.push(s);
      }
    });

    return { morning, afternoon, evening };
  }, [slots]);

  const validateStep = (currentStep: number) => {
    const tempErrors: Record<string, string> = {};
    if (currentStep === 1 && !formData.serviceId) {
      tempErrors.service = "Lütfen devam etmek için bir hizmet seçin.";
    }
    if (currentStep === 2 && !formData.noPreference && !formData.barberId) {
      tempErrors.barber = "Lütfen bir stilist seçin veya 'Tercihim Yok' seçeneğini işaretleyin.";
    }
    if (currentStep === 3) {
      if (!formData.date) tempErrors.date = "Lütfen bir gün seçin.";
      if (!formData.time) tempErrors.time = "Lütfen bir saat seçin.";
      else if (!availableSlots.some((s) => s.time === formData.time)) {
        tempErrors.time = "Seçilen saat artık müsait değil. Lütfen başka bir saat seçin.";
      }
    }
    if (currentStep === 4) {
      if (!formData.name.trim()) tempErrors.name = "Ad Soyad zorunludur.";
      if (!formData.phone.trim() || formData.phone.replace(/\D/g, "").length < 10) {
        tempErrors.phone = "Geçerli bir telefon numarası girin.";
      }
      const emailTrimmed = formData.email.trim();
      if (!emailTrimmed) tempErrors.email = "E-posta adresi zorunludur.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
        tempErrors.email = "Geçerli bir e-posta adresi girin.";
      }
      if (!formData.agreed) tempErrors.agreed = "Devam etmek için onay vermelisiniz.";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const scrollToForm = () => {
    setTimeout(() => {
      if (!formRef.current) return;
      const el = formRef.current;
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      const scrollTo = window.scrollY + rect.top - Math.max(20, (viewH - rect.height) / 4);
      window.scrollTo({ top: Math.max(0, scrollTo), behavior: "smooth" });
    }, 50);
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    const nextStep = step + 1;
    if (nextStep === 3 && !formData.date) {
      setFormData((prev) => ({ ...prev, date: nextBookableIsoDate(), time: "" }));
    }
    setStep(nextStep);
    scrollToForm();
  };

  const handlePrev = () => {
    setStep((p) => Math.max(1, p - 1));
    scrollToForm();
  };

  const goToStep = (targetStep: number) => {
    if (targetStep < step) {
      setStep(targetStep);
      scrollToForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;
    setIsSubmitting(true);
    try {
      const freshSlots = await api.getSlots(
        formData.date,
        formData.serviceId,
        formData.noPreference ? undefined : formData.barberId || undefined
      );
      const slotOk = freshSlots.some((s) => s.time === formData.time && s.available);
      if (!slotOk) {
        setSlots(freshSlots);
        setErrors({ time: "Seçilen saat dolmuş veya artık müsait değil. Lütfen başka bir saat seçin." });
        setStep(3);
        return;
      }

      const curService = services.find((s) => s.id === formData.serviceId);
      const curBarber = barbers.find((b) => b.id === formData.barberId);
      const customerEmail = formData.email.trim().toLowerCase();

      const result = await api.createBooking({
        customerName: formData.name.trim(),
        phone: formData.phone.trim(),
        email: customerEmail,
        serviceId: formData.serviceId,
        barberId: formData.noPreference ? null : formData.barberId,
        date: formData.date,
        time: formData.time,
        notes: formData.notes.trim() || undefined,
        agreed: formData.agreed,
      });

      setAppointmentResult({
        id: result.appointment.id,
        service: result.appointment.service || curService?.name || "Hizmet",
        barber: result.appointment.barber || curBarber?.name || "İlk Müsait Berber",
        date: formData.date,
        time: formData.time,
        email: customerEmail,
        price: curService?.price || 0,
      });
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "Randevu oluşturulamadı." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = [
    { num: 1, title: "Hizmet Seçimi", icon: Scissors, desc: "İstediğiniz bakım" },
    { num: 2, title: "Stilist Tercihi", icon: User, desc: "Usta berber" },
    { num: 3, title: "Tarih & Saat", icon: CalendarIcon, desc: "Müsait randevu vakti" },
    { num: 4, title: "Bilgiler & Onay", icon: CheckCircle2, desc: "İletişim ve özet" },
  ];

  return (
    <section id="booking" className="py-12 sm:py-20 lg:py-24 bg-[#080D15] relative min-h-screen text-white overflow-hidden">
      {/* Background Ambience Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[#C8703A]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-[#25F4EE]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* ─── SECTION HEADER ─── */}
        {showHeader && (
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[#E5A869] text-[11px] font-bold tracking-[0.2em] uppercase mb-4">
              <Sparkles size={12} className="text-[#C8703A]" />
              <span>M Studio Hairdresser · Online Randevu</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-light text-white tracking-tight mb-4">
              Koltuk <span className="italic text-[#E5A869] font-normal">Rezervasyonu</span>
            </h2>
            <p className="text-white/50 text-sm sm:text-base font-light leading-relaxed">
              Hizmetinizi, ustanızı ve uygun saatinizi seçin. Anlık müsait saatlerimizden saniyeler içinde randevunuzu planlayın.
            </p>
          </div>
        )}

        {/* ─── MODERN STEP PROGRESS BAR ─── */}
        {!isSuccess && (
          <div className="max-w-4xl mx-auto mb-10 sm:mb-12">
            <div className="grid grid-cols-4 gap-2 sm:gap-4 p-2 sm:p-3 rounded-2xl bg-[#0E1523]/80 border border-white/[0.08] backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              {stepLabels.map((s) => {
                const Icon = s.icon;
                const isCurrent = step === s.num;
                const isCompleted = step > s.num;
                const isClickable = s.num < step;

                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => isClickable && goToStep(s.num)}
                    disabled={!isClickable}
                    className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3.5 rounded-xl transition-all duration-300 text-left ${
                      isCurrent
                        ? "bg-gradient-to-r from-[#C8703A]/25 to-[#B5612E]/15 border border-[#C8703A]/50 shadow-[0_4px_20px_rgba(200,112,58,0.25)]"
                        : isCompleted
                        ? "bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] cursor-pointer"
                        : "opacity-40 border border-transparent cursor-default"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isCurrent
                          ? "bg-[#C8703A] text-white shadow-[0_0_15px_rgba(200,112,58,0.6)]"
                          : isCompleted
                          ? "bg-white/10 text-emerald-400"
                          : "bg-white/5 text-white/40"
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={14} strokeWidth={3} />
                      ) : (
                        <Icon size={14} />
                      )}
                    </div>
                    <div className="hidden sm:flex flex-col min-w-0">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">
                        0{s.num}
                      </span>
                      <span
                        className={`text-xs font-semibold truncate ${
                          isCurrent ? "text-white" : isCompleted ? "text-white/80" : "text-white/40"
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile Current Step Subtitle */}
            <div className="sm:hidden flex items-center justify-between px-3 pt-3 text-xs text-white/60">
              <span className="font-semibold text-white">
                Adım {step}/4: {stepLabels[step - 1].title}
              </span>
              <span className="text-white/40 text-[11px]">{stepLabels[step - 1].desc}</span>
            </div>
          </div>
        )}

        {/* ─── MAIN BOOKING CARD CONTAINER ─── */}
        <div ref={formRef} className="max-w-4xl mx-auto">
          <div className="bg-[#0C121D] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 shadow-[0_12px_45px_rgba(0,0,0,0.45)] relative overflow-hidden backdrop-blur-xl">
            {/* Top decorative subtle bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C8703A] to-transparent opacity-80" />

            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <form key="booking-form" onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
                  {/* ────────────────── STEP 1: HİZMET SEÇİMİ ────────────────── */}
                  {step === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-serif text-white font-normal">
                            Hizmet Seçin
                          </h3>
                          <p className="text-white/45 text-xs sm:text-sm mt-1">
                            Almak istediğiniz saç, sakal veya özel bakım hizmetini belirleyin.
                          </p>
                        </div>

                        {/* Category filter pills */}
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { id: "all", label: "Tümü" },
                            { id: "popular", label: "Popüler" },
                            { id: "hair", label: "Saç" },
                            { id: "beard", label: "Sakal" },
                            { id: "vip", label: "VIP" },
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setSelectedCategory(cat.id)}
                              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                                selectedCategory === cat.id
                                  ? "bg-[#C8703A] text-white shadow-[0_2px_10px_rgba(200,112,58,0.3)]"
                                  : "bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08]"
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {loadingCatalog ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/50">
                          <Loader2 className="w-6 h-6 animate-spin text-[#C8703A]" />
                          <span className="text-sm">Hizmet listesi yükleniyor...</span>
                        </div>
                      ) : catalogError ? (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                          {catalogError}
                        </div>
                      ) : filteredServices.length === 0 ? (
                        <div className="text-center py-12 text-white/40 text-sm">
                          Bu kategoride listelenecek hizmet bulunamadı.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                          {filteredServices.map((s) => {
                            const Icon = SERVICE_ICONS[s.slug] || Scissors;
                            const isSelected = formData.serviceId === s.id;

                            return (
                              <div
                                key={s.id}
                                onClick={() => {
                                  setFormData({ ...formData, serviceId: s.id });
                                  setErrors({});
                                }}
                                className={`group p-5 rounded-xl sm:rounded-2xl border cursor-pointer transition-all duration-300 relative flex flex-col justify-between ${
                                  isSelected
                                    ? "bg-gradient-to-br from-[#1C2538] to-[#131B2A] border-[#C8703A] shadow-[0_6px_25px_rgba(200,112,58,0.25)] ring-1 ring-[#C8703A]/70"
                                    : "bg-white/[0.02] border-white/[0.07] hover:border-white/20 hover:bg-white/[0.04]"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <div
                                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                                      isSelected
                                        ? "bg-[#C8703A] text-white shadow-[0_0_15px_rgba(200,112,58,0.5)]"
                                        : "bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white"
                                    }`}
                                  >
                                    <Icon size={18} />
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {s.popular && (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#C8703A]/20 text-[#E5A869] border border-[#C8703A]/30">
                                        Popüler
                                      </span>
                                    )}
                                    <span className="text-[11px] font-medium text-white/40 px-2.5 py-1 rounded-full bg-white/[0.03]">
                                      ⏱ {s.duration} dk
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-1 mb-4">
                                  <h4
                                    className={`text-base font-semibold transition-colors ${
                                      isSelected ? "text-white" : "text-white/90 group-hover:text-white"
                                    }`}
                                  >
                                    {s.name}
                                  </h4>
                                  <p className="text-white/45 text-xs line-clamp-2 leading-relaxed">
                                    {s.description || "M Studio özel teknikleriyle uygulanan profesyonel bakım ritüeli."}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                                  <span className="text-lg sm:text-xl font-serif font-bold text-[#E5A869]">
                                    ₺{s.price}
                                  </span>

                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                                      isSelected
                                        ? "bg-[#C8703A] text-white scale-110 shadow-[0_0_10px_rgba(200,112,58,0.5)]"
                                        : "border border-white/20 text-transparent group-hover:border-white/40"
                                    }`}
                                  >
                                    <Check size={12} strokeWidth={3} />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {errors.service && (
                        <p className="text-xs text-red-400 font-medium bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                          {errors.service}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* ────────────────── STEP 2: STİLİST SEÇİMİ ────────────────── */}
                  {step === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      <div className="pb-2 border-b border-white/[0.06]">
                        <h3 className="text-xl sm:text-2xl font-serif text-white font-normal">
                          Stilist / Berber Seçin
                        </h3>
                        <p className="text-white/45 text-xs sm:text-sm mt-1">
                          Deneyimli ustalarımız arasından tercihinizi yapın veya ilk müsait berber ile devam edin.
                        </p>
                      </div>

                      {/* No Preference / Quick Match Card */}
                      <div
                        onClick={() =>
                          setFormData({ ...formData, noPreference: true, barberId: 0, time: "" })
                        }
                        className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between gap-4 ${
                          formData.noPreference
                            ? "bg-gradient-to-r from-[#1C2538] to-[#131B2A] border-[#C8703A] shadow-[0_6px_25px_rgba(200,112,58,0.25)] ring-1 ring-[#C8703A]/70"
                            : "bg-white/[0.02] border-white/[0.07] hover:border-white/20 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              formData.noPreference
                                ? "bg-[#C8703A] text-white shadow-[0_0_15px_rgba(200,112,58,0.5)]"
                                : "bg-white/5 text-[#E5A869]"
                            }`}
                          >
                            <Zap size={22} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white text-base">
                                Fark Etmez / İlk Müsait Berber
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                En Hızlı
                              </span>
                            </div>
                            <p className="text-white/45 text-xs mt-0.5">
                              Müsait olan usta berberlerimizden birine otomatik olarak atanır.
                            </p>
                          </div>
                        </div>

                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-all ${
                            formData.noPreference
                              ? "bg-[#C8703A] text-white scale-110 shadow-[0_0_10px_rgba(200,112,58,0.5)]"
                              : "border border-white/20 text-transparent"
                          }`}
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>
                      </div>

                      {barbers.length === 0 ? (
                        <p className="text-sm text-white/50 py-2">
                          Şu an sistemde kayıtlı berber bulunamadı. &quot;Fark Etmez&quot; seçeneğiyle devam edebilirsiniz.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {barbers.map((b) => {
                            const isSelected = formData.barberId === b.id && !formData.noPreference;
                            const isOwner = b.name.toLowerCase().includes("mehmet") || b.position.toLowerCase().includes("kurucu");

                            return (
                              <div
                                key={b.id}
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    barberId: b.id,
                                    noPreference: false,
                                    time: "",
                                  })
                                }
                                className={`group p-5 rounded-2xl border cursor-pointer text-center flex flex-col items-center justify-between transition-all duration-300 relative ${
                                  isSelected
                                    ? "bg-gradient-to-b from-[#1C2538] to-[#131B2A] border-[#C8703A] shadow-[0_8px_25px_rgba(200,112,58,0.25)] ring-1 ring-[#C8703A]/70"
                                    : "bg-white/[0.02] border-white/[0.07] hover:border-white/20 hover:bg-white/[0.04]"
                                }`}
                              >
                                {isOwner && (
                                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#C8703A]/20 text-[#E5A869] border border-[#C8703A]/30 flex items-center gap-1">
                                    <Crown size={10} /> Baş Berber
                                  </div>
                                )}

                                <div className="relative mt-2 mb-4">
                                  <div
                                    className={`relative w-20 h-20 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                                      isSelected
                                        ? "border-[#C8703A] shadow-[0_0_20px_rgba(200,112,58,0.5)]"
                                        : "border-white/20 group-hover:border-white/40"
                                    }`}
                                  >
                                    {b.avatar ? (
                                      <Image
                                        src={b.avatar}
                                        alt={b.name}
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-[#1A2232] text-[#E5A869] font-bold text-lg flex items-center justify-center">
                                        {getInitials(b.name)}
                                      </div>
                                    )}
                                  </div>

                                  {/* Availability badge */}
                                  <span className="absolute bottom-0 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0C121D]" />
                                </div>

                                <div className="space-y-1 w-full">
                                  <h4 className="font-semibold text-white text-base">
                                    {b.name}
                                  </h4>
                                  <p className="text-[11px] font-medium text-[#E5A869] tracking-wider uppercase">
                                    {b.position || "Usta Berber"}
                                  </p>
                                  {b.specialty && (
                                    <p className="text-white/40 text-[11px] line-clamp-2 mt-1">
                                      {b.specialty}
                                    </p>
                                  )}
                                </div>

                                <div className="mt-4 pt-3 border-t border-white/[0.06] w-full flex items-center justify-center gap-1.5 text-xs text-white/50">
                                  <span
                                    className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-all ${
                                      isSelected
                                        ? "bg-[#C8703A] text-white"
                                        : "bg-white/[0.04] text-white/60 group-hover:bg-white/[0.08]"
                                    }`}
                                  >
                                    {isSelected ? "Seçildi" : "Seç"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {errors.barber && (
                        <p className="text-xs text-red-400 font-medium bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                          {errors.barber}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* ────────────────── STEP 3: TARİH & SAAT ────────────────── */}
                  {step === 3 && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      <div className="pb-2 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-serif text-white font-normal">
                            Tarih ve Saat Seçimi
                          </h3>
                          <p className="text-white/45 text-xs sm:text-sm mt-1">
                            Size uygun randevu gününü ve saatini belirleyin.
                          </p>
                        </div>
                        {formData.date && (
                          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C8703A]/15 border border-[#C8703A]/30 text-[#E5A869] text-xs font-semibold self-start sm:self-auto">
                            <CalendarIcon size={13} />
                            <span>{formatIsoDateTr(formData.date)}</span>
                          </div>
                        )}
                      </div>

                      {/* Date Horizontal Carousel */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">
                          Randevu Tarihi
                        </label>
                        <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin">
                          {nextDays.map((day) => {
                            const isSelected = formData.date === day.isoDate;
                            const isToday = day.isoDate === todayIso;

                            return (
                              <button
                                type="button"
                                key={day.isoDate}
                                onClick={() => setFormData({ ...formData, date: day.isoDate, time: "" })}
                                className={`flex flex-col items-center justify-center py-3.5 px-4 rounded-xl border min-w-[80px] shrink-0 transition-all duration-300 ${
                                  isSelected
                                    ? "bg-gradient-to-b from-[#C8703A] to-[#B5612E] border-[#E5A869] text-white shadow-[0_6px_20px_rgba(200,112,58,0.4)] scale-105"
                                    : "bg-white/[0.02] border-white/[0.08] text-white/60 hover:text-white hover:border-white/25 hover:bg-white/[0.04]"
                                }`}
                              >
                                <span
                                  className={`text-[10px] uppercase font-bold tracking-wider ${
                                    isSelected ? "text-white" : isToday ? "text-[#E5A869]" : "text-white/40"
                                  }`}
                                >
                                  {isToday ? "Bugün" : day.dayName}
                                </span>
                                <span className="text-xl font-serif font-bold my-0.5">
                                  {day.dayNum}
                                </span>
                                <span
                                  className={`text-[9px] uppercase font-medium ${
                                    isSelected ? "text-white/80" : "text-white/40"
                                  }`}
                                >
                                  {day.month}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time Slot Picker */}
                      {formData.date && (
                        <div className="pt-4 border-t border-white/[0.06] space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">
                                Müsait Randevu Saatleri
                              </label>
                              <p className="text-xs text-white/40 mt-0.5">
                                {availableSlots.length > 0
                                  ? `${availableSlots.length} müsait saat bulundu`
                                  : "Bu günde müsait saat kontrol ediliyor..."}
                              </p>
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-3 text-[10px] text-white/40 uppercase tracking-wider">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#C8703A]" /> Müsait
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-white/20" /> Dolu
                              </span>
                            </div>
                          </div>

                          {loadingSlots ? (
                            <div className="flex items-center justify-center py-12 gap-3 text-white/50">
                              <Loader2 className="w-5 h-5 animate-spin text-[#C8703A]" />
                              <span className="text-sm">Müsait saatler güncelleniyor...</span>
                            </div>
                          ) : slotsError ? (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm space-y-2">
                              <p>{slotsError}</p>
                              <button
                                type="button"
                                onClick={() => setSlotsRetry((n) => n + 1)}
                                className="text-xs text-white underline hover:text-[#E5A869]"
                              >
                                Tekrar dene
                              </button>
                            </div>
                          ) : slots.length === 0 ? (
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center space-y-3">
                              <p className="text-white/50 text-sm">
                                {formData.date === todayIso
                                  ? "Bugün için tüm randevu saatleri dolmuştur."
                                  : "Bu tarihte uygun randevu saati bulunmuyor."}
                              </p>
                              {formData.date === todayIso && tomorrowIso && (
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, date: tomorrowIso, time: "" })}
                                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#E5A869] hover:underline"
                                >
                                  <span>Yarınki saatlere göz at</span>
                                  <ArrowRight size={12} />
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* Grouped Time Slots (Sabah, Öğle, Akşam) */}
                              {[
                                { title: "☀️ Sabah", list: groupedSlots.morning },
                                { title: "🌤️ Öğleden Sonra", list: groupedSlots.afternoon },
                                { title: "🌙 Akşam", list: groupedSlots.evening },
                              ].map((grp) => {
                                if (grp.list.length === 0) return null;
                                return (
                                  <div key={grp.title} className="space-y-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">
                                      {grp.title}
                                    </span>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-2.5">
                                      {grp.list.map((slot) => {
                                        if (slot.available) {
                                          const isSelected = formData.time === slot.time;
                                          return (
                                            <button
                                              type="button"
                                              key={slot.time}
                                              onClick={() => {
                                                setFormData({ ...formData, time: slot.time });
                                                setErrors((e) => ({ ...e, time: "" }));
                                              }}
                                              className={`py-3 px-2 rounded-xl text-xs font-bold transition-all duration-200 border text-center flex flex-col items-center justify-center gap-1 ${
                                                isSelected
                                                  ? "bg-[#C8703A] text-white border-[#E5A869] shadow-[0_4px_16px_rgba(200,112,58,0.4)] scale-105"
                                                  : "bg-white/[0.03] border-white/[0.08] text-white/90 hover:border-white/30 hover:bg-white/[0.07]"
                                              }`}
                                            >
                                              <span>{slot.time}</span>
                                            </button>
                                          );
                                        }

                                        const label = slotUnavailableLabel(slot.reason);
                                        return (
                                          <div
                                            key={slot.time}
                                            title={slotUnavailableHint(slot.time, slot.reason)}
                                            className="py-2.5 px-2 rounded-xl border border-white/[0.03] bg-white/[0.01] text-center select-none cursor-not-allowed opacity-35"
                                          >
                                            <span className="block text-xs font-medium text-white/40 line-through">
                                              {slot.time}
                                            </span>
                                            <span className="block text-[8px] uppercase tracking-wider font-semibold text-white/30 mt-0.5">
                                              {label}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {errors.date && <p className="text-xs text-red-400">{errors.date}</p>}
                      {errors.time && <p className="text-xs text-red-400">{errors.time}</p>}
                    </motion.div>
                  )}

                  {/* ────────────────── STEP 4: BİLGİLER & ONAY ────────────────── */}
                  {step === 4 && (
                    <motion.div
                      key="step-4"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      <div className="pb-2 border-b border-white/[0.06]">
                        <h3 className="text-xl sm:text-2xl font-serif text-white font-normal">
                          İletişim Bilgileri & Randevu Özeti
                        </h3>
                        <p className="text-white/45 text-xs sm:text-sm mt-1">
                          Onay ve bildirim için bilgilerinizi eksiksiz girin.
                        </p>
                      </div>

                      {/* Appointment Ticket Preview Card */}
                      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#121927] to-[#0D131F] border border-[#C8703A]/30 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
                          <div className="flex items-center gap-2">
                            <Scissors size={14} className="text-[#C8703A]" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E5A869]">
                              M Studio Randevu Özeti
                            </span>
                          </div>
                          <span className="text-lg font-serif font-bold text-[#E5A869]">
                            ₺{selectedService?.price}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider mb-1">
                              Hizmet
                            </span>
                            <span className="text-white font-semibold block">{selectedService?.name}</span>
                            <span className="text-white/40 text-[11px]">{selectedService?.duration} dk</span>
                          </div>

                          <div>
                            <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider mb-1">
                              Stilist
                            </span>
                            <span className="text-white font-semibold block">
                              {formData.noPreference ? "İlk Müsait Berber" : selectedBarber?.name}
                            </span>
                            <span className="text-white/40 text-[11px]">
                              {formData.noPreference ? "Otomatik Atama" : selectedBarber?.position || "Usta Berber"}
                            </span>
                          </div>

                          <div>
                            <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider mb-1">
                              Tarih
                            </span>
                            <span className="text-white font-semibold block">
                              {formatIsoDateTr(formData.date)}
                            </span>
                          </div>

                          <div>
                            <span className="text-white/40 block text-[10px] uppercase font-bold tracking-wider mb-1">
                              Saat
                            </span>
                            <span className="text-[#E5A869] font-bold text-sm block">
                              {formData.time}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Information Alert */}
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                        <Mail size={16} className="text-[#C8703A] shrink-0 mt-0.5" />
                        <p className="text-xs text-white/60 leading-relaxed">
                          <strong className="text-white">E-posta ve telefon önemlidir:</strong> Randevunuz salonumuz tarafından onaylandığında, detaylı randevu bilgilendirmesi e-posta adresinize gönderilir.
                        </p>
                      </div>

                      {/* Form Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                            <User size={12} className="text-[#C8703A]" /> Ad Soyad <span className="text-[#C8703A]">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full bg-white/[0.03] border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors ${
                              errors.name ? "border-red-400 focus:border-red-400" : "border-white/10 focus:border-[#C8703A]"
                            }`}
                            placeholder="Adınız Soyadınız"
                            autoComplete="name"
                            required
                          />
                          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                            <Phone size={12} className="text-[#C8703A]" /> Telefon <span className="text-[#C8703A]">*</span>
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`w-full bg-white/[0.03] border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors ${
                              errors.phone ? "border-red-400 focus:border-red-400" : "border-white/10 focus:border-[#C8703A]"
                            }`}
                            placeholder="05XX XXX XX XX"
                            autoComplete="tel"
                            maxLength={11}
                            required
                          />
                          {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                            <Mail size={12} className="text-[#C8703A]" /> E-Posta <span className="text-[#C8703A]">*</span>
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full bg-white/[0.03] border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors ${
                              errors.email ? "border-red-400 focus:border-red-400" : "border-white/10 focus:border-[#C8703A]"
                            }`}
                            placeholder="ornek@gmail.com"
                            autoComplete="email"
                            inputMode="email"
                            required
                          />
                          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-2">
                            Özel Notlar <span className="text-white/30 font-normal lowercase">(opsiyonel)</span>
                          </label>
                          <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={2}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C8703A] resize-none placeholder:text-white/20"
                            placeholder="Saç modeliniz veya belirtmek istediğiniz detaylar..."
                          />
                        </div>
                      </div>

                      {/* Consent Checkbox */}
                      <label className="flex items-start gap-3 cursor-pointer group pt-2">
                        <input
                          type="checkbox"
                          checked={formData.agreed}
                          onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                          className="mt-1 w-4 h-4 accent-[#C8703A] rounded cursor-pointer"
                          required
                        />
                        <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors leading-relaxed">
                          Randevu saatinde salonda hazır bulunacağımı taahhüt ediyor; randevu onayı ve hatırlatması için benimle iletişim kurulmasını kabul ediyorum.
                        </span>
                      </label>
                      {errors.agreed && <p className="text-xs text-red-400 -mt-2">{errors.agreed}</p>}
                      {errors.submit && <p className="text-sm text-red-400">{errors.submit}</p>}
                    </motion.div>
                  )}

                  {/* ────────────────── BUTTON FOOTER CONTROLS ────────────────── */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/[0.08] gap-4">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-xs font-bold tracking-wider uppercase transition-colors"
                      >
                        <ChevronLeft size={16} />
                        <span>Geri</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {step < 4 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center gap-2.5 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#C8703A] to-[#B5612E] hover:from-[#B5612E] hover:to-[#9E4E20] text-white text-xs font-bold tracking-widest uppercase shadow-[0_6px_25px_rgba(200,112,58,0.35)] hover:shadow-[0_8px_30px_rgba(200,112,58,0.5)] transition-all duration-300"
                      >
                        <span>İleri</span>
                        <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2.5 px-8 sm:px-11 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#C8703A] to-[#B5612E] hover:from-[#B5612E] hover:to-[#9E4E20] text-white text-xs font-bold tracking-widest uppercase shadow-[0_6px_25px_rgba(200,112,58,0.4)] disabled:opacity-50 transition-all duration-300"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Kaydediliyor...</span>
                          </>
                        ) : (
                          <>
                            <CalendarCheck size={16} />
                            <span>Randevuyu Onayla</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                /* ────────────────── SUCCESS VIEW ────────────────── */
                <motion.div
                  key="success-screen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-6 sm:py-10 space-y-6 sm:space-y-8"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.2)]">
                    <Check size={40} strokeWidth={2.5} />
                  </div>

                  <div className="space-y-2">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[#E5A869] bg-[#C8703A]/15 border border-[#C8703A]/30 px-3.5 py-1 rounded-full">
                      Talebiniz Alındı
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-serif font-normal text-white">
                      Randevunuz Başarıyla Oluşturuldu!
                    </h3>
                    <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed">
                      Sayın <strong className="text-white">{formData.name.trim()}</strong>, randevu talebiniz sisteme iletilmiştir.
                    </p>
                  </div>

                  {appointmentResult && (
                    <div className="max-w-lg mx-auto p-6 rounded-2xl bg-[#0E1523] border border-white/10 text-left space-y-4 shadow-xl relative overflow-hidden">
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                          Randevu No
                        </span>
                        <span className="text-sm font-mono font-bold text-[#E5A869]">
                          #{appointmentResult.id}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-white/40 block text-[10px] uppercase font-bold mb-0.5">Hizmet</span>
                          <span className="text-white font-semibold">{appointmentResult.service}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[10px] uppercase font-bold mb-0.5">Stilist</span>
                          <span className="text-white font-semibold">{appointmentResult.barber}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[10px] uppercase font-bold mb-0.5">Tarih</span>
                          <span className="text-white font-semibold">{formatIsoDateTr(appointmentResult.date)}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[10px] uppercase font-bold mb-0.5">Saat</span>
                          <span className="text-[#E5A869] font-bold">{appointmentResult.time}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                        <span className="text-xs text-white/50">Hizmet Bedeli</span>
                        <span className="text-base font-serif font-bold text-[#E5A869]">
                          ₺{appointmentResult.price}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white/50 max-w-lg mx-auto flex items-start gap-3 text-left">
                    <ShieldCheck size={18} className="text-[#C8703A] shrink-0 mt-0.5" />
                    <span>
                      Salon ekibimiz randevunuzu onayladığında <strong className="text-white">{appointmentResult?.email}</strong> adresinize otomatik e-posta gönderilecektir.
                    </span>
                  </div>

                  {/* WhatsApp Direct Confirmation & Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    {settings.phone && appointmentResult ? (
                      <a
                        href={toWhatsAppHref(
                          settings.phone,
                          `Merhaba M Studio, #${appointmentResult.id} numaralı randevumu (${appointmentResult.service} - ${formatIsoDateTr(appointmentResult.date)} saat ${appointmentResult.time}) aldım, teyit etmek istiyorum.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-black text-xs font-bold tracking-wider uppercase transition-colors"
                      >
                        <WhatsAppIcon className="w-4 h-4" />
                        <span>WhatsApp ile Onayla</span>
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => {
                        setIsSuccess(false);
                        setStep(1);
                        setAppointmentResult(null);
                        setFormData({
                          serviceId: 0,
                          barberId: 0,
                          noPreference: false,
                          date: "",
                          time: "",
                          name: "",
                          phone: "",
                          email: "",
                          notes: "",
                          agreed: false,
                        });
                      }}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-white/15 text-white/80 hover:text-white hover:border-white/30 text-xs font-bold tracking-wider uppercase transition-colors"
                    >
                      Yeni Randevu Al
                    </button>

                    <Link
                      href="/"
                      className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold tracking-wider uppercase transition-colors"
                    >
                      Ana Sayfaya Dön
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
