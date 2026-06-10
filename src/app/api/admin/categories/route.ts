import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const categorySchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  nameEn: z.string().min(1).max(100),
  nameAr: z.string().min(1).max(100),
  image: z.url().optional().or(z.literal("")),
  parentId: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const existing = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "SLUG_EXISTS" }, { status: 409 });

  if (parsed.data.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parsed.data.parentId } });
    if (!parent) return NextResponse.json({ error: "PARENT_NOT_FOUND" }, { status: 400 });
  }

  await prisma.category.create({
    data: {
      slug: parsed.data.slug,
      nameEn: parsed.data.nameEn,
      nameAr: parsed.data.nameAr,
      image: parsed.data.image || null,
      parentId: parsed.data.parentId || null,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
