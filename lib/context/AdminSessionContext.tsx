"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api/client";

interface AdminUser {
  name: string;
  email: string;
}

interface AdminSessionState {
  user: AdminUser | null;
  loading: boolean;
}

const AdminSessionContext = createContext<AdminSessionState>({ user: null, loading: true });

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AdminSessionState>({ user: null, loading: true });
  const pathname = usePathname();

  useEffect(() => {
    api
      .getSession()
      .then((session) => {
        if (session.authenticated && session.user) {
          setState({ user: session.user, loading: false });
        } else {
          setState({ user: null, loading: false });
          if (pathname !== "/admin/login") {
            window.location.href = "/admin/login";
          }
        }
      })
      .catch(() => {
        setState({ user: null, loading: false });
        if (pathname !== "/admin/login") {
          window.location.href = "/admin/login";
        }
      });
  }, [pathname]);

  return (
    <AdminSessionContext.Provider value={state}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  return useContext(AdminSessionContext);
}
