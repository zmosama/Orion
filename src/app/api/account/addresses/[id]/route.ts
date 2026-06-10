import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await params;

  // deleteMany بشرط الملكية — مفيش حذف لعناوين مستخدم تاني
  const res = await prisma.address.deleteMany({ where: { id, userId: session.user.id } });
  if (res.count === 0) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await params;

  const body = (await req.json().catch(() => null)) as { isDefault?: boolean } | null;
  if (body?.isDefault !== true) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const owned = await prisma.address.findFirst({ where: { id, userId } });
  if (!owned) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ]);

  return NextResponse.json({ ok: true });
}
