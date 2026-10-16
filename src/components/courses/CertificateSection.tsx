"use client";

import { useEffect, useRef, useState } from "react";
import { elementToPdfBytes, downloadBytesAsFile } from "@/lib/certificate";

type Certificate = { id: string; participantName: string; serialNumber: string; issuedAt: string; petNameOnCert: string | null };
type Pet = { id: string; name: string | null };

export function CertificateSection({
  enrollmentId,
  courseTitle,
  pets,
}: {
  enrollmentId: string;
  courseTitle: string;
  pets: Pet[];
}) {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [petId, setPetId] = useState("");
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/certificates/${enrollmentId}`)
      .then((r) => r.json())
      .then((d) => setCertificate(d.certificate ?? null));
  }, [enrollmentId]);

  async function handlePetChange(id: string) {
    setPetId(id);
    const res = await fetch(`/api/certificates/${enrollmentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petId: id || undefined }),
    });
    const data = await res.json();
    setCertificate(data.certificate);
  }

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const bytes = await elementToPdfBytes(cardRef.current);
      downloadBytesAsFile(bytes, "petland-certificate.pdf", "application/pdf");
    } finally {
      setDownloading(false);
    }
  }

  if (!certificate) return null;

  return (
    <div className="mb-8 rounded-2xl border border-primary/30 bg-primary-soft p-5">
      <h2 className="mb-3 font-bold text-primary">🎉 یادگاری پایان دوره آماده است!</h2>

      <div
        ref={cardRef}
        className="mb-4 rounded-3xl border-2 border-primary/40 bg-surface p-8 text-center"
        style={{ backgroundColor: "#fffdf9" }}
      >
        <div className="mb-2 text-sm font-bold text-primary">🐾 پت‌لند</div>
        <div className="mb-1 text-xs text-muted-foreground">یادگاری پایان دوره</div>
        <div className="mb-3 text-2xl font-extrabold">{certificate.participantName}</div>
        <div className="mb-1 text-sm text-muted-foreground">با موفقیت دوره زیر را به پایان رساند</div>
        <div className="mb-4 text-lg font-bold text-accent">{courseTitle}</div>
        {certificate.petNameOnCert && (
          <div className="mb-3 text-sm text-muted-foreground">
            ممنون که این‌قدر به فکر {certificate.petNameOnCert} هستی 🐾
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          {new Date(certificate.issuedAt).toLocaleDateString("fa-IR")} · شماره {certificate.serialNumber.slice(-8).toUpperCase()}
        </div>
      </div>

      {pets.length > 0 && (
        <select
          value={petId}
          onChange={(e) => handlePetChange(e.target.value)}
          className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">بدون نام پت روی گواهی</option>
          {pets.map((p) => (
            <option key={p.id} value={p.id}>
              افزودن نام {p.name || "فرزند عزیزت"}
            </option>
          ))}
        </select>
      )}

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {downloading ? "در حال آماده‌سازی..." : "دانلود گواهی (PDF)"}
      </button>
    </div>
  );
}
