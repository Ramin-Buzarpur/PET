"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SHAKE_THRESHOLD = 25;
const SHAKE_COOLDOWN_MS = 1200;

type MotionPermissionAPI = {
  requestPermission?: () => Promise<"granted" | "denied">;
};

/** تشخیص تکون‌دادن شدید گوشی؛ در iOS تا تپ کاربر هرگز خودش مجوز درخواست نمی‌کند. */
export function useShakeDetection(onShake: () => void, enabled: boolean) {
  const [permissionNeeded, setPermissionNeeded] = useState(false);
  const lastShake = useRef(0);
  const lastAccel = useRef({ x: 0, y: 0, z: 0 });
  const cleanupRef = useRef<() => void>(() => {});

  const handleMotion = useCallback(
    (e: DeviceMotionEvent) => {
      const { x = 0, y = 0, z = 0 } = e.accelerationIncludingGravity ?? {};
      const delta =
        Math.abs((x ?? 0) - lastAccel.current.x) +
        Math.abs((y ?? 0) - lastAccel.current.y) +
        Math.abs((z ?? 0) - lastAccel.current.z);
      lastAccel.current = { x: x ?? 0, y: y ?? 0, z: z ?? 0 };

      const now = Date.now();
      if (delta > SHAKE_THRESHOLD && now - lastShake.current > SHAKE_COOLDOWN_MS) {
        lastShake.current = now;
        onShake();
      }
    },
    [onShake],
  );

  const attachListener = useCallback(() => {
    window.addEventListener("devicemotion", handleMotion);
    cleanupRef.current = () => window.removeEventListener("devicemotion", handleMotion);
  }, [handleMotion]);

  const requestPermission = useCallback(async () => {
    const DM = window.DeviceMotionEvent as unknown as MotionPermissionAPI;
    if (typeof DM?.requestPermission === "function") {
      try {
        const result = await DM.requestPermission();
        if (result === "granted") {
          setPermissionNeeded(false);
          attachListener();
        }
      } catch {
        // کاربر رد کرد یا مرورگر پشتیبانی نکرد؛ کاری نمی‌کنیم
      }
    } else {
      attachListener();
    }
  }, [attachListener]);

  useEffect(() => {
    if (!enabled) return;
    const DM = window.DeviceMotionEvent as unknown as MotionPermissionAPI;
    if (typeof DM?.requestPermission === "function") {
      // تشخیص پشتیبانی iOS فقط سمت کلاینت ممکن است؛ UI باید بعد از آن به‌روزرسانی شود
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPermissionNeeded(true);
      return;
    }
    attachListener();
    return () => cleanupRef.current();
  }, [enabled, attachListener]);

  return { permissionNeeded, requestPermission };
}
