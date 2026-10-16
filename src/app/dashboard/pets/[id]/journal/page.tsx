import Link from "next/link";
import { JournalApp } from "@/components/pets/JournalApp";

export default async function PetJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/dashboard/pets/${id}`} className="mb-4 inline-block text-sm text-muted-foreground hover:text-primary">
        ← بازگشت به کارت
      </Link>
      <h1 className="mb-6 text-2xl font-extrabold">دفتر پیشرفت خصوصی 📓</h1>
      <JournalApp petId={id} />
    </div>
  );
}
