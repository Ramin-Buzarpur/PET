"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/** پارالاکس سبک هنگام اسکرول (translateY بر اساس موقعیت المان در صفحه). */
export function Parallax({
  children,
  amount = 30,
  className,
}: {
  children: React.ReactNode;
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tween = gsap.fromTo(
      el,
      { y: -amount / 2 },
      {
        y: amount / 2,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [amount]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
