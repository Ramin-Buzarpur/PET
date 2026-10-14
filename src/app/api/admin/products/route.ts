import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";

const variantSchema = z.object({
  size: z.string().optional(),
  color: z.string().optional(),
  packageWeight: z.string().optional(),
  price: z.number().int().positive(),
  stock: z.number().int().min(0),
});

const productSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(2),
  images: z.array(z.string()).min(1),
  brandId: z.string().optional(),
  ageGroup: z.enum(["BABY", "ADULT", "SENIOR"]).optional(),
  dogSize: z.enum(["SMALL", "MEDIUM", "LARGE"]).optional(),
  waterType: z.enum(["FRESH", "SALT"]).optional(),
  animalSubtype: z.string().optional(),
  productType: z.string().optional(),
  categoryIds: z.array(z.string()).min(1, "حداقل یک دسته انتخاب کنید"),
  variants: z.array(variantSchema).min(1, "حداقل یک تنوع لازم است"),
});

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });

  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است" },
      { status: 400 }
    );
  }

  const { categoryIds, variants, brandId, ...rest } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...rest,
      brandId: brandId || undefined,
      categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
      variants: { create: variants },
    },
  });

  return NextResponse.json({ product });
}
