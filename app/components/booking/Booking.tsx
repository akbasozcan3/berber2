"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
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
  if (reason === "Dolu") return `${time} — Bu saat şu an dolu`;
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
    price?: number;
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
        isoDate,
      };
    });
  }, []);

  const bookingHorizon = Math.min(Math.max(settings.maxFutureBooking || 30, 7), 60);
  const nextDays = getNextDays(bookingHorizon);

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

  const validateStep = () => {
    const tempErrors: Record<string, string> = {};
    if (step === 1 && !formData.serviceId) tempErrors.service = "Lütfen bir hizmet seçin.";
    if (step === 2 && !formData.noPreference && !formData.barberId)
      tempErrors.barber = "Lütfen bir stilist seçin veya 'Tercihim Yok' seçeneğini işaretleyin.";
    if (step === 3) {
      if (!formData.date) tempErrors.date = "Lütfen bir gün seçin.";
      if (!formData.time) tempErrors.time = "Lütfen bir saat seçin.";
      else if (!availableSlots.some((s) => s.time === formData.time)) {
        tempErrors.time = "Seçilen saat artık müsait değil. Lütfen başka saat seçin.";
      }
    }
    if (step === 4) {
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
      const scrollTo = window.scrollY + rect.top - (viewH - rect.height) / 2;
      window.scrollTo({ top: Math.max(0, scrollTo), behavior: "smooth" });
    }, 50);
  };

  const handleNext = () => {
    if (!validateStep()) return;
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
    if (!validateStep()) return;
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
        setErrors({ time: "Seçilen saat artık müsait değil. Lütfen başka saat seçin." });
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
        service: result.appointment.service || curService?.name || "",
        barber: result.appointment.barber || curBarber?.name || "İlk Müsait Berber",
        date: formData.date,
        time: formData.time,
        email: customerEmail,
        price: curService?.price,
      });
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "Randevu oluşturulamadı." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = services.find((s) => s.id === formData.serviceId);
  const selectedBarber = barbers.find((b) => b.id === formData.barberId);
  const availableSlots = slots.filter((s) => s.available);
  const bookedSlots = slots.filter((s) => !s.available && s.reason === "Dolu");
  const passedSlots = slots.filter((s) => !s.available && s.reason === "Geçmiş saat");
  const todayIso = toLocalIsoDate();
  const tomorrowIso = nextDays[1]?.isoDate ?? "";

  const slotSummary = [
    availableSlots.length > 0 ? `${availableSlots.length} müsait` : null,
    bookedSlots.length > 0 ? `${bookedSlots.length} dolu` : null,
    passedSlots.length > 0 ? `${passedSlots.length} geçti` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const getFormattedDate = (iso: string) => (iso ? formatIsoDateTr(iso) : "");

  return (
    <section id="booking" className="py-16 md:py-28 bg-[#0D1117] relative min-h-screen text-white">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />

      <div className="container mx-auto px-4 sm:px-6 md:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start">
          {/* ─── SOL KOLON: ZARİF EDİTÖRYAL BAŞLIK & DİKEY STEPPER ─── */}
          <div className="lg:col-span-4 space-y-10">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-8 h-[1px] bg-white" />
                <p className="text-[10px] font-bold tracking-[0.35em] text-white/60 uppercase">
                  Premium Rezervasyon
                </p>
              </div>
              <h2 className="text-5xl md:text-6xl font-serif font-light tracking-tight text-white mb-6 leading-none">
                Koltuk <br />
                <span className="italic text-white/35 font-light">Rezervasyonu</span>
              </h2>
              <p className="text-white/50 text-base font-light leading-relaxed">
                Online randevu alın. Müsait saatler anlık olarak güncellenir.
              </p>
            </div>

            <div className="relative border-l border-white/10 pl-4 sm:pl-6 space-y-5 sm:space-y-8 py-2">
              {["Hizmet Seçimi", "Stilist Tercihi", "Tarih & Saat", "Kişisel Bilgiler"].map(
                (label, i) => {
                  const stepNumber = i + 1;
                  const isDone = step > stepNumber;
                  const isCurrent = step === stepNumber;

                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => isDone && goToStep(stepNumber)}
                      className={`relative flex items-center gap-4 text-left transition-all ${
                        isDone ? "cursor-pointer group" : "cursor-default"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                          isDone
                            ? "bg-white text-black border-white group-hover:scale-105"
                            : isCurrent
                            ? "bg-[#C8703A] text-white border-[#C8703A] shadow-[0_0_14px_rgba(200,112,58,0.45)]"
                            : "bg-[#0D1117] text-white/30 border-white/15"
                        }`}
                      >
                        {isDone ? <Check size={12} strokeWidth={3} /> : `0${stepNumber}`}
                      </div>
                      <span
                        className={`text-[11px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider transition-colors ${
                          isCurrent
                            ? "text-white"
                            : isDone
                            ? "text-white/80 group-hover:text-white"
                            : "text-white/30"
                        }`}
                      >
                        {label}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* ─── SAĞ KOLON: KART FORMU ─── */}
          <div
            ref={formRef}
            className="lg:col-span-8 bg-[#121212]/50 border border-white/[0.08] rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-12 relative overflow-hidden backdrop-blur-md shadow-2xl"
          >
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <form key="booking-form" onSubmit={handleSubmit} className="space-y-10">
                  {/* ─── ADIM 1: HİZMET SEÇİMİ ─── */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                        <h3 className="text-xl font-serif font-light text-white">Hizmet Seçin</h3>
                        <span className="text-xs text-white/40 font-mono">{services.length} hizmet</span>
                      </div>

                      {loadingCatalog ? (
                        <div className="flex items-center gap-3 text-white/50 py-10 justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-[#C8703A]" />
                          Hizmetler yükleniyor...
                        </div>
                      ) : catalogError ? (
                        <p className="text-sm text-red-400 py-4">{catalogError}</p>
                      ) : services.length === 0 ? (
                        <p className="text-sm text-white/50 py-4">Şu an listelenecek hizmet bulunamadı.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {services.map((s) => {
                            const Icon = SERVICE_ICONS[s.slug] || Scissors;
                            const sel = formData.serviceId === s.id;
                            return (
                              <div
                                key={s.id}
                                onClick={() => {
                                  setFormData({ ...formData, serviceId: s.id });
                                  setErrors({});
                                }}
                                className={`p-5 sm:p-6 border rounded-xl cursor-pointer transition-all h-44 relative flex flex-col justify-between group ${
                                  sel
                                    ? "border-[#C8703A] bg-[#C8703A]/10 shadow-[0_4px_20px_rgba(200,112,58,0.18)]"
                                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div
                                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
                                      sel
                                        ? "border-[#C8703A] text-white bg-[#C8703A]"
                                        : "border-white/15 text-white/60 group-hover:text-white"
                                    }`}
                                  >
                                    <Icon size={16} />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {s.popular && (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#C8703A]/20 text-[#E5A869] border border-[#C8703A]/30">
                                        Popüler
                                      </span>
                                    )}
                                    <span className="text-xs font-mono text-white/40">{s.duration} dk</span>
                                  </div>
                                </div>
                                <div>
                                  <h4
                                    className={`text-base font-serif transition-colors ${
                                      sel ? "text-white font-medium" : "text-white/90 group-hover:text-white"
                                    }`}
                                  >
                                    {s.name}
                                  </h4>
                                  <p className="text-white/40 text-xs mt-1 line-clamp-1">{s.description}</p>
                                </div>
                                <span className="absolute bottom-5 right-5 font-serif text-xl font-medium text-white">
                                  ₺{s.price}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {errors.service && <p className="text-xs text-red-400 -mt-4">{errors.service}</p>}
                    </motion.div>
                  )}

                  {/* ─── ADIM 2: STİLİST SEÇİMİ ─── */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <h3 className="text-xl font-serif font-light text-white">Stilist Seçin</h3>

                      <div
                        onClick={() =>
                          setFormData({ ...formData, noPreference: true, barberId: 0, time: "" })
                        }
                        className={`p-5 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                          formData.noPreference
                            ? "border-[#C8703A] bg-[#C8703A]/10 shadow-[0_4px_20px_rgba(200,112,58,0.18)]"
                            : "border-white/[0.08] bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div>
                          <p
                            className={`font-medium ${
                              formData.noPreference ? "text-white font-semibold" : "text-white/90"
                            }`}
                          >
                            Tercihim Yok / İlk Müsait Berber
                          </p>
                          <p className="text-white/40 text-xs mt-1">
                            Müsait olan usta berberlerimize otomatik atanır
                          </p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                            formData.noPreference
                              ? "bg-[#C8703A] text-white border-[#C8703A]"
                              : "border-white/20 text-transparent"
                          }`}
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>
                      </div>

                      {barbers.length === 0 ? (
                        <p className="text-sm text-white/50 py-2">
                          Şu an sistemde berber bulunamadı. &quot;Tercihim Yok&quot; ile devam edebilirsiniz.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {barbers.map((b) => {
                            const sel = formData.barberId === b.id && !formData.noPreference;
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
                                className={`p-5 border rounded-xl cursor-pointer transition-all text-center flex flex-col items-center justify-between group ${
                                  sel
                                    ? "border-[#C8703A] bg-[#C8703A]/10 shadow-[0_4px_20px_rgba(200,112,58,0.18)]"
                                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
                                }`}
                              >
                                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-white/20 mb-3 group-hover:border-white/40 transition-colors">
                                  {b.avatar ? (
                                    <Image
                                      src={b.avatar}
                                      alt={b.name}
                                      fill
                                      className="object-cover"
                                      sizes="64px"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-white/10 text-white font-bold flex items-center justify-center">
                                      {getInitials(b.name)}
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-sm font-semibold text-white">{b.name}</h4>
                                  <p className="text-[11px] text-[#E5A869] uppercase tracking-wider">
                                    {b.position || "Usta Berber"}
                                  </p>
                                  {b.specialty && (
                                    <p className="text-white/40 text-xs line-clamp-1 mt-1">
                                      {b.specialty}
                                    </p>
                                  )}
                                </div>
                                <div className="mt-3 pt-3 border-t border-white/[0.06] w-full text-center">
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wider ${
                                      sel ? "text-white" : "text-white/40 group-hover:text-white/70"
                                    }`}
                                  >
                                    {sel ? "Seçildi" : "Seç"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {errors.barber && <p className="text-xs text-red-400 -mt-4">{errors.barber}</p>}
                    </motion.div>
                  )}

                  {/* ─── ADIM 3: TARİH & SAAT ─── */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                        <h3 className="text-xl font-serif font-light text-white">Tarih & Saat Seçin</h3>
                        {slotSummary && (
                          <span className="text-xs text-white/40 font-mono">{slotSummary}</span>
                        )}
                      </div>

                      {/* Tarih Butonları */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
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
                                className={`flex flex-col items-center justify-center py-3.5 px-4 rounded-xl border min-w-[76px] shrink-0 transition-all ${
                                  isSelected
                                    ? "bg-[#C8703A] text-white border-[#C8703A] shadow-[0_4px_16px_rgba(200,112,58,0.35)] font-bold scale-105"
                                    : "bg-white/[0.02] border-white/[0.08] text-white/60 hover:text-white hover:border-white/30 hover:bg-white/[0.04]"
                                }`}
                              >
                                <span className="text-[10px] uppercase font-bold tracking-wider mb-1">
                                  {isToday ? "Bugün" : day.dayName}
                                </span>
                                <span className="text-lg font-serif leading-none mb-1">{day.dayNum}</span>
                                <span className="text-[10px] opacity-60 uppercase">{day.month}</span>
                              </button>
                            );
                          })}
                        </div>
                        {errors.date && <p className="text-xs text-red-400">{errors.date}</p>}
                      </div>

                      {/* Saat Dilimleri */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                            Müsait Saatler {formData.date && `(${getFormattedDate(formData.date)})`}
                          </label>
                          {slotsError && (
                            <button
                              type="button"
                              onClick={() => setSlotsRetry((c) => c + 1)}
                              className="text-xs text-[#E5A869] hover:underline"
                            >
                              Tekrar Dene
                            </button>
                          )}
                        </div>

                        {loadingSlots ? (
                          <div className="flex items-center gap-3 text-white/50 py-12 justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-[#C8703A]" />
                            Müsait saatler kontrol ediliyor...
                          </div>
                        ) : slotsError ? (
                          <p className="text-sm text-red-400 py-4">{slotsError}</p>
                        ) : slots.length === 0 ? (
                          <p className="text-sm text-white/40 py-6 text-center">
                            Lütfen bir tarih seçin veya bu tarihte çalışma saati bulunmuyor.
                          </p>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-72 overflow-y-auto pr-1">
                            {slots.map((s) => {
                              const sel = formData.time === s.time;
                              const unavail = !s.available;

                              return (
                                <button
                                  type="button"
                                  key={s.time}
                                  disabled={unavail}
                                  onClick={() => setFormData({ ...formData, time: s.time })}
                                  title={unavail ? slotUnavailableHint(s.time, s.reason) : s.time}
                                  className={`py-3 px-2 rounded-xl text-xs font-mono font-medium transition-all text-center border relative ${
                                    sel
                                      ? "bg-[#C8703A] text-white border-[#C8703A] shadow-[0_2px_12px_rgba(200,112,58,0.35)] font-bold"
                                      : unavail
                                      ? "bg-white/[0.01] border-white/[0.03] text-white/20 cursor-not-allowed line-through"
                                      : "bg-white/[0.02] border-white/[0.08] text-white/80 hover:text-white hover:border-white/30 hover:bg-white/[0.05]"
                                  }`}
                                >
                                  {s.time}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {errors.time && <p className="text-xs text-red-400">{errors.time}</p>}
                      </div>
                    </motion.div>
                  )}

                  {/* ─── ADIM 4: KİŞİSEL BİLGİLER & ONAY ─── */}
                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-serif font-light text-white">İletişim & Onay</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">
                            Ad Soyad *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Örn: Mehmet Yılmaz"
                              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-white/40 transition-colors"
                            />
                          </div>
                          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">
                            Telefon Numarası *
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="05XX XXX XX XX"
                              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-white/40 transition-colors"
                            />
                          </div>
                          {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">
                          E-posta Adresi *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="ad@ornek.com"
                            className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-white/40 transition-colors"
                          />
                        </div>
                        {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">
                          Özel İstek / Not (Opsiyonel)
                        </label>
                        <textarea
                          rows={2}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Eklemek istediğiniz notlar veya tercihler..."
                          className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/40 transition-colors"
                        />
                      </div>

                      <label className="flex items-start gap-3 cursor-pointer group pt-1">
                        <input
                          type="checkbox"
                          checked={formData.agreed}
                          onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                          className="mt-1 accent-white"
                          required
                        />
                        <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors leading-relaxed">
                          Randevu bilgilerimin doğruluğunu onaylıyorum. Randevum onaylandığında SMS / e-posta ile
                          bilgilendirilmeyi kabul ediyorum.
                        </span>
                      </label>
                      {errors.agreed && <p className="text-xs text-red-400 -mt-2">{errors.agreed}</p>}

                      {/* Randevu Özeti Kartı */}
                      <div className="p-5 sm:p-6 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">
                          Randevu Özeti
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-white/40 block mb-0.5">Seçilen Hizmet</span>
                            <span className="text-white font-semibold">
                              {selectedService?.name} — ₺{selectedService?.price}
                            </span>
                          </div>
                          <div>
                            <span className="text-white/40 block mb-0.5">Stilist / Berber</span>
                            <span className="text-white font-semibold">
                              {formData.noPreference ? "İlk Müsait Berber" : selectedBarber?.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-white/40 block mb-0.5">Randevu Tarihi</span>
                            <span className="text-white font-semibold">{getFormattedDate(formData.date)}</span>
                          </div>
                          <div>
                            <span className="text-white/40 block mb-0.5">Randevu Saati</span>
                            <span className="text-[#E5A869] font-bold text-sm">{formData.time}</span>
                          </div>
                        </div>
                      </div>
                      {errors.submit && <p className="text-sm text-red-400">{errors.submit}</p>}
                    </motion.div>
                  )}

                  {/* ─── ALT BUTONLAR ─── */}
                  <div className="flex justify-between items-center gap-3 pt-8 border-t border-white/[0.06]">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="flex items-center gap-2 text-white/60 hover:text-white text-[11px] font-bold tracking-widest uppercase transition-colors"
                      >
                        <ChevronLeft size={14} /> Geri
                      </button>
                    ) : (
                      <div />
                    )}

                    {step < 4 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="bg-white text-black hover:bg-[#C8703A] hover:text-white px-8 sm:px-10 py-4 rounded-full text-[11px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_25px_rgba(200,112,58,0.35)]"
                      >
                        İleri <ChevronRight size={14} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-white text-black hover:bg-[#C8703A] hover:text-white px-8 sm:px-12 py-4 rounded-full text-[11px] font-bold tracking-widest uppercase disabled:opacity-50 transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:shadow-[0_4px_25px_rgba(200,112,58,0.35)]"
                      >
                        {isSubmitting ? "Kaydediliyor..." : "Randevuyu Onayla"}
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                /* ─── BAŞARILI EKRANI ─── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10 sm:py-14 space-y-8"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                    <Check size={36} strokeWidth={2.5} />
                  </div>

                  <div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#E5A869] bg-[#C8703A]/10 border border-[#C8703A]/25 px-3.5 py-1 rounded-full mb-4">
                      Talebiniz Alındı
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-serif font-light text-white">
                      Randevunuz Başarıyla Oluşturuldu!
                    </h3>
                    <p className="text-white/60 text-sm max-w-lg mx-auto mt-3 leading-relaxed">
                      Sayın <span className="text-white font-semibold">{formData.name.trim()}</span>, randevu talebiniz
                      M Studio Hairdresser sistemine iletildi.
                    </p>

                    {appointmentResult && (
                      <div className="mt-8 p-6 bg-white/[0.03] border border-white/[0.08] rounded-xl text-left max-w-lg mx-auto space-y-3 text-sm">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                          Randevu Detayları
                        </p>
                        <p>
                          <span className="text-white/40">Randevu No:</span>{" "}
                          <span className="text-white font-semibold">#{appointmentResult.id}</span>
                        </p>
                        <p>
                          <span className="text-white/40">Hizmet:</span>{" "}
                          <span className="text-white">{appointmentResult.service}</span>
                        </p>
                        <p>
                          <span className="text-white/40">Stilist:</span>{" "}
                          <span className="text-white">{appointmentResult.barber}</span>
                        </p>
                        <p>
                          <span className="text-white/40">Tarih:</span>{" "}
                          <span className="text-white">{getFormattedDate(appointmentResult.date)}</span>
                        </p>
                        <p>
                          <span className="text-white/40">Saat:</span>{" "}
                          <span className="text-[#E5A869] font-bold text-base">{appointmentResult.time}</span>
                        </p>
                        {appointmentResult.price ? (
                          <p>
                            <span className="text-white/40">Tutar:</span>{" "}
                            <span className="text-white font-semibold">₺{appointmentResult.price}</span>
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* WhatsApp Doğrulama Linki */}
                  {settings.phone && appointmentResult && (
                    <div className="max-w-lg mx-auto">
                      <a
                        href={toWhatsAppHref(
                          settings.phone,
                          `Merhaba M Studio! #${appointmentResult.id} numaralı randevumu oluşturdum: ${appointmentResult.service} - ${getFormattedDate(appointmentResult.date)} saat ${appointmentResult.time}. Onayınızı rica ederim.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2.5 w-full bg-[#25D366] hover:bg-[#20ba59] text-white px-6 py-4 rounded-xl text-sm font-semibold transition-all shadow-[0_4px_20px_rgba(37,211,102,0.3)]"
                      >
                        <WhatsAppIcon className="w-5 h-5" />
                        WhatsApp ile Hızlı Teyit Et
                      </a>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
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
                      className="border border-white/15 text-white/80 hover:text-white hover:border-white/35 px-8 sm:px-10 py-3.5 rounded-full text-[11px] font-bold tracking-widest uppercase transition-colors"
                    >
                      Yeni Randevu Al
                    </button>
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
