"use client";

import { useEffect } from "react";
import { usePublicSettings } from "@/lib/context/PublicSettingsContext";
import { buildRouteProgressTheme } from "@/lib/utils/loading-color";

export default function RouteProgressTheme() {
  const { loadingColor } = usePublicSettings();

  useEffect(() => {
    const theme = buildRouteProgressTheme(loadingColor);
    const root = document.documentElement;

    root.style.setProperty("--route-progress-color", theme.base);
    root.style.setProperty("--route-progress-color-dark", theme.dark);
    root.style.setProperty("--route-progress-color-light", theme.light);
    root.style.setProperty("--route-progress-glow", theme.glow);

    return () => {
      root.style.removeProperty("--route-progress-color");
      root.style.removeProperty("--route-progress-color-dark");
      root.style.removeProperty("--route-progress-color-light");
      root.style.removeProperty("--route-progress-glow");
    };
  }, [loadingColor]);

  return null;
}
