import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getOwnedEnrollment(enrollmentId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { coursePackage: true, certificate: true },
  });
  if (!enrollment || enrollment.userId !== userId) return null;
  return enrollment;
}

export async function GET(_request: Request, { params }: { params: Promise<{ enrollmentId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const { enrollmentId } = await params;
  const enrollment = await getOwnedEnrollment(enrollmentId, session.user.id);
  if (!enrollment) return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
  if (enrollment.progress < 100) {
    return NextResponse.json({ error: "دوره هنوز کامل نشده است" }, { status: 400 });
  }

  let certificate = enrollment.certificate;
  if (!certificate) {
    certificate = await prisma.certificate.create({
      data: {
        userId: session.user.id,
        enrollmentId: enrollment.id,
        participantName: session.user.name ?? "دانش‌پذیر پت‌لند",
      },
    });
  }

  return NextResponse.json({
    certificate,
    courseTitle: enrollment.coursePackage.title,
  });
}

const schema = z.object({ petId: z.string().optional() });

export async function PUT(request: Request, { params }: { params: Promise<{ enrollmentId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const { enrollmentId } = await params;
  const enrollment = await getOwnedEnrollment(enrollmentId, session.user.id);
  if (!enrollment || !enrollment.certificate) return NextResponse.json({ error: "یافت نشد" }, { status: 404 });

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });

  let petName: string | null = null;
  if (parsed.data.petId) {
    const pet = await prisma.pet.findUnique({ where: { id: parsed.data.petId } });
    if (pet && pet.userId === session.user.id) petName = pet.name ?? "فرزند عزیزت";
  }

  const certificate = await prisma.certificate.update({
    where: { id: enrollment.certificate.id },
    data: { petNameOnCert: petName },
  });

  return NextResponse.json({ certificate });
}
