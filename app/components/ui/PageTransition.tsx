"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type PageTransitionProps = {
  children: ReactNode;
  variant?: "site" | "admin";
};

const EASE = [0.16, 1, 0.3, 1] as const;

export default function PageTransition({ children, variant = "site" }: PageTransitionProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const isAdmin = variant === "admin";

  if (reduceMotion) {
    return <div className="page-transition-root">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="page-transition-root"
        initial={{ opacity: 0, y: isAdmin ? 10 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: isAdmin ? -6 : -10 }}
        transition={{
          duration: isAdmin ? 0.26 : 0.36,
          ease: EASE,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
