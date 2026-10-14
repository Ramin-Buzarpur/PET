import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";

const schema = z.object({
  size: z.string().optional(),
  color: z.string().optional(),
  packageWeight: z.string().optional(),
  price: z.number().int().positive(),
  stock: z.number().int().min(0),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });

  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });
  }

  const variant = await prisma.productVariant.create({ data: { ...parsed.data, productId: id } });
  return NextResponse.json({ variant });
}
