"use client";

import { useState } from "react";
import { useCompanions } from "./CompanionProvider";
import { MAX_COMPANIONS } from "./types";
import type { CompanionSpecies } from "./types";

export function CompanionSettingsPanel({ onClose }: { onClose: () => void }) {
  const { settings, setEnabled, renameCompanion, addCompanion, setMyCompanion } = useCompanions();
  const [newName, setNewName] = useState("");
  const [newSpecies, setNewSpecies] = useState<CompanionSpecies>("cat");

  const atCap = settings.companions.length >= MAX_COMPANIONS;

  function handleAdd() {
    if (!newName.trim() || atCap) return;
    addCompanion(newSpecies, newName);
    setNewName("");
  }

  return (
    <div className="w-72 rounded-2xl border border-border bg-surface p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold">پت‌های همراه 🐾</h3>
        <button onClick={onClose} aria-label="بستن" className="text-muted-foreground hover:text-foreground">
          ✕
        </button>
      </div>

      <label className="mb-4 flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2.5 text-sm">
        نمایش پت‌های همراه
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
      </label>

      {settings.enabled && (
        <>
          <div className="mb-4 space-y-2">
            {settings.companions.map((c) => (
              <div key={c.id} className="flex items-center gap-2 rounded-xl border border-border px-2.5 py-2">
                <input
                  value={c.name}
                  onChange={(e) => renameCompanion(c.id, e.target.value)}
                  className="w-20 min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1 text-xs font-medium outline-none focus:border-border"
                />
                <label className="flex items-center gap-1 whitespace-nowrap text-[11px] text-muted-foreground">
                  <input
                    type="radio"
                    name="my-companion"
                    checked={settings.myCompanionId === c.id}
                    onChange={() => setMyCompanion(c.id)}
                    className="h-3 w-3 accent-primary"
                  />
                  پت منه
                </label>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-dashed border-border p-2.5">
            {atCap ? (
              <p className="text-center text-[11px] text-muted-foreground">
                گروه الان شلوغه! 🐾 حداکثر {MAX_COMPANIONS} تا دوست می‌شه داشت.
              </p>
            ) : (
              <div className="flex items-center gap-1.5">
                <select
                  value={newSpecies}
                  onChange={(e) => setNewSpecies(e.target.value as CompanionSpecies)}
                  className="rounded-lg border border-border bg-surface px-1.5 py-1.5 text-xs"
                >
                  <option value="cat">گربه</option>
                  <option value="dog">سگ</option>
                </select>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="اسم پت جدید"
                  className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-2 py-1.5 text-xs outline-none focus:border-primary"
                />
                <button
                  onClick={handleAdd}
                  className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-bold text-primary-foreground"
                >
                  افزودن
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
