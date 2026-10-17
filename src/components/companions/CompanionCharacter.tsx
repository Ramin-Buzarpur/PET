"use client";

import { forwardRef, useImperativeHandle } from "react";
import { useCompanionBehavior } from "./useCompanionBehavior";
import { COMPANION_ICONS } from "@/components/icons/CompanionIcons";
import type { Companion, CompanionState } from "./types";

export type CompanionCharacterHandle = {
  forceState: (state: CompanionState) => void;
};

export const CompanionCharacter = forwardRef<
  CompanionCharacterHandle,
  {
    companion: Companion;
    isMine: boolean;
    reducedMotion: boolean;
    trackRef: React.RefObject<HTMLDivElement | null>;
  }
>(function CompanionCharacter({ companion, isMine, reducedMotion, trackRef }, ref) {
  const { elRef, state, line, handlePet, forceState } = useCompanionBehavior({
    trackRef,
    isMine,
    reducedMotion,
  });

  useImperativeHandle(ref, () => ({ forceState }), [forceState]);

  const Icon = COMPANION_ICONS[companion.species];

  return (
    <div
      ref={elRef}
      className="pointer-events-auto absolute bottom-0 flex w-14 flex-col items-center"
      style={{ willChange: "transform" }}
    >
      {line && (
        <div className="fade-up mb-1 max-w-[11rem] rounded-xl rounded-bl-sm border border-border bg-surface px-2.5 py-1.5 text-center text-[11px] font-medium leading-5 shadow-lg">
          {line}
        </div>
      )}
      <button
        onClick={handlePet}
        aria-label={`نوازش ${companion.name}`}
        className="relative flex flex-col items-center text-primary transition active:scale-90"
      >
        <Icon state={state} className={`h-10 w-14 ${isMine ? "text-primary" : "text-accent"}`} />
        <span className="mt-0.5 rounded-full bg-surface/90 px-1.5 text-[10px] font-bold text-foreground/80 shadow">
          {companion.name}
        </span>
      </button>
    </div>
  );
});
