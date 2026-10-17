"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Companion, CompanionSettings, CompanionSpecies } from "./types";
import { MAX_COMPANIONS } from "./types";

const STORAGE_KEY = "pet-shop-companions";

const DEFAULT_SETTINGS: CompanionSettings = {
  enabled: true,
  myCompanionId: null,
  shakePermissionAsked: false,
  companions: [
    { id: "default-cat", species: "cat", name: "میو", createdAt: 0 },
    { id: "default-dog", species: "dog", name: "پانچو", createdAt: 1 },
  ],
};

function mergeWithDefaults(raw: unknown): CompanionSettings {
  if (!raw || typeof raw !== "object") return DEFAULT_SETTINGS;
  const r = raw as Partial<CompanionSettings>;
  return {
    enabled: typeof r.enabled === "boolean" ? r.enabled : DEFAULT_SETTINGS.enabled,
    myCompanionId: typeof r.myCompanionId === "string" ? r.myCompanionId : null,
    shakePermissionAsked: typeof r.shakePermissionAsked === "boolean" ? r.shakePermissionAsked : false,
    companions: Array.isArray(r.companions) && r.companions.length > 0 ? r.companions : DEFAULT_SETTINGS.companions,
  };
}

type CompanionContextValue = {
  settings: CompanionSettings;
  hydrated: boolean;
  setEnabled: (enabled: boolean) => void;
  renameCompanion: (id: string, name: string) => void;
  addCompanion: (species: CompanionSpecies, name: string) => void;
  setMyCompanion: (id: string | null) => void;
  markShakePermissionAsked: () => void;
};

const CompanionContext = createContext<CompanionContextValue | null>(null);

export function CompanionProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CompanionSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSettings(mergeWithDefaults(JSON.parse(raw)));
      }
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, hydrated]);

  function setEnabled(enabled: boolean) {
    setSettings((prev) => ({ ...prev, enabled }));
  }

  function renameCompanion(id: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSettings((prev) => ({
      ...prev,
      companions: prev.companions.map((c) => (c.id === id ? { ...c, name: trimmed } : c)),
    }));
  }

  function addCompanion(species: CompanionSpecies, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSettings((prev) => {
      if (prev.companions.length >= MAX_COMPANIONS) return prev;
      const newCompanion: Companion = {
        id: crypto.randomUUID(),
        species,
        name: trimmed,
        createdAt: Date.now(),
      };
      return { ...prev, companions: [...prev.companions, newCompanion] };
    });
  }

  function setMyCompanion(id: string | null) {
    setSettings((prev) => ({ ...prev, myCompanionId: id }));
  }

  function markShakePermissionAsked() {
    setSettings((prev) => ({ ...prev, shakePermissionAsked: true }));
  }

  return (
    <CompanionContext.Provider
      value={{ settings, hydrated, setEnabled, renameCompanion, addCompanion, setMyCompanion, markShakePermissionAsked }}
    >
      {children}
    </CompanionContext.Provider>
  );
}

export function useCompanions() {
  const ctx = useContext(CompanionContext);
  if (!ctx) throw new Error("useCompanions must be used within CompanionProvider");
  return ctx;
}
