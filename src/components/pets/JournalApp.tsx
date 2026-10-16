"use client";

import { useEffect, useRef, useState } from "react";
import {
  setupJournal,
  unlockWithPassphrase,
  unlockWithRecoveryCode,
  encryptText,
  decryptText,
} from "@/lib/journal-crypto";

type Meta = { salt: string; wrappedKeyByPassphrase: string; wrappedKeyByRecovery: string } | null;
type RawEntry = { id: string; titleCipher: string | null; bodyCipher: string; iv: string; createdAt: string };
type DecryptedEntry = { id: string; title: string; body: string; createdAt: string };

const IDLE_LOCK_MS = 15 * 60 * 1000;

export function JournalApp({ petId }: { petId: string }) {
  const [meta, setMeta] = useState<Meta | undefined>(undefined); // undefined = loading
  const [dataKey, setDataKey] = useState<CryptoKey | null>(null);
  const [entries, setEntries] = useState<DecryptedEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingEntries, setLoadingEntries] = useState(false);

  useEffect(() => {
    fetch("/api/journal/meta")
      .then((r) => r.json())
      .then((d) => setMeta(d.meta ?? null));
  }, []);

  useEffect(() => {
    if (!dataKey) return;
    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setDataKey(null), IDLE_LOCK_MS);
    };
    resetTimer();
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [dataKey]);

  async function loadAndDecryptEntries(key: CryptoKey) {
    setLoadingEntries(true);
    const res = await fetch(`/api/pets/${petId}/journal`);
    const data = await res.json();
    const raw: RawEntry[] = data.entries ?? [];
    const decrypted: DecryptedEntry[] = [];
    for (const e of raw) {
      try {
        const body = await decryptText(key, e.bodyCipher, e.iv);
        const title = e.titleCipher ? await decryptText(key, e.titleCipher, e.iv) : "";
        decrypted.push({ id: e.id, title, body, createdAt: e.createdAt });
      } catch {
        // یادداشت خراب/غیرقابل‌رمزگشایی نادیده گرفته می‌شود
      }
    }
    setEntries(decrypted);
    setLoadingEntries(false);
  }

  if (meta === undefined) {
    return <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>;
  }

  if (!dataKey) {
    if (!meta) {
      return <SetupScreen onDone={(key) => { setDataKey(key); loadAndDecryptEntries(key); }} />;
    }
    return (
      <UnlockScreen
        meta={meta}
        onUnlock={(key) => {
          setDataKey(key);
          loadAndDecryptEntries(key);
        }}
      />
    );
  }

  return (
    <JournalEditor
      petId={petId}
      dataKey={dataKey}
      entries={entries}
      loading={loadingEntries}
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      refresh={() => loadAndDecryptEntries(dataKey)}
      onLock={() => setDataKey(null)}
    />
  );
}

function SetupScreen({ onDone }: { onDone: (key: CryptoKey) => void }) {
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [confirmRecovery, setConfirmRecovery] = useState("");
  const [pendingSetup, setPendingSetup] = useState<Awaited<ReturnType<typeof setupJournal>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (passphrase.length < 6) return setError("عبارت عبور باید حداقل ۶ کاراکتر باشد");
    if (passphrase !== confirmPassphrase) return setError("عبارت عبور و تکرار آن یکسان نیستند");

    const result = await setupJournal(passphrase);
    setPendingSetup(result);
    setRecoveryCode(result.recoveryCode);
  }

  async function handleConfirmSaved() {
    if (!pendingSetup) return;
    if (confirmRecovery.trim().toUpperCase() !== pendingSetup.recoveryCode) {
      setError("کد بازیابی واردشده با کدی که نشان داده شد یکسان نیست");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/journal/meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        salt: pendingSetup.salt,
        wrappedKeyByPassphrase: pendingSetup.wrappedKeyByPassphrase,
        wrappedKeyByRecovery: pendingSetup.wrappedKeyByRecovery,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("خطا در راه‌اندازی دفتر");
      return;
    }
    onDone(pendingSetup.dataKey);
  }

  if (recoveryCode) {
    return (
      <div className="sticker-card space-y-4 border border-border bg-surface p-6">
        <h2 className="font-bold">کد بازیابی خودت رو نگه دار 🔑</h2>
        <p className="text-sm text-muted-foreground">
          اگر عبارت عبورت رو فراموش کنی، فقط با همین کد می‌تونی دفتر رو باز کنی. هیچ‌کس دیگه‌ای — حتی پشتیبانی ما —
          نمی‌تونه این کد رو برایت بازیابی کند.
        </p>
        <div dir="ltr" className="rounded-xl bg-surface-muted p-4 text-center font-mono text-lg tracking-wider">
          {recoveryCode}
        </div>
        <p className="text-sm font-medium">برای تأیید اینکه آن را جایی نگه داشتی، دوباره تایپش کن:</p>
        <input
          dir="ltr"
          value={confirmRecovery}
          onChange={(e) => setConfirmRecovery(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-center font-mono text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={handleConfirmSaved}
          disabled={loading}
          className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {loading ? "در حال ذخیره..." : "ذخیره کردم، باز کن"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleCreate} className="sticker-card space-y-4 border border-border bg-surface p-6">
      <h2 className="font-bold">راه‌اندازی دفتر پیشرفت خصوصی 📓</h2>
      <p className="text-sm text-muted-foreground">
        این دفتر فقط برای خودت رمزگذاری می‌شود؛ حتی ما هم نمی‌توانیم آن را بخوانیم. اگر عبارت عبور و کد بازیابی هر
        دو گم شوند، هیچ‌کس نمی‌تواند متن را برگرداند.
      </p>
      <div>
        <label className="mb-1 block text-sm font-medium">عبارت عبور دفتر</label>
        <input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">تکرار عبارت عبور</label>
        <input
          type="password"
          value={confirmPassphrase}
          onChange={(e) => setConfirmPassphrase(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground"
      >
        ساخت دفتر
      </button>
    </form>
  );
}

function UnlockScreen({ meta, onUnlock }: { meta: NonNullable<Meta>; onUnlock: (key: CryptoKey) => void }) {
  const [mode, setMode] = useState<"passphrase" | "recovery">("passphrase");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const key =
      mode === "passphrase"
        ? await unlockWithPassphrase(value, meta.salt, meta.wrappedKeyByPassphrase)
        : await unlockWithRecoveryCode(value, meta.salt, meta.wrappedKeyByRecovery);
    setLoading(false);
    if (!key) {
      setError(mode === "passphrase" ? "عبارت عبور اشتباه است" : "کد بازیابی اشتباه است");
      return;
    }
    onUnlock(key);
  }

  return (
    <form onSubmit={handleUnlock} className="sticker-card space-y-4 border border-border bg-surface p-6">
      <h2 className="font-bold">دفتر قفل است 🔒</h2>
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("passphrase")}
          className={`rounded-full px-3 py-1 ${mode === "passphrase" ? "bg-primary text-primary-foreground" : "bg-surface-muted"}`}
        >
          عبارت عبور
        </button>
        <button
          type="button"
          onClick={() => setMode("recovery")}
          className={`rounded-full px-3 py-1 ${mode === "recovery" ? "bg-primary text-primary-foreground" : "bg-surface-muted"}`}
        >
          کد بازیابی
        </button>
      </div>
      <input
        type={mode === "passphrase" ? "password" : "text"}
        dir={mode === "recovery" ? "ltr" : undefined}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {loading ? "در حال باز کردن..." : "باز کردن دفتر"}
      </button>
    </form>
  );
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

function JournalEditor({
  petId,
  dataKey,
  entries,
  loading,
  selectedId,
  setSelectedId,
  refresh,
  onLock,
}: {
  petId: string;
  dataKey: CryptoKey;
  entries: DecryptedEntry[];
  loading: boolean;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  refresh: () => void;
  onLock: () => void;
}) {
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);

  const selected = entries.find((e) => e.id === selectedId) ?? null;

  useEffect(() => {
    // بارگذاری بافر ویرایش از یادداشت تازه‌انتخاب‌شده هنگام تغییر انتخاب کاربر.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(selected?.title ?? "");
    setBody(selected?.body ?? "");
    setStatus("idle");
    dirtyRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  function scheduleSave(nextTitle: string, nextBody: string) {
    dirtyRef.current = true;
    setStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const bodyEnc = await encryptText(dataKey, nextBody);
        const titleEnc = nextTitle ? await encryptText(dataKey, nextTitle) : null;
        if (selectedId) {
          await fetch(`/api/journal-entries/${selectedId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bodyCipher: bodyEnc.cipher,
              iv: bodyEnc.iv,
              titleCipher: titleEnc?.cipher,
            }),
          });
        } else {
          const res = await fetch(`/api/pets/${petId}/journal`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bodyCipher: bodyEnc.cipher,
              iv: bodyEnc.iv,
              titleCipher: titleEnc?.cipher,
            }),
          });
          const data = await res.json();
          setSelectedId(data.entry.id);
        }
        setStatus("saved");
        refresh();
      } catch {
        setStatus("error");
      }
    }, 2000);
  }

  async function handleDelete(id: string) {
    if (!confirm("این یادداشت حذف شود؟")) return;
    await fetch(`/api/journal-entries/${id}`, { method: "DELETE" });
    if (selectedId === id) setSelectedId(null);
    refresh();
  }

  function handleExport() {
    const text = entries
      .map((e) => `${new Date(e.createdAt).toLocaleDateString("fa-IR")}\n${e.title ? e.title + "\n" : ""}${e.body}`)
      .join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "journal.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = search
    ? entries.filter((e) => e.title.includes(search) || e.body.includes(search))
    : entries;

  const statusLabel: Record<SaveStatus, string> = {
    idle: "",
    saving: "در حال ذخیره...",
    saved: "ذخیره شد ✓",
    error: "ذخیره نشد — دوباره تلاش می‌کنیم",
  };

  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_1.5fr]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جست‌وجو..."
            className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          />
        </div>
        <button
          onClick={() => setSelectedId(null)}
          className="mb-2 w-full rounded-lg border border-dashed border-border py-2 text-sm font-medium text-primary hover:bg-surface-muted"
        >
          + یادداشت جدید
        </button>
        <div className="max-h-96 space-y-1 overflow-y-auto">
          {loading && <p className="text-xs text-muted-foreground">در حال بارگذاری...</p>}
          {filtered.map((e) => (
            <div
              key={e.id}
              onClick={() => setSelectedId(e.id)}
              className={`cursor-pointer rounded-lg p-2 text-sm ${
                selectedId === e.id ? "bg-primary-soft" : "hover:bg-surface-muted"
              }`}
            >
              <div className="font-medium line-clamp-1">{e.title || "بدون عنوان"}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">{e.body}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <button onClick={handleExport} className="text-xs font-medium text-muted-foreground hover:text-primary">
            دریافت نوشته‌های من
          </button>
          <button onClick={onLock} className="text-xs font-medium text-muted-foreground hover:text-primary">
            قفل کردن دفتر
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            scheduleSave(e.target.value, body);
          }}
          placeholder="عنوان (اختیاری)"
          maxLength={120}
          className="mb-2 w-full border-b border-border bg-transparent px-1 py-1 text-sm font-bold outline-none"
        />
        <textarea
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            scheduleSave(title, e.target.value);
          }}
          rows={14}
          maxLength={20000}
          placeholder="هر چی دوست داری از پتت بنویس..."
          className="w-full resize-none bg-transparent text-sm outline-none"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{statusLabel[status]}</span>
          {selectedId && (
            <button onClick={() => handleDelete(selectedId)} className="text-red-600">
              حذف این یادداشت
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
