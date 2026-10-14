"use client";

import { useEffect, useRef, useState } from "react";

type Paw = { id: number; x: number; y: number; rotate: number; flip: boolean };

let nextId = 0;

export function PawCursorTrail() {
  const [paws, setPaws] = useState<Paw[]>([]);
  const lastSpawn = useRef(0);
  const stepRef = useRef(true);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (prefersReducedMotion || !isFinePointer) return;

    function handleMove(e: MouseEvent) {
      const now = Date.now();
      if (now - lastSpawn.current < 220) return;
      lastSpawn.current = now;

      stepRef.current = !stepRef.current;
      const id = nextId++;
      const paw: Paw = {
        id,
        x: e.clientX,
        y: e.clientY,
        rotate: stepRef.current ? -18 : 18,
        flip: stepRef.current,
      };

      setPaws((prev) => [...prev.slice(-8), paw]);
      setTimeout(() => {
        setPaws((prev) => prev.filter((p) => p.id !== id));
      }, 1000);
    }

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] hidden sm:block" aria-hidden>
      {paws.map((paw) => (
        <span
          key={paw.id}
          className="animate-paw-fade absolute text-base text-primary"
          style={
            {
              left: paw.x,
              top: paw.y,
              transform: `translate(-50%, -50%) scaleX(${paw.flip ? 1 : -1})`,
              "--paw-rotate": `${paw.rotate}deg`,
            } as React.CSSProperties
          }
        >
          🐾
        </span>
      ))}
    </div>
  );
}
