import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";
import { gregorianToJalali, isJalaliLeapYear } from "@/lib/jalali";
import type { Pet } from "@prisma/client";

/**
 * موتور محاسبهٔ پیام‌های شخصی‌سازی‌شده (خوشامد، تولد، اولین ماه، یادآوری‌ها و...).
 * چون این پروژه زیرساخت صف/کرون همیشه‌روشن ندارد، این ماژول یک تابع idempotent است
 * که هم هنگام باز شدن صفحات مرتبط (lazy) و هم از مسیر /api/cron/dispatch-notifications
 * صدا زده می‌شود. یکتایی هر پیام با NotificationLog.dedupeKey تضمین می‌شود.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function daysSince(date: Date, now: Date): number {
  return Math.floor((now.getTime() - date.getTime()) / DAY_MS);
}

/** تطبیق ماه/روز تولد ذخیره‌شده با امروز، با رعایت قانون سال کبیسه. */
export function isBirthdayToday(pet: Pick<Pet, "birthDateValue" | "birthCalendar" | "birthPrecision">, now: Date): boolean {
  if (pet.birthPrecision !== "EXACT" || !pet.birthDateValue || !pet.birthCalendar) return false;
  const parts = pet.birthDateValue.split("-").map(Number);
  if (parts.length < 3) return false;
  const [, storedMonth, storedDay] = parts;

  if (pet.birthCalendar === "GREGORIAN") {
    const month = storedMonth;
    let day = storedDay;
    const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    if (month === 2 && day === 29 && !isLeap(now.getFullYear())) day = 28;
    return now.getMonth() + 1 === month && now.getDate() === day;
  }

  // تقویم جلالی
  const [jy, jm, jd] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const month = storedMonth;
  let day = storedDay;
  if (month === 12 && day === 30 && !isJalaliLeapYear(jy)) day = 29;
  return jm === month && jd === day;
}

async function recordOnce(params: {
  userId: string;
  petId?: string;
  kind:
    | "WELCOME"
    | "PET_WELCOME"
    | "BIRTHDAY"
    | "FIRST_MONTH"
    | "CARD_NUDGE"
    | "BIRTHDAY_NUDGE"
    | "CALENDAR_REMINDER"
    | "COURSE_DONE"
    | "COURSE_NUDGE";
  dedupeKey: string;
  channel: "PANEL" | "SMS";
  message: string;
  status?: "QUEUED" | "SENT_MOCK" | "SKIPPED";
}): Promise<boolean> {
  try {
    await prisma.notificationLog.create({
      data: {
        userId: params.userId,
        petId: params.petId,
        kind: params.kind,
        dedupeKey: params.dedupeKey,
        channel: params.channel,
        message: params.message,
        status: params.status ?? "QUEUED",
      },
    });
    return true;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "P2002") return false; // قبلاً ثبت شده (idempotent)
    throw err;
  }
}

function petDisplayName(pet: Pick<Pet, "name">): string {
  return pet.name?.trim() || "فرزند عزیزت";
}

/** پیام‌های یک کاربر را محاسبه، ثبت و (در صورت اجازه) به‌صورت mock پیامک می‌کند. */
export async function computeAndDispatchForUser(userId: string, now: Date = new Date()) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { pets: { where: { isArchived: false } } },
  });
  if (!user) return;

  const candidates: {
    priority: number;
    kind: Parameters<typeof recordOnce>[0]["kind"];
    petId?: string;
    dedupeKey: string;
    message: string;
    wantsSms: boolean;
  }[] = [];

  // --- خوشامدگویی حساب ---
  candidates.push({
    priority: 4,
    kind: "WELCOME",
    dedupeKey: `welcome:${user.id}`,
    message: `سلام${user.name ? " " + user.name : ""}، خوشحالیم که به خانواده پت‌لند پیوستی.`,
    wantsSms: true,
  });

  // --- خوشامد هر پت ---
  for (const pet of user.pets) {
    candidates.push({
      priority: 4,
      kind: "PET_WELCOME",
      petId: pet.id,
      dedupeKey: `petwelcome:${pet.id}`,
      message: pet.name
        ? `سلام${user.name ? " " + user.name : ""}، خوشحالیم که ${pet.name} به خانواده ما اضافه شده است.`
        : `سلام${user.name ? " " + user.name : ""}، خوشحالیم که فرزند عزیزت به خانواده ما اضافه شده است.`,
      wantsSms: true,
    });
  }

  // --- اولین ماه همراهی (فقط اگر ۳۰ تا ۳۷ روز گذشته - پنجرهٔ محافظه‌کارانه برای جلوگیری از پیام‌های عقب‌افتادهٔ انبوه) ---
  const accountDays = daysSince(user.createdAt, now);
  if (accountDays >= 30 && accountDays <= 37) {
    const hasActivePet = user.pets.length > 0;
    candidates.push({
      priority: 3,
      kind: "FIRST_MONTH",
      dedupeKey: `firstmonth:${user.id}`,
      message: hasActivePet
        ? "یک ماهه که همراه مایی؛ از بودنت خوشحالیم. هر وقت خواستی، مراقبت‌ها و آموزش‌های فرزند عزیزت اینجا در دسترسه."
        : "یک ماهه که همراه مایی؛ از بودنت خوشحالیم. هر وقت خواستی، محصولات و آموزش‌های پت‌لند اینجا در دسترسه.",
      wantsSms: true,
    });
  }

  for (const pet of user.pets) {
    // --- تولد ---
    if (isBirthdayToday(pet, now)) {
      candidates.push({
        priority: 1,
        kind: "BIRTHDAY",
        petId: pet.id,
        dedupeKey: `birthday:${pet.id}:${now.getFullYear()}`,
        message: pet.name
          ? `تولد ${pet.name} مبارک! خوشحالیم که این روز شیرین رو با هم به یاد داریم.`
          : "تولد فرزند عزیزت مبارک!",
        wantsSms: true,
      });
    }

    // --- پیشنهاد تکمیل کارت هر ۳۰ روز اگر نام یا نوع خالی باشد ---
    if (!pet.name || !pet.species) {
      const period = Math.floor(daysSince(pet.createdAt, now) / 30);
      if (period >= 1) {
        candidates.push({
          priority: 6,
          kind: "CARD_NUDGE",
          petId: pet.id,
          dedupeKey: `cardnudge:${pet.id}:${period}`,
          message:
            "هر وقت دوست داشتی، اسم و نوع فرزند عزیزت رو در کارت ثبت کن. تکمیل مشخصات اختیاریه و چت هوش مصنوعی به این اطلاعات دسترسی داره و می‌تونه کمک‌حال شما باشه.",
          wantsSms: true,
        });
      }
    }

    // --- پیشنهاد ثبت تاریخ تولد هر ۹۰ روز ---
    if (pet.birthPrecision !== "EXACT") {
      const period = Math.floor(daysSince(pet.createdAt, now) / 90);
      if (period >= 1) {
        candidates.push({
          priority: 5,
          kind: "BIRTHDAY_NUDGE",
          petId: pet.id,
          dedupeKey: `birthdaynudge:${pet.id}:${period}`,
          message: `تاریخ تولد ${petDisplayName(pet)} رو می‌دونی؟ اگر دوست داشتی توی کارتش ثبتش کن تا روز ویژه‌اش رو با هم به یاد داشته باشیم.`,
          wantsSms: true,
        });
      }
    }
  }

  // --- یادگاری پایان دوره (COURSE_DONE) ---
  const completedEnrollments = await prisma.enrollment.findMany({
    where: { userId: user.id, progress: 100 },
    include: { coursePackage: true, certificate: true },
  });
  for (const enrollment of completedEnrollments) {
    if (enrollment.certificate) continue;
    candidates.push({
      priority: 2,
      kind: "COURSE_DONE",
      dedupeKey: `coursedone:${enrollment.id}`,
      message: `دوره ${enrollment.coursePackage.title} رو کامل کردی. ممنون که برای یادگیری و مراقبت وقت گذاشتی؛ یادگاری پایان دوره‌ات آماده است.`,
      wantsSms: true,
    });
  }

  // --- پیگیری دوره رهاشده (۳۰ روز از آخرین پیشرفت واقعی) ---
  const inProgressEnrollments = await prisma.enrollment.findMany({
    where: { userId: user.id, progress: { lt: 100 } },
    include: { coursePackage: true },
  });
  for (const enrollment of inProgressEnrollments) {
    const sinceProgress = daysSince(enrollment.updatedAt, now);
    if (sinceProgress >= 30) {
      candidates.push({
        priority: 7,
        kind: "COURSE_NUDGE",
        dedupeKey: `coursenudge:${enrollment.id}`,
        message: `اگر هنوز دوست داری، ادامه دوره ${enrollment.coursePackage.title} در آموزش‌های من آماده است. می‌تونی از همون‌جا که موندی ادامه بدی.`,
        wantsSms: true,
      });
    }
  }

  // --- مرتب‌سازی طبق اولویت سند ---
  candidates.sort((a, b) => a.priority - b.priority);

  const smsAlreadySentToday = await prisma.notificationLog.count({
    where: {
      userId: user.id,
      channel: "SMS",
      status: "SENT_MOCK",
      createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
    },
  });
  let smsUsedToday = smsAlreadySentToday > 0;

  for (const candidate of candidates) {
    const canSendSms = user.friendlySmsOptIn && user.phone && candidate.wantsSms && !smsUsedToday;
    const created = await recordOnce({
      userId: user.id,
      petId: candidate.petId,
      kind: candidate.kind,
      dedupeKey: candidate.dedupeKey,
      channel: canSendSms ? "SMS" : "PANEL",
      message: candidate.message,
      status: canSendSms ? "SENT_MOCK" : "QUEUED",
    });
    if (created && canSendSms) {
      await sendSms(user.phone!, candidate.message.slice(0, 240));
      smsUsedToday = true;
    }
  }
}

/**
 * یادآورهای تقویم مراقبتی، طبق سند، تابع سقف روزانه/اولویت پیامک‌های دیگر نیستند
 * و مستقل ارسال می‌شوند. بازهٔ ارسال ۸ تا ۲۱ رعایت می‌شود (اگر زمان محاسبه‌شده
 * بیرون این بازه باشد، به نزدیک‌ترین لبهٔ مجاز منتقل می‌شود؛ خود رویداد تغییر نمی‌کند).
 */
export async function dispatchCalendarReminders(userId: string, now: Date = new Date()) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const tasks = await prisma.petCalendarTask.findMany({
    where: { userId, dueAt: { gt: new Date(now.getTime() - 24 * DAY_MS) } },
    include: { pet: true },
  });

  for (const task of tasks) {
    for (const offsetDays of task.reminderOffsets) {
      const reminderDate = new Date(task.dueAt);
      reminderDate.setDate(reminderDate.getDate() - offsetDays);
      if (!task.hasTime) reminderDate.setHours(10, 0, 0, 0);

      const sendTime = new Date(reminderDate);
      if (sendTime.getHours() < 8) {
        sendTime.setDate(sendTime.getDate() - 1);
        sendTime.setHours(21, 0, 0, 0);
      } else if (sendTime.getHours() >= 21) {
        sendTime.setHours(21, 0, 0, 0);
      }

      if (now < sendTime || now >= task.dueAt) continue;

      const dedupeKey = `calreminder:${task.id}:${offsetDays}`;
      const petLabel = task.pet?.name || (task.pet ? "فرزند عزیزت" : "");
      const message = petLabel
        ? `یادآوری مراقبت برای ${petLabel} در ${task.dueAt.toLocaleString("fa-IR")}. جزئیات در پنل تو آماده است.`
        : `یادآوری: «${task.text.slice(0, 60)}» برای ${task.dueAt.toLocaleString("fa-IR")}. جزئیات در پنل تو آماده است.`;

      const canSendSms = user.friendlySmsOptIn && !!user.phone;
      const created = await recordOnce({
        userId: user.id,
        petId: task.petId ?? undefined,
        kind: "CALENDAR_REMINDER",
        dedupeKey,
        channel: canSendSms ? "SMS" : "PANEL",
        message,
        status: canSendSms ? "SENT_MOCK" : "QUEUED",
      });
      if (created && canSendSms) {
        await sendSms(user.phone!, message.slice(0, 240));
      }
    }
  }
}

export async function dispatchAllDueNotifications(now: Date = new Date()) {
  const users = await prisma.user.findMany({ select: { id: true } });
  for (const u of users) {
    await computeAndDispatchForUser(u.id, now);
    await dispatchCalendarReminders(u.id, now);
  }
  return { processed: users.length };
}

// helper مستقل برای استفاده احتمالی بیرون از این فایل (تست دستی)
export const __internal = { gregorianToJalali, isJalaliLeapYear };
