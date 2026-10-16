import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";

const schema = z.object({ status: z.enum(["DISMISSED", "ACTED"]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });

  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });
  }

  const report = await prisma.storyReport.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  if (parsed.data.status === "ACTED") {
    await prisma.petStory.update({
      where: { id: report.storyId },
      data: { status: "HIDDEN" },
    });
  }

  return NextResponse.json({ report });
}
