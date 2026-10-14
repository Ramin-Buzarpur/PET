import { prisma } from "@/lib/prisma";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">پیام‌های تماس</h1>
      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-medium">{m.subject}</span>
              <span className="text-xs text-muted-foreground">
                {m.createdAt.toLocaleDateString("fa-IR")}
              </span>
            </div>
            <div className="mb-2 text-sm text-muted-foreground">
              {m.name} · {m.email}
            </div>
            <p className="text-sm leading-6">{m.message}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">هنوز پیامی ثبت نشده است.</p>
        )}
      </div>
    </div>
  );
}
