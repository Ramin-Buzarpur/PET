"use client";

import { useEffect, useState } from "react";

type Pet = { id: string; name: string | null };
type Summary = {
  name: string | null;
  species: string | null;
  breed: string | null;
  gender: string;
  illness: string | null;
  allergies: string | null;
  medications: string | null;
};

export function PetChatSelector({
  onPetChange,
}: {
  onPetChange: (petId: string | null) => void;
}) {
  const [pets, setPets] = useState<Pet[] | null>(null);
  const [selected, setSelected] = useState("");
  const [pendingConsent, setPendingConsent] = useState<{ petId: string; summary: Summary } | null>(null);

  useEffect(() => {
    fetch("/api/pets")
      .then((r) => (r.ok ? r.json() : { pets: [] }))
      .then((d) => setPets(d.pets ?? []));
  }, []);

  async function handleSelect(petId: string) {
    setSelected(petId);
    setPendingConsent(null);

    if (!petId) {
      onPetChange(null);
      return;
    }

    const res = await fetch(`/api/chat/pet-consent?petId=${petId}`);
    const data = await res.json();

    if (data.needsConfirmation) {
      setPendingConsent({ petId, summary: data.summary });
      onPetChange(null); // تا تأیید نشده، مشخصات ارسال نمی‌شود
    } else {
      onPetChange(petId);
    }
  }

  async function grantConsent() {
    if (!pendingConsent) return;
    await fetch("/api/chat/pet-consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petId: pendingConsent.petId }),
    });
    onPetChange(pendingConsent.petId);
    setPendingConsent(null);
  }

  function declineConsent() {
    setPendingConsent(null);
    onPetChange(null);
  }

  if (!pets || pets.length === 0) return null;

  return (
    <div className="border-b border-border px-3 py-2">
      <select
        value={selected}
        onChange={(e) => handleSelect(e.target.value)}
        className="w-full rounded-full border border-border bg-background px-3 py-1.5 text-xs"
      >
        <option value="">پرسش عمومی بدون مشخصات پت</option>
        {pets.map((p) => (
          <option key={p.id} value={p.id}>
            دربارهٔ {p.name || "فرزند عزیزت"}
          </option>
        ))}
      </select>

      {pendingConsent && (
        <div className="mt-2 rounded-xl bg-accent-soft p-3 text-xs text-accent">
          <p className="mb-2">
            اگر موافق باشی، مشخصات ثبت‌شدهٔ این پت (نام، نوع، نژاد، سن تقریبی، آخرین قد/وزن، بیماری/حساسیت/دارو و
            یادداشت کارت) برای پاسخ مرتبط‌تر به سرویس چت فرستاده می‌شه. عکس و دفتر پیشرفت ارسال نمی‌شه. هر وقت
            خواستی می‌تونی این اجازه رو خاموش کنی.
          </p>
          <div className="flex gap-2">
            <button
              onClick={grantConsent}
              className="rounded-full bg-accent px-3 py-1.5 font-medium text-accent-foreground"
            >
              اجازه می‌دهم
            </button>
            <button onClick={declineConsent} className="rounded-full border border-accent px-3 py-1.5">
              بدون مشخصات ادامه بده
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
