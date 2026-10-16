import { PetForm } from "@/components/pets/PetForm";

export default function NewPetPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-extrabold">ساخت کارت عضویت پت 🐾</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        کارت عضویت می‌سازیم؛ هر وقت دوست داشتی می‌تونی جزئیاتش رو کامل کنی.
      </p>
      <PetForm />
    </div>
  );
}
