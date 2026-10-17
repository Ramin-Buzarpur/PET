import type { CompanionState } from "./types";

/** حالت‌هایی که فقط با تایمر تصادفی (نه با رویداد کاربر) انتخاب می‌شوند. */
const AUTONOMOUS_WEIGHTS: Partial<Record<CompanionState, number>> = {
  idle: 28,
  wander: 33,
  chase: 15,
  play: 12,
  fight: 7,
  waving: 5,
};

const AUTONOMOUS_STATES = Object.keys(AUTONOMOUS_WEIGHTS) as CompanionState[];

export function pickNextAutonomousState(prev: CompanionState): CompanionState {
  const pool = AUTONOMOUS_STATES.filter((s) => s !== prev);
  const total = pool.reduce((sum, s) => sum + (AUTONOMOUS_WEIGHTS[s] ?? 0), 0);
  let roll = Math.random() * total;
  for (const state of pool) {
    roll -= AUTONOMOUS_WEIGHTS[state] ?? 0;
    if (roll <= 0) return state;
  }
  return pool[0];
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** مدت‌زمان (ثانیه) یک حالت پیش از رفتن به سراغ حالت بعدی. */
export function durationForState(state: CompanionState): number {
  switch (state) {
    case "idle":
      return randomBetween(2, 4);
    case "wander":
      return randomBetween(1.5, 3);
    case "chase":
    case "play":
    case "fight":
      return randomBetween(2, 4);
    case "petted-happy":
    case "petted-annoyed":
    case "waving":
    case "shaken":
      return randomBetween(1.2, 2);
    default:
      return 2;
  }
}
