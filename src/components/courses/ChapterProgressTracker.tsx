"use client";

import { useEffect } from "react";

export function ChapterProgressTracker({
  packageId,
  progress,
}: {
  packageId: string;
  progress: number;
}) {
  useEffect(() => {
    fetch("/api/enrollment/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId, progress }),
    }).catch(() => {});
  }, [packageId, progress]);

  return null;
}
