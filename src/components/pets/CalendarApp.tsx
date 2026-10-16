"use client";

import { useEffect, useMemo, useState } from "react";
import {
  gregorianToJalali,
  jalaliToGregorian,
  jalaliMonthLength,
  jalaliMonthLabel,
  weekdayIndexFa,
  weekdayLabelsFa,
  toFaDigits,
} from "@/lib/jalali";

type Pet = { id: string; name: string | null };
type Task = {
  id: string;
  text: string;
  dueAt: string;
  hasTime: boolean;
  reminderOffsets: number[];
  petId: string | null;
  pet: { id: string; name: string | null } | null;
};

export function CalendarApp({ pets, initialPetId }: { pets: Pet[]; initialPetId?: string }) {
  const todayJalali = gregorianToJalali(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate()
  );
  const [jy, setJy] = useState(todayJalali[0]);
  const [jm, setJm] = useState(todayJalali[1]);
  const [selectedDay, setSelectedDay] = useState(todayJalali[2]);
  const [petFilter, setPetFilter] = useState(initialPetId ?? "");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState<Task | "new" | null>(null);

  const daysInMonth = jalaliMonthLength(jy, jm);

  const [startGY, startGM, startGD] = jalaliToGregorian(jy, jm, 1);
  const monthStart = new Date(startGY, startGM - 1, startGD);
  const leadingBlanks = weekdayIndexFa(monthStart);

  async function loadTasks() {
    setLoading(true);
    const [endGY, endGM, endGD] = jalaliToGregorian(jy, jm, daysInMonth);
    const from = new Date(startGY, startGM - 1, startGD).toISOString();
    const to = new Date(endGY, endGM - 1, endGD + 1).toISOString();
    const params = new URLSearchParams({ from, to });
    if (petFilter) params.set("petId", petFilter);
    const res = await fetch(`/api/calendar-tasks?${params}`);
    const data = await res.json();
    setTasks(data.tasks ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // واکشی از سرور بر اساس تغییر ماه/فیلتر پت؛ setState داخل loadTasks نتیجهٔ fetch است.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jy, jm, petFilter]);

  const tasksByDay = useMemo(() => {
    const map = new Map<number, Task[]>();
    for (const t of tasks) {
      const d = new Date(t.dueAt);
      const [, , jd] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
      if (!map.has(jd)) map.set(jd, []);
      map.get(jd)!.push(t);
    }
    for (const list of map.values()) list.sort((a, b) => a.dueAt.localeCompare(b.dueAt));
    return map;
  }, [tasks]);

  const selectedTasks = tasksByDay.get(selectedDay) ?? [];
  const isToday = (d: number) => jy === todayJalali[0] && jm === todayJalali[1] && d === todayJalali[2];

  function goToToday() {
    setJy(todayJalali[0]);
    setJm(todayJalali[1]);
    setSelectedDay(todayJalali[2]);
  }

  function changeMonth(delta: number) {
    let newM = jm + delta;
    let newY = jy;
    if (newM > 12) {
      newM = 1;
      newY++;
    } else if (newM < 1) {
      newM = 12;
      newY--;
    }
    setJm(newM);
    setJy(newY);
    setSelectedDay(1);
  }

  async function handleDelete(id: string) {
    if (!confirm("این تسک حذف شود؟")) return;
    await fetch(`/api/calendar-tasks/${id}`, { method: "DELETE" });
    loadTasks();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => changeMonth(-1)} className="rounded-full border border-border px-3 py-1.5 text-sm">
            ماه قبل
          </button>
          <span className="w-32 text-center font-bold">
            {jalaliMonthLabel(jm)} {toFaDigits(jy)}
          </span>
          <button onClick={() => changeMonth(1)} className="rounded-full border border-border px-3 py-1.5 text-sm">
            ماه بعد
          </button>
          <button onClick={goToToday} className="rounded-full bg-accent px-3 py-1.5 text-sm text-accent-foreground">
            امروز
          </button>
        </div>

        {pets.length > 0 && (
          <select
            value={petFilter}
            onChange={(e) => setPetFilter(e.target.value)}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm"
          >
            <option value="">همهٔ پت‌ها</option>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || "فرزند عزیزت"}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {weekdayLabelsFa.map((w) => (
          <div key={w} className="py-1">
            {w.slice(0, 2)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`b${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dayTasks = tasksByDay.get(day) ?? [];
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`relative rounded-lg py-2 text-sm transition ${
                selectedDay === day
                  ? "bg-primary text-primary-foreground"
                  : isToday(day)
                    ? "bg-accent-soft text-accent"
                    : "hover:bg-surface-muted"
              }`}
            >
              {toFaDigits(day)}
              {dayTasks.length > 0 && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold">
            {jalaliMonthLabel(jm)} {toFaDigits(selectedDay)}
          </h3>
          <button
            onClick={() => setShowForm("new")}
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
          >
            + افزودن تسک
          </button>
        </div>

        {loading && <p className="text-xs text-muted-foreground">در حال بارگذاری...</p>}

        {selectedTasks.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">کاری برای این روز ثبت نشده.</p>
        )}

        <div className="space-y-2">
          {selectedTasks.map((t) => (
            <div key={t.id} className="flex items-start justify-between rounded-xl bg-surface-muted p-3 text-sm">
              <div>
                <div className="font-medium">
                  {t.hasTime
                    ? new Date(t.dueAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
                    : "تمام روز"}
                  {t.pet && <span className="mr-2 text-xs text-accent">· {t.pet.name || "فرزند عزیزت"}</span>}
                </div>
                <div>{t.text}</div>
              </div>
              <div className="flex gap-2 text-xs">
                <button onClick={() => setShowForm(t)} className="text-primary">
                  ویرایش
                </button>
                <button onClick={() => handleDelete(t.id)} className="text-red-600">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <TaskFormModal
          pets={pets}
          jy={jy}
          jm={jm}
          selectedDay={selectedDay}
          initial={showForm === "new" ? null : showForm}
          onClose={() => setShowForm(null)}
          onSaved={() => {
            setShowForm(null);
            loadTasks();
          }}
        />
      )}
    </div>
  );
}

function TaskFormModal({
  pets,
  jy,
  jm,
  selectedDay,
  initial,
  onClose,
  onSaved,
}: {
  pets: Pet[];
  jy: number;
  jm: number;
  selectedDay: number;
  initial: Task | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initialDate = initial ? new Date(initial.dueAt) : null;
  const [year, setYear] = useState(jy);
  const [month, setMonth] = useState(jm);
  const [day, setDay] = useState(selectedDay);
  const [time, setTime] = useState(
    initial?.hasTime && initialDate
      ? initialDate.toTimeString().slice(0, 5)
      : ""
  );
  const [text, setText] = useState(initial?.text ?? "");
  const [petId, setPetId] = useState(initial?.petId ?? "");
  const [reminderEnabled, setReminderEnabled] = useState((initial?.reminderOffsets.length ?? 0) > 0);
  const [offset7, setOffset7] = useState(initial?.reminderOffsets.includes(7) ?? false);
  const [offset1, setOffset1] = useState(initial?.reminderOffsets.includes(1) ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!text.trim()) {
      setError("متن تسک را بنویس");
      return;
    }
    setLoading(true);
    setError(null);

    const [gy, gm, gd] = jalaliToGregorian(year, month, day);
    const hasTime = !!time;
    const dueAt = hasTime
      ? new Date(gy, gm - 1, gd, Number(time.split(":")[0]), Number(time.split(":")[1]))
      : new Date(gy, gm - 1, gd, 10, 0);

    const reminderOffsets = reminderEnabled ? [offset7 && 7, offset1 && 1].filter(Boolean) as number[] : [];

    const payload = {
      text,
      petId: petId || undefined,
      dueAt: dueAt.toISOString(),
      hasTime,
      reminderOffsets,
    };

    const url = initial ? `/api/calendar-tasks/${initial.id}` : "/api/calendar-tasks";
    const method = initial ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      setError("خطایی رخ داد");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md space-y-3 rounded-2xl bg-surface p-5">
        <h3 className="font-bold">{initial ? "ویرایش تسک" : "تسک جدید"}</h3>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="هر کاری که دوست داری یادت باشه..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />

        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            placeholder="روز"
            className="rounded-lg border border-border bg-background px-2 py-2 text-sm"
          />
          <input
            type="number"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            placeholder="ماه"
            className="rounded-lg border border-border bg-background px-2 py-2 text-sm"
          />
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            placeholder="سال"
            className="rounded-lg border border-border bg-background px-2 py-2 text-sm"
          />
        </div>

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <p className="text-xs text-muted-foreground">ساعت را خالی بگذار اگر این تسک برای تمام روز است.</p>

        {pets.length > 0 && (
          <select
            value={petId}
            onChange={(e) => setPetId(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">بدون پت خاص</option>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || "فرزند عزیزت"}
              </option>
            ))}
          </select>
        )}

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={reminderEnabled} onChange={(e) => setReminderEnabled(e.target.checked)} />
          یادآوری با پیامک
        </label>
        {reminderEnabled && (
          <div className="flex gap-4 pr-6 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={offset7} onChange={(e) => setOffset7(e.target.checked)} />
              یک هفته قبل
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={offset1} onChange={(e) => setOffset1(e.target.checked)} />
              یک روز قبل
            </label>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {loading ? "در حال ذخیره..." : "ذخیره"}
          </button>
          <button onClick={onClose} className="rounded-full border border-border px-4 py-2.5 text-sm">
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
