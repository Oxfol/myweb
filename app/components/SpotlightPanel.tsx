"use client";

import { m, useMotionValue, useSpring, useTransform } from "motion/react";
import type { PointerEvent, ReactNode } from "react";

export function SpotlightPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  const px = useMotionValue(50);
  const py = useMotionValue(50);
  const rotateX = useSpring(useTransform(py, [0, 100], [2, -2]), { stiffness: 150, damping: 24 });
  const rotateY = useSpring(useTransform(px, [0, 100], [-2, 2]), { stiffness: 150, damping: 24 });

  function move(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set(((event.clientX - rect.left) / rect.width) * 100);
    py.set(((event.clientY - rect.top) / rect.height) * 100);
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  function reset() {
    px.set(50);
    py.set(50);
  }

  return (
    <m.div
      className={`spotlight-panel ${className}`}
      onPointerMove={move}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
    >
      {children}
    </m.div>
  );
}
