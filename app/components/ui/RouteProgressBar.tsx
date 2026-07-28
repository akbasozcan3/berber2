"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type RouteProgressBarProps = {
  variant?: "site" | "admin";
};

export default function RouteProgressBar({ variant = "site" }: RouteProgressBarProps) {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(12);

    const step = window.setTimeout(() => setProgress(68), 100);
    const finish = window.setTimeout(() => setProgress(100), 260);
    const hide = window.setTimeout(() => setVisible(false), 480);

    return () => {
      window.clearTimeout(step);
      window.clearTimeout(finish);
      window.clearTimeout(hide);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className={`route-progress route-progress-${variant}`}
      role="progressbar"
      aria-hidden
    >
      <div className="route-progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
}
