"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api/client";
import type { PublicSettings } from "@/lib/api/client";
import { publicSettingsDefaults } from "@/lib/data/public-settings-defaults";

type PublicSettingsContextValue = PublicSettings & {
  brandLogoUrl: string;
};

const PublicSettingsContext = createContext<PublicSettingsContextValue>({
  ...publicSettingsDefaults,
  brandLogoUrl: "",
});

function mergePublicSettings(prev: PublicSettings, next: PublicSettings): PublicSettings {
  return {
    ...next,
    logoUrl: next.logoUrl || prev.logoUrl,
    faviconUrl: next.faviconUrl || prev.faviconUrl,
  };
}

export function PublicSettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: PublicSettings;
}) {
  const seed = initialSettings ?? publicSettingsDefaults;
  const [settings, setSettings] = useState<PublicSettings>(seed);

  useEffect(() => {
    const refresh = () => {
      api
        .getPublicSettings()
        .then((next) => {
          setSettings((prev) => mergePublicSettings(prev, next));
        })
        .catch(() => {});
    };

    refresh();

    const onFocus = () => refresh();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };

    const onUpdated = () => refresh();
    window.addEventListener("public-settings-updated", onUpdated);

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("public-settings-updated", onUpdated);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const value = useMemo<PublicSettingsContextValue>(
    () => ({
      ...settings,
      brandLogoUrl: settings.logoUrl,
    }),
    [settings]
  );

  return <PublicSettingsContext.Provider value={value}>{children}</PublicSettingsContext.Provider>;
}

export function usePublicSettings() {
  return useContext(PublicSettingsContext);
}
