"use client";

import { useEffect, useRef, useState } from "react";
import { useCompanions } from "./CompanionProvider";
import { CompanionCharacter, type CompanionCharacterHandle } from "./CompanionCharacter";
import { CompanionSettingsPanel } from "./CompanionSettingsPanel";
import { useShakeDetection } from "./useShakeDetection";

const PAIR_INTERVAL_MIN_MS = 20000;
const PAIR_INTERVAL_MAX_MS = 45000;

export function CompanionWidget() {
  const { settings, hydrated, markShakePermissionAsked } = useCompanions();
  const [panelOpen, setPanelOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<Map<string, CompanionCharacterHandle | null>>(new Map());

  useEffect(() => {
    // matchMedia فقط سمت کلاینت موجود است؛ باید بعد از mount خوانده شود
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  function handleShake() {
    charRefs.current.forEach((handle) => handle?.forceState("shaken"));
  }

  const { permissionNeeded, requestPermission } = useShakeDetection(
    handleShake,
    settings.enabled && !reducedMotion,
  );

  // هماهنگ‌کنندهٔ جفت: هر از گاهی دو همراه را وارد یک تعامل مشترک (تعقیب/بازی/دعوا) می‌کند
  useEffect(() => {
    if (!settings.enabled || reducedMotion || settings.companions.length < 2) return;

    let timer: ReturnType<typeof setTimeout>;

    function scheduleNext() {
      const ms = PAIR_INTERVAL_MIN_MS + Math.random() * (PAIR_INTERVAL_MAX_MS - PAIR_INTERVAL_MIN_MS);
      timer = setTimeout(() => {
        const ids = [...charRefs.current.keys()];
        if (ids.length >= 2) {
          const shuffled = ids.sort(() => Math.random() - 0.5);
          const [a, b] = shuffled;
          const shared = (["chase", "play", "fight"] as const)[Math.floor(Math.random() * 3)];
          charRefs.current.get(a)?.forceState(shared);
          charRefs.current.get(b)?.forceState(shared);
        }
        scheduleNext();
      }, ms);
    }

    scheduleNext();
    return () => clearTimeout(timer);
  }, [settings.enabled, reducedMotion, settings.companions.length]);

  // توقف تایمرهای GSAP هنگام مخفی‌بودن تب (بهینه‌سازی عملکرد)
  useEffect(() => {
    function handleVisibility() {
      import("@/lib/gsap").then(({ gsap }) => {
        if (document.hidden) gsap.globalTimeline.pause();
        else gsap.globalTimeline.resume();
      });
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  if (!hydrated) return null;

  return (
    <>
      {settings.enabled && (
        <div
          ref={trackRef}
          className="pointer-events-none fixed bottom-0 right-0 z-40 h-24 w-[min(90vw,420px)]"
        >
          {settings.companions.map((companion) => (
            <CompanionCharacter
              key={companion.id}
              ref={(handle) => {
                charRefs.current.set(companion.id, handle);
              }}
              companion={companion}
              isMine={settings.myCompanionId === companion.id}
              reducedMotion={reducedMotion}
              trackRef={trackRef}
            />
          ))}
        </div>
      )}

      <div className={`fixed right-3 z-[45] ${settings.enabled ? "bottom-24" : "bottom-3"}`}>
        {panelOpen && (
          <div className="mb-2">
            <CompanionSettingsPanel onClose={() => setPanelOpen(false)} />
          </div>
        )}
        {permissionNeeded && !settings.shakePermissionAsked && (
          <button
            onClick={() => {
              markShakePermissionAsked();
              requestPermission();
            }}
            className="mb-2 block rounded-xl border border-border bg-surface px-3 py-2 text-[11px] shadow-lg"
          >
            برای واکنش به تکون گوشی اجازه بده 🤏
          </button>
        )}
        <button
          onClick={() => setPanelOpen((v) => !v)}
          aria-label="تنظیمات پت‌های همراه"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface shadow-lg"
        >
          🐾
        </button>
      </div>
    </>
  );
}
