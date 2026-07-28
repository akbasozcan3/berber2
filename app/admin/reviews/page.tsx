"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Award, Check, Pencil, Save, X, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import Badge from "@/components/admin/ui/Badge";
import Avatar from "@/components/admin/ui/Avatar";
import { adminApi, type AdminReview } from "@/lib/api/admin";
import { formatDate } from "@/lib/admin/utils";
import { cn } from "@/lib/admin/cn";
import Input from "@/components/admin/ui/Input";
import Textarea from "@/components/admin/ui/Textarea";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [uiError, setUiError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<{ customerName: string; customerEmail: string; rating: number; review: string }>({
    customerName: "",
    customerEmail: "",
    rating: 5,
    review: "",
  });

  useEffect(() => { adminApi.getReviews().then(setReviews); }, []);

  const update = async (id: number, data: Partial<AdminReview>) => {
    setUiError(null);
    setUpdatingId(id);
    try {
      await adminApi.updateReview(id, data);
      const list = await adminApi.getReviews();
      setReviews(list);
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "Güncellenemedi.");
    } finally {
      setUpdatingId(null);
    }
  };

  const pending = reviews.filter((r) => !r.approved);

  const startEdit = (r: AdminReview) => {
    setUiError(null);
    setEditingId(r.id);
    setDraft({
      customerName: r.customerName,
      customerEmail: r.customerEmail ?? "",
      rating: r.rating,
      review: r.review,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setUiError(null);
  };

  const saveEdit = async (r: AdminReview) => {
    const emailTrimmed = draft.customerEmail.trim();
    const emailValue = emailTrimmed ? emailTrimmed : null;

    await update(r.id, {
      customerName: draft.customerName.trim(),
      customerEmail: emailValue,
      rating: Number(draft.rating),
      review: draft.review.trim(),
    });
    setEditingId(null);
  };

  const removeReview = async (id: number) => {
    const ok = window.confirm("Bu yorumu silmek istediğinizden emin misiniz?");
    if (!ok) return;
    setUiError(null);
    setUpdatingId(id);
    try {
      await adminApi.deleteReview(id);
      const list = await adminApi.getReviews();
      setReviews(list);
    } catch (e) {
      setUiError(e instanceof Error ? e.message : "Silinemedi.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Yorumlar" description={`${reviews.length} yorum · ${pending.length} onay bekliyor`} />
      {uiError && (
        <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
          {uiError}
        </div>
      )}
      <div className="space-y-4">
        {reviews.map((review, i) => (
          <motion.div key={review.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={cn(!review.approved && "border-yellow-500/20")}>
              <div className="flex items-start gap-4">
                <Avatar name={review.customerName} size="md" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-[#F8F8F8]">{review.customerName}</h3>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 text-[#C8703A] fill-[#C8703A]" />
                      ))}
                    </div>
                    {!review.approved && <Badge label="Onay Bekliyor" variant="gold" />}
                    {review.featured && <Badge label="Öne Çıkan" variant="gold" />}
                    <Badge label={review.source === "google" ? "Google" : "Website"} variant="outline" />
                  </div>
                  <p className="text-xs text-[#71717A] mt-1">{formatDate(review.createdAt)}</p>
                  {review.customerEmail && (
                    <p className="text-xs text-[#C8703A] mt-1">{review.customerEmail}</p>
                  )}
                  {editingId !== review.id ? (
                    <p className="text-sm text-[#A1A1AA] mt-3">{review.review}</p>
                  ) : (
                    <div className="mt-3 space-y-4">
                      <Input
                        label="Ad Soyad"
                        value={draft.customerName}
                        onChange={(e) => setDraft((d) => ({ ...d, customerName: e.target.value }))}
                        disabled={updatingId === review.id}
                      />
                      <Input
                        label="E-posta (opsiyonel)"
                        value={draft.customerEmail}
                        onChange={(e) => setDraft((d) => ({ ...d, customerEmail: e.target.value }))}
                        disabled={updatingId === review.id}
                      />
                      <Input
                        label="Puan (1-5)"
                        type="number"
                        min={1}
                        max={5}
                        value={draft.rating}
                        onChange={(e) => setDraft((d) => ({ ...d, rating: Number(e.target.value) || 5 }))}
                        disabled={updatingId === review.id}
                      />
                      <Textarea
                        label="Yorum"
                        value={draft.review}
                        onChange={(e) => setDraft((d) => ({ ...d, review: e.target.value }))}
                        disabled={updatingId === review.id}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={cancelEdit} disabled={updatingId === review.id}>
                          <X className="w-3.5 h-3.5" /> İptal
                        </Button>
                        <Button size="sm" variant="primary" onClick={() => saveEdit(review)} disabled={updatingId === review.id}>
                          <Save className="w-3.5 h-3.5" /> Kaydet
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {editingId !== review.id ? (
                <div className="flex gap-2 mt-5 pt-4 border-t border-white/[0.06]">
                  {!review.approved && (
                    <Button size="sm" onClick={() => update(review.id, { approved: true })} disabled={updatingId === review.id}>
                      <Check className="w-3.5 h-3.5" /> Onayla
                    </Button>
                  )}
                  <Button
                    variant={review.featured ? "primary" : "outline"}
                    size="sm"
                    onClick={() => update(review.id, { featured: !review.featured })}
                    disabled={updatingId === review.id}
                  >
                    <Award className="w-3.5 h-3.5" /> {review.featured ? "Öne Çıkarıldı" : "Öne Çıkar"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => startEdit(review)} disabled={updatingId === review.id}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => removeReview(review.id)} disabled={updatingId === review.id}>
                    <Trash2 className="w-3.5 h-3.5" /> Sil
                  </Button>
                </div>
              ) : null}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
