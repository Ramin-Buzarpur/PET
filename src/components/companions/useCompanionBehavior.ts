"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { pickNextAutonomousState, durationForState } from "./companion-behavior";
import { getLine } from "./companion-dialogue";
import type { CompanionState } from "./types";

const CHAR_WIDTH = 56;
const TALK_MIN_MS = 18000;
const TALK_MAX_MS = 40000;

export function useCompanionBehavior({
  trackRef,
  isMine,
  reducedMotion,
}: {
  trackRef: React.RefObject<HTMLDivElement | null>;
  isMine: boolean;
  reducedMotion: boolean;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CompanionState>("idle");
  const stateRef = useRef<CompanionState>("idle");
  const [line, setLine] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const talkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lineHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function say(forState: CompanionState) {
    const text = getLine(forState, isMine);
    setLine(text);
    if (lineHideRef.current) clearTimeout(lineHideRef.current);
    lineHideRef.current = setTimeout(() => setLine(null), 3200);
  }

  function wanderTo() {
    const el = elRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const trackWidth = track.clientWidth;
    const targetX = Math.random() * Math.max(trackWidth - CHAR_WIDTH, 0);
    gsap.to(el, {
      x: targetX,
      duration: gsap.utils.random(1.5, 3),
      ease: "sine.inOut",
    });
  }

  function runAutonomous(forcedNext?: CompanionState) {
    const next = forcedNext ?? pickNextAutonomousState(stateRef.current);
    stateRef.current = next;
    setState(next);
    if (next === "wander" || next === "chase" || next === "play") wanderTo();
    if (next === "waving") say(next);

    const ms = durationForState(next) * 1000;
    timerRef.current = setTimeout(() => runAutonomous(), ms);
  }

  /** از بیرون (مثلاً هماهنگ‌کنندهٔ جفت در CompanionWidget) صدا زده می‌شود. */
  function forceState(forced: CompanionState) {
    if (timerRef.current) clearTimeout(timerRef.current);
    runAutonomous(forced);
  }

  function react(reactive: CompanionState) {
    if (reducedMotion) {
      stateRef.current = reactive;
      setState(reactive);
      say(reactive);
      setTimeout(() => {
        stateRef.current = "idle";
        setState("idle");
      }, 1500);
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    stateRef.current = reactive;
    setState(reactive);
    say(reactive);
    const ms = durationForState(reactive) * 1000;
    timerRef.current = setTimeout(() => runAutonomous(), ms);
  }

  function handlePet() {
    const happy = Math.random() > 0.35;
    react(happy ? "petted-happy" : "petted-annoyed");
  }

  function handleWave() {
    react("waving");
  }

  function handleShake() {
    react("shaken");
  }

  useEffect(() => {
    if (reducedMotion) return;

    runAutonomous("idle");

    function scheduleTalk() {
      const ms = TALK_MIN_MS + Math.random() * (TALK_MAX_MS - TALK_MIN_MS);
      talkTimerRef.current = setTimeout(() => {
        say(stateRef.current);
        scheduleTalk();
      }, ms);
    }
    scheduleTalk();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (talkTimerRef.current) clearTimeout(talkTimerRef.current);
      if (lineHideRef.current) clearTimeout(lineHideRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return { elRef, state, line, handlePet, handleWave, handleShake, forceState };
}
