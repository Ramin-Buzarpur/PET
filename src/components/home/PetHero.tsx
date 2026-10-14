"use client";

import { useRef, useState } from "react";

type Sparkle = { id: number; x: number; y: number; emoji: string };

const SPARKLE_EMOJIS = ["✨", "⭐", "💛", "🩷"];

export function PetHero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [bounce, setBounce] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const sparkleId = useRef(0);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--parallax-x", `${x * 14}px`);
    el.style.setProperty("--parallax-y", `${y * 10}px`);
  }

  function handleMouseLeave() {
    const el = wrapRef.current;
    if (!el) return;
    el.style.setProperty("--parallax-x", "0px");
    el.style.setProperty("--parallax-y", "0px");
  }

  function handleTap() {
    setBounce(true);
    setTimeout(() => setBounce(false), 500);

    const newSparkles: Sparkle[] = Array.from({ length: 5 }, () => ({
      id: sparkleId.current++,
      x: 35 + Math.random() * 30,
      y: 30 + Math.random() * 30,
      emoji: SPARKLE_EMOJIS[Math.floor(Math.random() * SPARKLE_EMOJIS.length)],
    }));
    setSparkles((prev) => [...prev, ...newSparkles]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => !newSparkles.includes(s)));
    }, 700);
  }

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleTap}
      className="relative mx-auto aspect-[4/3] w-full max-w-xl cursor-pointer select-none"
      style={{ "--parallax-x": "0px", "--parallax-y": "0px" } as React.CSSProperties}
    >
      {/* دکوراسیون پس‌زمینه - حباب‌های شناور */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform:
            "translate(calc(var(--parallax-x) * 0.6), calc(var(--parallax-y) * 0.6))",
        }}
      >
        <div className="absolute -right-4 top-6 h-24 w-24 animate-float-slow rounded-full bg-accent-soft" />
        <div
          className="absolute left-2 top-16 h-16 w-16 animate-float-slow rounded-full bg-primary-soft"
          style={{ animationDelay: "1.2s" }}
        />
        <div
          className="absolute left-10 bottom-10 h-12 w-12 animate-float-slow rounded-full bg-accent-soft"
          style={{ animationDelay: "2.1s" }}
        />
        <div
          className="absolute right-10 bottom-4 h-8 w-8 animate-float-slow rounded-full bg-highlight/40"
          style={{ animationDelay: "0.6s" }}
        />
      </div>

      {/* استیکرهای شناور */}
      <div className="absolute inset-0">
        <span className="absolute left-4 top-4 animate-float-side text-2xl" style={{ animationDelay: "0s" }}>
          💛
        </span>
        <span className="absolute right-6 top-8 animate-float-side text-2xl" style={{ animationDelay: "0.8s" }}>
          ⭐
        </span>
        <span className="absolute left-8 bottom-24 animate-float-side text-xl" style={{ animationDelay: "1.6s" }}>
          🐾
        </span>
        <span className="absolute right-2 bottom-28 animate-float-side text-lg" style={{ animationDelay: "2.4s" }}>
          💤
        </span>
      </div>

      {/* ذرات درخشان هنگام کلیک */}
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="absolute text-2xl"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            animation: "sparkle-pop 0.7s ease-out forwards",
          }}
        >
          {s.emoji}
        </span>
      ))}

      {/* شخصیت‌های اصلی */}
      <div
        className={`absolute inset-0 transition-transform duration-300 ease-out ${bounce ? "animate-bounce-tap" : ""}`}
        style={{
          transform: bounce ? undefined : "translate(var(--parallax-x), var(--parallax-y))",
        }}
      >
        <svg viewBox="0 0 800 600" className="h-full w-full" aria-label="سگ و گربه در کنار هم">
          <defs>
            <linearGradient id="dogBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFC58A" />
              <stop offset="100%" stopColor="#F2A65A" />
            </linearGradient>
            <linearGradient id="dogHead" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFD9AC" />
              <stop offset="100%" stopColor="#F6B877" />
            </linearGradient>
            <linearGradient id="catBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#AEB3BC" />
              <stop offset="100%" stopColor="#8A8F98" />
            </linearGradient>
            <linearGradient id="catHead" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B9BEC7" />
              <stop offset="100%" stopColor="#9DA2AB" />
            </linearGradient>
            <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-primary-soft)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--color-primary-soft)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <ellipse cx="400" cy="520" rx="320" ry="46" fill="url(#groundShadow)" />

          {/* سگ */}
          <g className="animate-breathe">
            <path
              d="M 540 400 Q 615 365 602 305"
              stroke="#E2863A"
              strokeWidth="26"
              strokeLinecap="round"
              fill="none"
              className="animate-wag"
            />
            <ellipse cx="500" cy="440" rx="97" ry="76" fill="url(#dogBody)" />
            <ellipse cx="445" cy="507" rx="22" ry="28" fill="#E2863A" />
            <ellipse cx="555" cy="507" rx="22" ry="28" fill="#E2863A" />

            <circle cx="490" cy="338" r="74" fill="url(#dogHead)" />
            <ellipse cx="435" cy="298" rx="25" ry="42" fill="#E2863A" transform="rotate(-25 435 298)" />
            <ellipse cx="545" cy="298" rx="25" ry="42" fill="#E2863A" transform="rotate(25 545 298)" />

            <ellipse cx="490" cy="368" rx="36" ry="25" fill="#FFF0DA" />
            <ellipse cx="490" cy="357" rx="11" ry="8" fill="#4b3621" />
            <ellipse cx="493" cy="353" rx="3" ry="2" fill="#ffffff" opacity="0.7" />

            {/* گونه‌های گلگون */}
            <ellipse cx="450" cy="352" rx="11" ry="7" fill="#FF8A6B" opacity="0.45" />
            <ellipse cx="530" cy="352" rx="11" ry="7" fill="#FF8A6B" opacity="0.45" />

            <g className="animate-blink">
              <ellipse cx="460" cy="326" rx="9" ry="11" fill="#2c2117" />
              <ellipse cx="462.5" cy="322" rx="2.6" ry="3.2" fill="#ffffff" opacity="0.85" />
              <ellipse cx="520" cy="326" rx="9" ry="11" fill="#2c2117" />
              <ellipse cx="522.5" cy="322" rx="2.6" ry="3.2" fill="#ffffff" opacity="0.85" />
            </g>
          </g>

          {/* گربه */}
          <g className="animate-breathe" style={{ animationDelay: "0.6s" }}>
            <path
              d="M 250 460 Q 185 425 198 365"
              stroke="#6B6F76"
              strokeWidth="18"
              strokeLinecap="round"
              fill="none"
              className="animate-wag"
              style={{ animationDelay: "0.3s" }}
            />
            <ellipse cx="300" cy="455" rx="80" ry="63" fill="url(#catBody)" />
            <ellipse cx="258" cy="508" rx="18" ry="22" fill="#6B6F76" />
            <ellipse cx="342" cy="508" rx="18" ry="22" fill="#6B6F76" />

            <circle cx="300" cy="370" r="62" fill="url(#catHead)" />
            <path d="M 255 338 L 244 290 L 287 316 Z" fill="#8A8F98" />
            <path d="M 345 338 L 356 290 L 313 316 Z" fill="#8A8F98" />
            <path d="M 258 332 L 251 302 L 278 318 Z" fill="#FFB6A3" opacity="0.7" />
            <path d="M 342 332 L 349 302 L 322 318 Z" fill="#FFB6A3" opacity="0.7" />

            <ellipse cx="300" cy="391" rx="27" ry="18" fill="#F3F4F6" />
            <path d="M 300 380 L 293 389 L 307 389 Z" fill="#4b3621" />

            {/* گونه‌های گلگون */}
            <ellipse cx="263" cy="378" rx="10" ry="6" fill="#FF8A6B" opacity="0.4" />
            <ellipse cx="337" cy="378" rx="10" ry="6" fill="#FF8A6B" opacity="0.4" />

            <path
              d="M 268 391 L 226 384 M 268 397 L 224 399 M 332 391 L 374 384 M 332 397 L 376 399"
              stroke="#c7c9cd"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <g className="animate-blink" style={{ animationDelay: "0.4s" }}>
              <ellipse cx="277" cy="360" rx="7.5" ry="9.5" fill="#2a2a2e" />
              <ellipse cx="279.5" cy="356" rx="2.2" ry="2.8" fill="#ffffff" opacity="0.85" />
              <ellipse cx="323" cy="360" rx="7.5" ry="9.5" fill="#2a2a2e" />
              <ellipse cx="325.5" cy="356" rx="2.2" ry="2.8" fill="#ffffff" opacity="0.85" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
