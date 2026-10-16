"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";

/** الهام از SpotlightCard در React Bits: نور شعاعی دنبال‌کنندهٔ ماوس روی کارت. */
export function SpotlightCard({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    gsap.to(el, {
      "--spot-x": `${e.clientX - rect.left}px`,
      "--spot-y": `${e.clientY - rect.top}px`,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  function handleMouseEnter() {
    if (reducedMotion()) return;
    gsap.to(ref.current, { "--spot-opacity": 1, duration: 0.25 });
  }

  function handleMouseLeave() {
    gsap.to(ref.current, { "--spot-opacity": 0, duration: 0.4 });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`spotlight-card relative ${className ?? ""}`}
      style={style}
    >
      <div className="spotlight-card-glow pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden />
      {children}
    </div>
  );
}
