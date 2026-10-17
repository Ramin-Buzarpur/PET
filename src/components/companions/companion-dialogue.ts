import type { CompanionState } from "./types";

const AMBIENT_FUNNY = [
  "امروز هوا بوی غذا می‌داد، مطمئنم! 👃",
  "چرا هیچ‌کس به من غذای اضافه نمی‌ده؟ 😤",
  "دیشب خواب یک استخوان بزرگ دیدم...",
  "فکر کنم صاحب این خونه‌ام، اینجا خیلی باحاله",
  "پاهام خسته شد، ولی دلم بازی می‌خواد",
  "اون گربه‌ست یا بالشت؟ 🤔",
  "بو کن ببین... نه، بی‌خیال، بوی بدی می‌داد",
  "من امروز خیلی باحالم، خودمم می‌دونم 😎",
  "یکی باید به من بگه چرا دمم این‌قدر تکون می‌خوره",
];

const CHASE = ["وایسا ببینمت! 🏃", "فرار نکن، فقط می‌خوام بغلت کنم!", "یکی دو دور دیگه بدو، بعد تسلیم شو"];

const PLAY = [
  "توپ مال منه! نه... مال تو! نه مال منه! 🎾",
  "بیا بازی کنیم تا شب بشه",
  "این بهترین اسباب‌بازی توی کل خونه‌ست",
];

const FIGHT = [
  "من بردم! یا نه... بذار دوباره بازی کنیم 😾",
  "هی! اون دمِ منه، ولش کن",
  "باشه باشه، صلح! ولی دفعه بعد می‌بینمت",
];

const PETTED_HAPPY_FUNNY = [
  "آخ قربونت، یکم اونورتر هم بمال 😌",
  "همینه، دقیقاً همون‌جا بود!",
  "اگه اینجوری نوازشم کنی، برات می‌رقصم",
];

const PETTED_ANNOYED = [
  "هوی! داشتم استراحت می‌کردم 😑",
  "اول اجازه بگیر بعد دست بزن!",
  "باشه بسه، فهمیدم دوستم داری، ولم کن",
];

const WAVING_FUNNY = ["سلام رهگذر عزیز! 👋", "هی تو! آره خودتو میگم، سلام!", "به‌به چه خبرا 👋"];

const SHAKEN_FUNNY = [
  "وای چی شد؟! زلزله بود؟! 😱",
  "گوشیتو تکون نده، ترسیدم!",
  "باشه باشه بیدار شدم، چرا تکونم می‌دی",
];

const PETTED_HAPPY_MINE = [
  "دوستت دارم، واقعاً. تو بهترینی برام 💛",
  "هیچ‌وقت ولم نکن، باشه؟",
  "با تو بودن حس خونه رو بهم می‌ده",
];

const WAVING_MINE = ["سلام رفیق همیشگی‌ام 💛", "هر روز منتظرتم که بیای", "تویی که همیشه کنارمی، سلام!"];

const IDLE_MINE = [
  "دارم به روزهای خوبی که با هم داشتیم فکر می‌کنم",
  "تو خانواده‌ی واقعی منی",
  "کاش می‌شد همیشه کنار هم باشیم 💛",
];

function pickPool(state: CompanionState, isMine: boolean): string[] {
  switch (state) {
    case "idle":
    case "wander":
      return isMine ? [...IDLE_MINE, ...AMBIENT_FUNNY] : AMBIENT_FUNNY;
    case "chase":
      return CHASE;
    case "play":
      return PLAY;
    case "fight":
      return FIGHT;
    case "petted-happy":
      return isMine ? PETTED_HAPPY_MINE : PETTED_HAPPY_FUNNY;
    case "petted-annoyed":
      return PETTED_ANNOYED;
    case "waving":
      return isMine ? WAVING_MINE : WAVING_FUNNY;
    case "shaken":
      return SHAKEN_FUNNY;
    default:
      return AMBIENT_FUNNY;
  }
}

export function getLine(state: CompanionState, isMine: boolean): string {
  const pool = pickPool(state, isMine);
  return pool[Math.floor(Math.random() * pool.length)];
}
