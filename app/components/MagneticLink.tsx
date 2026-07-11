"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { m, useMotionValue, useSpring } from "motion/react";
import { useRef } from "react";

export function MagneticLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary" }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 210, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 210, damping: 18 });

  function move(event: React.PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType === "touch" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.12);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.12);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <m.div style={{ x, y }} whileTap={{ scale: 0.98 }}>
      <Link
        ref={ref}
        href={href}
        onPointerMove={move}
        onPointerLeave={reset}
        className={`action-link action-link-${variant}`}
      >
        <span>{children}</span>
        <ArrowRightIcon size={18} weight="regular" aria-hidden="true" />
      </Link>
    </m.div>
  );
}
