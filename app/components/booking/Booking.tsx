"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors, Sparkles, Crown, ChevronRight, ChevronLeft,
  User, Phone, Mail, Check, Users, Loader2,
} from "lucide-react";
import { api, type Service, type Barber, type TimeSlot } from "@/lib/api/client";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { toLocalIsoDate, formatIsoDateTr, getInitials } from "@/lib/utils/format";
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
}: {
  initialServices?: Service[];
  initialBarbers?: Barber[];
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
  } | null>(null);

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
    if (step === 2 && !formData.noPreference && !formData.barberId) tempErrors.barber = "Lütfen bir stilist seçin veya tercih yok seçin.";
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

  const handleNext = () => {
    if (!validateStep()) return;
    const nextStep = step + 1;
    if (nextStep === 3 && !formData.date) {
      setFormData((prev) => ({ ...prev, date: nextBookableIsoDate(), time: "" }));
    }
    setStep(nextStep);
    // Bir sonraki step'e geçince form card'ı viewport'ta ortala
    setTimeout(() => {
      if (!formRef.current) return;
      const el = formRef.current;
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      const scrollTo = window.scrollY + rect.top - (viewH - rect.height) / 2;
      window.scrollTo({ top: Math.max(0, scrollTo), behavior: "smooth" });
    }, 50);
  };
  const handlePrev = () => {
    setStep((p) => p - 1);
    setTimeout(() => {
      if (!formRef.current) return;
      const el = formRef.current;
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      const scrollTo = window.scrollY + rect.top - (viewH - rect.height) / 2;
      window.scrollTo({ top: Math.max(0, scrollTo), behavior: "smooth" });
    }, 50);
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

      const selectedService = services.find((s) => s.id === formData.serviceId);
      const selectedBarber = barbers.find((b) => b.id === formData.barberId);
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
        service: result.appointment.service || selectedService?.name || "",
        barber: result.appointment.barber || selectedBarber?.name || "Atandı",
        date: formData.date,
        time: formData.time,
        email: customerEmail,
      });
      setIsSuccess(true);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "Randevu oluşturulamadı." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formRef = useRef<HTMLDivElement>(null);

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
    <section id="booking" className="py-16 md:py-32 bg-[#0D1117] relative min-h-screen text-white">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />
      <div className="container mx-auto px-4 sm:px-6 md:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start">
          <div className="lg:col-span-4 space-y-10">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-8 h-[1px] bg-white" />
                <p className="text-[10px] font-bold tracking-[0.35em] text-white/60 uppercase">Premium Rezervasyon</p>
              </div>
              <h2 className="text-5xl md:text-6xl font-serif font-light tracking-tight text-white mb-6 leading-none">
                Koltuk <br /><span className="italic text-white/35 font-light">Rezervasyonu</span>
              </h2>
              <p className="text-white/50 text-base font-light leading-relaxed">
                Online randevu alın. Müsait saatler anlık olarak güncellenir.
              </p>
            </div>
            <div className="relative border-l border-white/10 pl-4 sm:pl-6 space-y-5 sm:space-y-8 py-2">
              {["Hizmet Seçimi", "Stilist Tercihi", "Tarih & Saat", "Kişisel Bilgiler"].map((label, i) => (
                <div key={label} className="relative flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold transition-all ${step > i + 1 ? "bg-white text-black border-white" : step === i + 1 ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.18)]" : "bg-[#0D1117] text-white/30 border-white/15"}`}>
                    {step > i + 1 ? <Check size={12} strokeWidth={3} /> : `0${i + 1}`}
                  </div>
                  <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider ${step >= i + 1 ? "text-white" : "text-white/30"}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div ref={formRef} className="lg:col-span-8 bg-[#121212]/40 border border-white/[0.06] rounded-md p-5 sm:p-8 md:p-12 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <form key="booking" onSubmit={handleSubmit} className="space-y-10">
                  {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <h3 className="text-xl font-serif font-light text-white">Hizmet Seçin</h3>
                      {loadingCatalog ? (
                        <div className="flex items-center gap-2 text-white/50 py-8">
                          <Loader2 className="w-4 h-4 animate-spin" />
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
                            <div key={s.id} onClick={() => { setFormData({ ...formData, serviceId: s.id }); setErrors({}); }}
                              className={`p-5 sm:p-6 border rounded-sm cursor-pointer transition-all h-44 relative flex flex-col justify-between ${sel ? "border-white bg-white/[0.03]" : "border-white/[0.06] hover:border-white/20"}`}>
                              <div className="flex justify-between">
                                <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${sel ? "border-white text-white/60" : "border-white/10 text-white/50"}`}><Icon size={16} /></div>
                                <span className="text-xs font-mono text-white/30">{s.duration} dk</span>
                              </div>
                              <div>
                                <h4 className={`text-base font-serif ${sel ? "text-white/60" : "text-white"}`}>{s.name}</h4>
                                <p className="text-white/40 text-xs mt-1 line-clamp-1">{s.description}</p>
                              </div>
                              <span className="absolute bottom-6 right-6 font-serif text-lg text-white/60">₺{s.price}</span>
                            </div>
                          );
                        })}
                      </div>
                      )}
                      {errors.service && <p className="text-xs text-red-400">{errors.service}</p>}
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <h3 className="text-xl font-serif font-light text-white">Stilist Seçin</h3>
                      <div
                        onClick={() => setFormData({ ...formData, noPreference: true, barberId: 0, time: "" })}
                        className={`p-5 border rounded-sm cursor-pointer mb-4 ${formData.noPreference ? "border-white bg-white/[0.03]" : "border-white/[0.06] hover:border-white/20"}`}>
                        <p className={`font-medium ${formData.noPreference ? "text-white/60" : "text-white"}`}>Tercihim Yok</p>
                        <p className="text-white/40 text-xs mt-1">Müsait berbere otomatik atanır</p>
                      </div>
                      {barbers.length === 0 ? (
                        <p className="text-sm text-white/50 py-2">Şu an müsait stilist bulunmuyor. &quot;Tercihim Yok&quot; ile devam edebilirsiniz.</p>
                      ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {barbers.map((b) => {
                          const sel = formData.barberId === b.id && !formData.noPreference;
                          return (
                            <div key={b.id} onClick={() => setFormData({ ...formData, barberId: b.id, noPreference: false, time: "" })}
                              className={`p-5 sm:p-6 border rounded-sm cursor-pointer text-center min-h-[13rem] flex flex-col items-center justify-between transition-all ${sel ? "border-white bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" : "border-white/[0.06] hover:border-white/20"}`}>
                              <div className={`relative w-20 h-20 rounded-full overflow-hidden border-2 shrink-0 ${sel ? "border-white" : "border-white/15"}`}>
                                {b.avatar ? (
                                  <Image
                                    src={b.avatar}
                                    alt={b.name}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                  />
                                ) : (
                                  <div className={`absolute inset-0 flex items-center justify-center font-bold text-sm ${sel ? "bg-white text-black" : "bg-white/5 text-white/70"}`}>
                                    {getInitials(b.name)}
                                  </div>
                                )}
                              </div>
                              <div className="w-full">
                                <h4 className={`font-semibold ${sel ? "text-white" : "text-white"}`}>{b.name}</h4>
                                <p className="text-[10px] uppercase tracking-widest text-white/60 mt-1">{b.position}</p>
                                <p className="text-white/40 text-[11px] mt-2 line-clamp-2">{b.specialty}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      )}
                      {errors.barber && <p className="text-xs text-red-400">{errors.barber}</p>}
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <div>
                        <h3 className="text-xl font-serif font-light text-white">Tarih & Saat</h3>
                        {formData.date && (
                          <p className="text-sm text-white/50 mt-2">{getFormattedDate(formData.date)}</p>
                        )}
                      </div>
                      <div className="flex gap-2.5 overflow-x-auto pb-3 scrollbar-thin">
                        {nextDays.map((day) => {
                          const sel = formData.date === day.isoDate;
                          const isToday = day.isoDate === todayIso;
                          return (
                            <button type="button" key={day.isoDate} onClick={() => setFormData({ ...formData, date: day.isoDate, time: "" })}
                              className={`flex flex-col items-center py-4 px-5 rounded-sm border min-w-[76px] shrink-0 transition-all ${sel ? "bg-white border-white text-black" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                              <span className="text-[10px] uppercase font-bold">{isToday ? "Bugün" : day.dayName}</span>
                              <span className="text-lg font-serif font-bold">{day.dayNum}</span>
                              <span className="text-[8px] uppercase opacity-70">{day.month}</span>
                            </button>
                          );
                        })}
                      </div>
                      {formData.date && (
                        <div className="pt-4 border-t border-white/[0.06]">
                          {loadingSlots ? (
                            <div className="flex items-center gap-2 text-white/50"><Loader2 className="w-4 h-4 animate-spin" /> Müsait saatler yükleniyor...</div>
                          ) : slotsError ? (
                            <div className="space-y-3">
                              <p className="text-red-400 text-sm">{slotsError}</p>
                              <button type="button" onClick={() => setSlotsRetry((n) => n + 1)}
                                className="text-xs text-white/60 underline hover:text-white">
                                Tekrar dene
                              </button>
                            </div>
                          ) : slots.length === 0 ? (
                            <div className="space-y-3">
                              <p className="text-white/50 text-sm">
                                {formData.date === todayIso
                                  ? "Bugün için müsait saat kalmadı."
                                  : "Bu tarihte randevu saati bulunmuyor."}
                              </p>
                              {formData.date === todayIso && tomorrowIso && (
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, date: tomorrowIso, time: "" })}
                                  className="text-xs text-[#C8703A] hover:text-[#E8C547] font-semibold"
                                >
                                  Yarın için saatleri göster →
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-white/40">
                                    Saat Seçimi
                                  </p>
                                  <p className="text-xs text-white/45 mt-1">
                                    {slotSummary || "Saat bilgisi yükleniyor"}
                                  </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-[9px] uppercase tracking-wider text-white/35">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-sm border border-white/30 bg-white/10" />
                                    Müsait
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-sm border border-red-500/30 bg-red-500/10" />
                                    Dolu
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-sm border border-white/5 bg-white/[0.02]" />
                                    Geçti
                                  </span>
                                </div>
                              </div>

                              {availableSlots.length === 0 && bookedSlots.length > 0 && (
                                <div className="p-3.5 bg-red-500/[0.06] border border-red-500/20 rounded-sm">
                                  <p className="text-xs text-red-300/90 leading-relaxed">
                                    Bu tarihte dolu saatler var. Lütfen müsait bir saat veya başka bir gün seçin.
                                  </p>
                                </div>
                              )}

                              {availableSlots.length === 0 && bookedSlots.length === 0 && passedSlots.length > 0 && formData.date === todayIso && tomorrowIso && (
                                <div className="p-3.5 bg-white/[0.03] border border-white/[0.08] rounded-sm">
                                  <p className="text-xs text-white/55 leading-relaxed">
                                    Bugün için uygun saat kalmadı (geçmiş saatler seçilemez).
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, date: tomorrowIso, time: "" })}
                                    className="text-xs text-[#C8703A] hover:text-[#E8C547] font-semibold mt-2"
                                  >
                                    Yarın için saatleri göster →
                                  </button>
                                </div>
                              )}

                              {availableSlots.length === 0 && bookedSlots.length === 0 && passedSlots.length === 0 && (
                                <div className="p-3.5 bg-red-500/[0.06] border border-red-500/20 rounded-sm">
                                  <p className="text-xs text-red-300/90 leading-relaxed">
                                    Bu tarihte müsait saat bulunmuyor.
                                  </p>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2.5">
                                {slots.map((slot) => {
                                  if (slot.available) {
                                    const selected = formData.time === slot.time;
                                    return (
                                      <button
                                        type="button"
                                        key={slot.time}
                                        onClick={() => {
                                          setFormData({ ...formData, time: slot.time });
                                          setErrors((e) => ({ ...e, time: "" }));
                                        }}
                                        className={`min-w-[76px] py-3 px-5 text-xs font-semibold rounded-sm border transition-all ${
                                          selected
                                            ? "bg-white border-white text-black shadow-[0_0_12px_rgba(255,255,255,0.12)]"
                                            : "border-white/20 text-white hover:border-white/40 hover:bg-white/[0.04]"
                                        }`}
                                      >
                                        {slot.time}
                                      </button>
                                    );
                                  }

                                  const label = slotUnavailableLabel(slot.reason);
                                  return (
                                    <div
                                      key={slot.time}
                                      title={slotUnavailableHint(slot.time, slot.reason)}
                                      aria-label={slotUnavailableHint(slot.time, slot.reason)}
                                      className="min-w-[76px] py-2.5 px-4 text-center rounded-sm border border-white/[0.04] bg-white/[0.015] cursor-not-allowed select-none"
                                    >
                                      <span className="block text-xs font-semibold text-white/20 line-through decoration-white/15">
                                        {slot.time}
                                      </span>
                                      <span
                                        className={`block text-[8px] uppercase tracking-wider font-bold mt-1 ${
                                          label === "Dolu" ? "text-red-400/60" : "text-white/25"
                                        }`}
                                      >
                                        {label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {!formData.date && (
                        <p className="text-white/40 text-sm">Randevu için bir gün seçin.</p>
                      )}
                      {errors.date && <p className="text-xs text-red-400">{errors.date}</p>}
                      {errors.time && <p className="text-xs text-red-400">{errors.time}</p>}
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <div>
                        <h3 className="text-xl font-serif font-light text-white">Bilgileriniz</h3>
                        <p className="text-sm text-white/45 mt-2 leading-relaxed">
                          Randevunuzu tamamlamak için iletişim bilgilerinizi girin. Salon onayından sonra e-posta adresinize bilgilendirme gönderilir.
                        </p>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-[#C8703A]/[0.06] border border-[#C8703A]/20 rounded-sm">
                        <Mail size={16} className="text-[#C8703A] shrink-0 mt-0.5" />
                        <p className="text-xs text-white/60 leading-relaxed">
                          <span className="text-white/80 font-medium">E-posta zorunludur.</span> Randevunuz onaylandığında onay detayları bu adrese iletilecektir.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                          <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                            <User size={10} className="text-white/60" /> Ad Soyad <span className="text-[#C8703A]">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full bg-transparent border-b py-3 text-white focus:outline-none text-sm transition-colors ${errors.name ? "border-red-400/60 focus:border-red-400" : "border-white/15 focus:border-white"}`}
                            placeholder="Adınız Soyadınız"
                            autoComplete="name"
                            required
                          />
                          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                            <Phone size={10} className="text-white/60" /> Telefon <span className="text-[#C8703A]">*</span>
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`w-full bg-transparent border-b py-3 text-white focus:outline-none text-sm transition-colors ${errors.phone ? "border-red-400/60 focus:border-red-400" : "border-white/15 focus:border-white"}`}
                            placeholder="05XX XXX XX XX"
                            autoComplete="tel"
                            maxLength={11}
                            required
                          />
                          {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                            <Mail size={10} className="text-white/60" /> E-posta <span className="text-[#C8703A]">*</span>
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full bg-transparent border-b py-3 text-white focus:outline-none text-sm transition-colors ${errors.email ? "border-red-400/60 focus:border-red-400" : "border-white/15 focus:border-white"}`}
                            placeholder="ornek@gmail.com"
                            autoComplete="email"
                            inputMode="email"
                            required
                          />
                          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">
                          Notlar <span className="text-white/25 normal-case tracking-normal font-normal">(opsiyonel)</span>
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          rows={2}
                          className="w-full bg-white/[0.02] border border-white/[0.08] rounded-sm px-4 py-3 text-white focus:outline-none focus:border-white/25 text-sm resize-none placeholder:text-white/25"
                          placeholder="Ek istekleriniz veya notlarınız..."
                        />
                      </div>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.agreed}
                          onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                          className="mt-1 accent-white"
                          required
                        />
                        <span className="text-xs text-white/50 group-hover:text-white/60 transition-colors leading-relaxed">
                          Randevu bilgilerimin doğruluğunu onaylıyorum. Salon tarafından onaylandığında e-posta adresime bilgilendirme gönderilmesini kabul ediyorum.
                        </span>
                      </label>
                      {errors.agreed && <p className="text-xs text-red-400 -mt-4">{errors.agreed}</p>}

                      <div className="p-5 sm:p-6 bg-white/[0.02] border border-white/[0.06] rounded-sm">
                        <p className="text-[9px] font-bold text-white/35 uppercase tracking-widest mb-4">Randevu Özeti</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div><span className="text-white/40 block mb-0.5">Hizmet</span><span className="text-white font-semibold">{selectedService?.name} — ₺{selectedService?.price}</span></div>
                          <div><span className="text-white/40 block mb-0.5">Berber</span><span className="text-white font-semibold">{formData.noPreference ? "Otomatik atama" : selectedBarber?.name}</span></div>
                          <div><span className="text-white/40 block mb-0.5">Tarih</span><span className="text-white font-semibold">{getFormattedDate(formData.date)}</span></div>
                          <div><span className="text-white/40 block mb-0.5">Saat</span><span className="text-[#C8703A] font-semibold">{formData.time}</span></div>
                          {formData.email.trim() && (
                            <div className="sm:col-span-2 pt-2 border-t border-white/[0.06]">
                              <span className="text-white/40 block mb-0.5">Bildirim E-postası</span>
                              <span className="text-white/80 font-medium">{formData.email.trim()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {errors.submit && <p className="text-sm text-red-400">{errors.submit}</p>}
                    </motion.div>
                  )}

                  <div className="flex justify-between items-center gap-3 pt-8 border-t border-white/[0.06]">
                    {step > 1 ? (
                      <button type="button" onClick={handlePrev} className="flex items-center gap-2 text-white/50 hover:text-white text-[10px] font-bold tracking-wide sm:tracking-widest uppercase"><ChevronLeft size={14} /> Geri</button>
                    ) : <div />}
                    {step < 4 ? (
                      <button type="button" onClick={handleNext} className="bg-white text-black hover:bg-white px-6 sm:px-10 py-4 rounded-full text-[10px] font-bold tracking-wide sm:tracking-widest uppercase flex items-center gap-2">İleri <ChevronRight size={14} /></button>
                    ) : (
                      <button type="submit" disabled={isSubmitting} className="bg-white text-black hover:bg-white px-8 sm:px-12 py-4 rounded-full text-[10px] font-bold tracking-wide sm:tracking-widest uppercase disabled:opacity-50">
                        {isSubmitting ? "Gönderiliyor..." : "Randevuyu Onayla"}
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 sm:py-12 space-y-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-[#C8703A]/30 text-[#C8703A] bg-[#C8703A]/[0.06]">
                    <Check size={36} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="inline-block text-[9px] font-bold uppercase tracking-[0.2em] text-[#C8703A] bg-[#C8703A]/10 border border-[#C8703A]/20 px-3 py-1 rounded-full mb-4">
                      Onay Bekleniyor
                    </span>
                    <h3 className="text-3xl font-serif font-light text-white">Randevunuz Alındı!</h3>
                    <p className="text-white/50 text-sm max-w-lg mx-auto mt-3 leading-relaxed">
                      Sayın <span className="text-white font-semibold">{formData.name.trim()}</span>, randevu talebiniz başarıyla oluşturuldu.
                      Salon ekibimiz kısa süre içinde talebinizi inceleyecektir.
                    </p>

                    <div className="mt-5 flex items-start gap-3 p-4 bg-white/[0.03] border border-white/[0.08] rounded-sm text-left max-w-lg mx-auto">
                      <Mail size={18} className="text-[#C8703A] shrink-0 mt-0.5" />
                      <p className="text-xs text-white/55 leading-relaxed">
                        Randevunuz salon tarafından <span className="text-white/80 font-medium">onaylandığında</span>,{" "}
                        <span className="text-white font-medium">{appointmentResult?.email || formData.email.trim()}</span>{" "}
                        adresinize onay e-postası gönderilecektir. Şu an mail gitmez; yalnızca onay sonrası bilgilendirilirsiniz.
                        Spam klasörünü de kontrol etmeyi unutmayın.
                      </p>
                    </div>

                    {appointmentResult && (
                      <div className="mt-6 p-5 sm:p-6 bg-white/[0.03] border border-white/[0.08] rounded-sm text-left max-w-lg mx-auto space-y-3 text-sm">
                        <p className="text-[9px] font-bold text-white/35 uppercase tracking-widest mb-1">Randevu Detayları</p>
                        <p><span className="text-white/40">Randevu No:</span> <span className="text-white font-semibold">#{appointmentResult.id}</span></p>
                        <p><span className="text-white/40">Hizmet:</span> <span className="text-white">{appointmentResult.service}</span></p>
                        <p><span className="text-white/40">Berber:</span> <span className="text-white">{appointmentResult.barber}</span></p>
                        <p><span className="text-white/40">Tarih:</span> <span className="text-white">{getFormattedDate(appointmentResult.date)}</span></p>
                        <p><span className="text-white/40">Saat:</span> <span className="text-[#C8703A] font-semibold">{appointmentResult.time}</span></p>
                        <p><span className="text-white/40">E-posta:</span> <span className="text-white/80">{appointmentResult.email}</span></p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button type="button" onClick={() => { setIsSuccess(false); setStep(1); setAppointmentResult(null); setFormData({ serviceId: 0, barberId: 0, noPreference: false, date: "", time: "", name: "", phone: "", email: "", notes: "", agreed: false }); }}
                      className="border border-white/10 text-white/70 hover:text-white hover:border-white/25 px-8 sm:px-10 py-4 rounded-full text-[10px] font-bold tracking-wide sm:tracking-widest uppercase transition-colors">
                      Yeni Randevu
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
