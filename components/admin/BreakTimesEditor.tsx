"use client";

import Toggle from "@/components/admin/ui/Toggle";
import Input from "@/components/admin/ui/Input";
import { parseBreakTimes, serializeBreakTimes } from "@/lib/utils/break-times";

interface Props {
  value: string;
  onChange: (json: string) => void;
}

export default function BreakTimesEditor({ value, onChange }: Props) {
  const periods = parseBreakTimes(value);
  const enabled = periods.length > 0;
  const period = periods[0] || { start: "13:00", end: "14:00" };

  const update = (nextEnabled: boolean, start = period.start, end = period.end) => {
    if (!nextEnabled) {
      onChange(serializeBreakTimes([]));
      return;
    }
    if (start >= end) return;
    onChange(serializeBreakTimes([{ start, end }]));
  };

  return (
    <div className="space-y-3">
      <Toggle
        label="Öğle arası randevu kapalı"
        description="Açıksa seçilen saat aralığında online randevu alınamaz."
        checked={enabled}
        onChange={(checked) => update(checked)}
      />
      {enabled && (
        <div className="grid grid-cols-2 gap-3 pl-1">
          <Input
            label="Başlangıç"
            type="time"
            value={period.start}
            onChange={(e) => update(true, e.target.value, period.end)}
          />
          <Input
            label="Bitiş"
            type="time"
            value={period.end}
            onChange={(e) => update(true, period.start, e.target.value)}
          />
        </div>
      )}
      <p className="text-xs text-[#4A5568]">
        Kapalı tutmak için bu seçeneği kapatın — tüm çalışma saatleri randevuya açık kalır.
      </p>
    </div>
  );
}
