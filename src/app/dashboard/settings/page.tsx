import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/account/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-extrabold">تنظیمات حساب ⚙️</h1>
      <SettingsForm
        initialPhone={user?.phone ?? ""}
        initialFriendly={user?.friendlySmsOptIn ?? false}
        initialMarketing={user?.marketingSmsOptIn ?? false}
      />
    </div>
  );
}
