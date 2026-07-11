"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  return <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .34, ease: [0.22, 1, 0.36, 1] }}>{children}</m.div>;
}
