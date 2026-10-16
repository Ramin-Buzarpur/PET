"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/** الهام از AnimatedContent در React Bits: ظاهرشدن fade+translate هنگام رسیدن به دید در اسکرول. */
export function Reveal({
  children,
  className,
  index = 0,
  delay,
  y = 24,
  scale = 1,
}: {
  children: React.ReactNode;
  className?: string;
  index?: number;
  delay?: number;
  y?: number;
  scale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const d = delay ?? index * 0.08;
    gsap.set(el, { opacity: 0, y, scale });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          delay: d,
          ease: "power3.out",
        });
      },
    });

    return () => trigger.kill();
  }, [index, delay, y, scale]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
