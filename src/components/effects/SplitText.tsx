"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * الهام از SplitText در React Bits: شکستن متن به کلمه و ظاهرشدن استگرشده.
 * `text` می‌تواند شامل "\n" برای شکست خط دستی باشد؛ `highlight` یک کلمه را با رنگ primary نشان می‌دهد.
 */
export function SplitText({
  text,
  className,
  highlight,
  stagger = 0.045,
  delay = 0.1,
}: {
  text: string;
  className?: string;
  highlight?: string;
  stagger?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const units = el.querySelectorAll<HTMLElement>("[data-split-unit]");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(units, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(units, { opacity: 0, y: 18 });
    gsap.to(units, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      delay,
      stagger,
      ease: "power3.out",
    });
  }, [text, stagger, delay]);

  const lines = text.split("\n");

  return (
    <div ref={ref} className={className}>
      {lines.map((line, li) => {
        const words = line.split(" ");
        return (
          <div key={li}>
            {words.map((word, wi) => (
              <span
                key={wi}
                data-split-unit
                className={`inline-block ${highlight && word === highlight ? "text-primary" : ""}`}
              >
                {word}
                {wi < words.length - 1 ? " " : ""}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
