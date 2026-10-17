import type { CompanionState } from "@/components/companions/types";

type Props = { className?: string; state: CompanionState };

const BOUNCE_STATES: CompanionState[] = ["petted-happy", "petted-annoyed", "shaken", "waving", "fight"];

function bounceClass(state: CompanionState) {
  return BOUNCE_STATES.includes(state) ? "animate-bounce-tap" : "";
}

/** گربهٔ همراه: نمای کناری ساده، هم‌سبک با AnimalIcons.tsx (SVG تخت، currentColor). */
export function CatCompanionIcon({ className, state }: Props) {
  return (
    <svg viewBox="0 0 64 48" fill="none" className={`${className ?? ""} ${bounceClass(state)}`} aria-hidden>
      <path
        d="M10 30C4 24 4 14 10 8"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        className="animate-wag"
        style={{ transformOrigin: "10px 30px" }}
      />
      <ellipse cx="32" cy="30" rx="18" ry="11" fill="currentColor" />
      <g className="animate-breathe" style={{ transformOrigin: "32px 42px" }}>
        <rect x="22" y="37" width="4" height="8" rx="2" fill="currentColor" />
        <rect x="32" y="37" width="4" height="8" rx="2" fill="currentColor" />
        <rect x="42" y="37" width="4" height="8" rx="2" fill="currentColor" />
      </g>
      <circle cx="46" cy="17" r="10" fill="currentColor" />
      <path d="M40 9L43 1L47 9Z" fill="currentColor" />
      <path d="M50 9L53 1L57 9Z" fill="currentColor" />
      <circle cx="49" cy="16" r="1.4" fill="var(--color-surface)" className="animate-blink" />
    </svg>
  );
}

/** سگ همراه: نمای کناری ساده، گوش آویزان و دم فرفری. */
export function DogCompanionIcon({ className, state }: Props) {
  return (
    <svg viewBox="0 0 64 48" fill="none" className={`${className ?? ""} ${bounceClass(state)}`} aria-hidden>
      <path
        d="M10 28C4 26 2 19 7 15"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        className="animate-wag"
        style={{ transformOrigin: "10px 28px" }}
      />
      <ellipse cx="32" cy="30" rx="19" ry="12" fill="currentColor" />
      <g className="animate-breathe" style={{ transformOrigin: "32px 43px" }}>
        <rect x="22" y="38" width="4" height="8" rx="2" fill="currentColor" />
        <rect x="32" y="38" width="4" height="8" rx="2" fill="currentColor" />
        <rect x="43" y="38" width="4" height="8" rx="2" fill="currentColor" />
      </g>
      <circle cx="47" cy="18" r="11" fill="currentColor" />
      <path d="M38 14C34 14 32 20 35 25C37 22 39 18 40 16Z" fill="currentColor" />
      <circle cx="50" cy="16" r="1.4" fill="var(--color-surface)" className="animate-blink" />
      <ellipse cx="55" cy="21" rx="2.2" ry="1.6" fill="var(--color-surface)" />
    </svg>
  );
}

export const COMPANION_ICONS = {
  cat: CatCompanionIcon,
  dog: DogCompanionIcon,
};
