import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GOVERNORATES } from "@/lib/constants";

const schema = z.object({
  label: z.string().max(50).optional().or(z.literal("")),
  fullName: z.string().min(2).max(100),
  phone: z.string().min(6).max(20),
  governorate: z.string().refine((v) => GOVERNORATES.some((g) => g.value === v), {
    message: "Unknown governorate",
  }),
  city: z.string().min(2).max(100),
  line: z.string().min(5).max(300),
  isDefault: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const count = await prisma.address.count({ where: { userId } });
  // أول عنوان بيبقى الافتراضي تلقائياً
  const makeDefault = parsed.data.isDefault === true || count === 0;

  await prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    await tx.address.create({
      data: {
        userId,
        label: parsed.data.label || null,
        fullName: parsed.data.fullName.trim(),
        phone: parsed.data.phone.trim(),
        governorate: parsed.data.governorate,
        city: parsed.data.city.trim(),
        line: parsed.data.line.trim(),
        isDefault: makeDefault,
      },
    });
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
