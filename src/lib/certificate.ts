"use client";

import { toPng } from "html-to-image";
import { PDFDocument } from "pdf-lib";

/**
 * تبدیل یک عنصر DOM (طرح گواهی) به یک فایل PDF تک‌صفحه‌ای، کاملاً سمت کاربر.
 * چون گواهی شامل متن فارسی است، به‌جای نوشتن متن داخل PDF (که فونت‌های
 * استاندارد pdf-lib از آن پشتیبانی نمی‌کنند)، همان طرح که مرورگر به‌درستی
 * رندر کرده را به عکس تبدیل و داخل یک PDF تک‌صفحه جای می‌دهیم.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

export async function elementToPdfBytes(element: HTMLElement): Promise<Uint8Array> {
  const dataUrl = await withTimeout(toPng(element, { pixelRatio: 2, cacheBust: true, skipFonts: true }), 15000);
  const pngBytes = await fetch(dataUrl).then((r) => r.arrayBuffer());

  const doc = await PDFDocument.create();
  const image = await doc.embedPng(pngBytes);
  const page = doc.addPage([image.width, image.height]);
  page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });

  return doc.save();
}

export function downloadBytesAsFile(bytes: Uint8Array, filename: string, mime: string) {
  const blob = new Blob([new Uint8Array(bytes)], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
