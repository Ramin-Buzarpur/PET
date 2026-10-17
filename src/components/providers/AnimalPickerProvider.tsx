"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type AnimalPickerValue = {
  selectedSlug: string | null;
  selectedName: string | null;
  select: (slug: string, name: string) => void;
};

const AnimalPickerContext = createContext<AnimalPickerValue | null>(null);
const STORAGE_KEY = "pet-shop-animal";

export function AnimalPickerProvider({ children }: { children: ReactNode }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { slug: string; name: string };
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedSlug(parsed.slug);
        setSelectedName(parsed.name);
      }
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (selectedSlug && selectedName) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ slug: selectedSlug, name: selectedName }));
    }
  }, [selectedSlug, selectedName, hydrated]);

  function select(slug: string, name: string) {
    setSelectedSlug(slug);
    setSelectedName(name);
  }

  return (
    <AnimalPickerContext.Provider value={{ selectedSlug, selectedName, select }}>
      {children}
    </AnimalPickerContext.Provider>
  );
}

export function useAnimalPicker() {
  const ctx = useContext(AnimalPickerContext);
  if (!ctx) throw new Error("useAnimalPicker must be used within AnimalPickerProvider");
  return ctx;
}
