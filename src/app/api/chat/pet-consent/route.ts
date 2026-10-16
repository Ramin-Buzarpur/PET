import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { petChatSummaryFields } from "@/lib/pet-chat-context";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const petId = new URL(request.url).searchParams.get("petId");
  if (!petId) return NextResponse.json({ error: "پت مشخص نشده" }, { status: 400 });

  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet || pet.userId !== session.user.id) {
    return NextResponse.json({ error: "پت یافت نشد" }, { status: 404 });
  }

  const consent = await prisma.chatPetConsent.findUnique({
    where: { userId_petId: { userId: session.user.id, petId } },
  });

  const needsConfirmation =
    !consent ||
    consent.consentedAt < pet.updatedAt ||
    Date.now() - consent.consentedAt.getTime() > SEVEN_DAYS_MS;

  return NextResponse.json({
    hasConsent: !!consent,
    needsConfirmation,
    summary: petChatSummaryFields(pet),
  });
}

const schema = z.object({ petId: z.string() });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });

  const pet = await prisma.pet.findUnique({ where: { id: parsed.data.petId } });
  if (!pet || pet.userId !== session.user.id) {
    return NextResponse.json({ error: "پت یافت نشد" }, { status: 404 });
  }

  const consent = await prisma.chatPetConsent.upsert({
    where: { userId_petId: { userId: session.user.id, petId: pet.id } },
    create: { userId: session.user.id, petId: pet.id },
    update: { consentedAt: new Date() },
  });

  return NextResponse.json({ consent });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const petId = new URL(request.url).searchParams.get("petId");
  if (!petId) return NextResponse.json({ error: "پت مشخص نشده" }, { status: 400 });

  await prisma.chatPetConsent.deleteMany({ where: { userId: session.user.id, petId } });
  return NextResponse.json({ success: true });
}
