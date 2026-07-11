"use client";

import { memo, useEffect, useRef } from "react";

type Dot = { ax: number; ay: number; x: number; y: number };

type DotFieldProps = {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  bulgeStrength?: number;
  glowRadius?: number;
  className?: string;
};

const TAU = Math.PI * 2;

export const DotField = memo(function DotField({
  dotRadius = 1.35,
  dotSpacing = 17,
  cursorRadius = 280,
  bulgeStrength = 38,
  glowRadius = 150,
  className = "",
}: DotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const visibleRef = useRef(true);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, targetX: -9999, targetY: -9999, active: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !container || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, compact ? 1 : 1.6);
    let width = 0;
    let height = 0;
    let resizeTimer: ReturnType<typeof setTimeout>;

    function build() {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const step = dotSpacing + dotRadius;
      const cols = Math.ceil(width / step);
      const rows = Math.ceil(height / step);
      const dots: Dot[] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ax = col * step + step / 2;
          const ay = row * step + step / 2;
          dots.push({ ax, ay, x: ax, y: ay });
        }
      }
      dotsRef.current = dots;
      draw();
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;
      mouse.active += ((mouse.targetX > -1000 ? 1 : 0) - mouse.active) * 0.08;

      for (const dot of dotsRef.current) {
        const dx = mouse.x - dot.ax;
        const dy = mouse.y - dot.ay;
        const distance = Math.hypot(dx, dy);
        const influence = Math.max(0, 1 - distance / cursorRadius) * mouse.active;
        if (!compact && influence > 0) {
          const angle = Math.atan2(dy, dx);
          const push = influence * influence * bulgeStrength;
          dot.x += (dot.ax - Math.cos(angle) * push - dot.x) * 0.16;
          dot.y += (dot.ay - Math.sin(angle) * push - dot.y) * 0.16;
        } else {
          dot.x += (dot.ax - dot.x) * 0.12;
          dot.y += (dot.ay - dot.y) * 0.12;
        }

        const radius = dotRadius * (1 + influence * 1.5);
        context.beginPath();
        context.arc(dot.x, dot.y, radius, 0, TAU);
        context.fillStyle = `rgba(168,85,247,${0.16 + influence * 0.68})`;
        context.fill();
      }

      if (!compact && mouse.active > 0.01) {
        const glow = context.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, glowRadius);
        glow.addColorStop(0, "rgba(168,85,247,.14)");
        glow.addColorStop(1, "rgba(168,85,247,0)");
        context.fillStyle = glow;
        context.fillRect(mouse.x - glowRadius, mouse.y - glowRadius, glowRadius * 2, glowRadius * 2);
      }

      if (!reducedMotion && !compact && visibleRef.current) frameRef.current = requestAnimationFrame(draw);
    }

    function pointerMove(event: PointerEvent) {
      const rect = container.getBoundingClientRect();
      mouseRef.current.targetX = event.clientX - rect.left;
      mouseRef.current.targetY = event.clientY - rect.top;
      if (!frameRef.current && !compact && !reducedMotion) frameRef.current = requestAnimationFrame(draw);
    }

    function pointerLeave() {
      mouseRef.current.targetX = -9999;
      mouseRef.current.targetY = -9999;
    }

    function resize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 120);
    }

    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting && !compact && !reducedMotion && !frameRef.current) frameRef.current = requestAnimationFrame(draw);
      if (!entry.isIntersecting && frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    });

    build();
    observer.observe(container);
    window.addEventListener("resize", resize);
    container.addEventListener("pointermove", pointerMove, { passive: true });
    container.addEventListener("pointerleave", pointerLeave);

    return () => {
      observer.disconnect();
      clearTimeout(resizeTimer);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointermove", pointerMove);
      container.removeEventListener("pointerleave", pointerLeave);
    };
  }, [bulgeStrength, cursorRadius, dotRadius, dotSpacing, glowRadius]);

  return <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true" />;
});
