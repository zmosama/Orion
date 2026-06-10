import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
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

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const slugTaken = await prisma.category.findFirst({
    where: { slug: parsed.data.slug, id: { not: id } },
  });
  if (slugTaken) return NextResponse.json({ error: "SLUG_EXISTS" }, { status: 409 });

  // منع الدواير في الشجرة: الأب الجديد ميكونش الفئة نفسها ولا واحد من أحفادها
  const newParentId = parsed.data.parentId || null;
  if (newParentId) {
    if (newParentId === id) return NextResponse.json({ error: "CYCLE" }, { status: 400 });
    const all = await prisma.category.findMany({ select: { id: true, parentId: true } });
    let cursor: string | null = newParentId;
    const seen = new Set<string>();
    while (cursor) {
      if (cursor === id) return NextResponse.json({ error: "CYCLE" }, { status: 400 });
      if (seen.has(cursor)) break;
      seen.add(cursor);
      cursor = all.find((c) => c.id === cursor)?.parentId ?? null;
    }
  }

  try {
    await prisma.category.update({
      where: { id },
      data: {
        slug: parsed.data.slug,
        nameEn: parsed.data.nameEn,
        nameAr: parsed.data.nameAr,
        image: parsed.data.image || null,
        parentId: newParentId,
      },
    });
  } catch {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { id } = await params;

  const [childCount, productCount] = await Promise.all([
    prisma.category.count({ where: { parentId: id } }),
    prisma.product.count({ where: { categoryId: id } }),
  ]);
  if (childCount > 0) return NextResponse.json({ error: "HAS_CHILDREN" }, { status: 409 });
  if (productCount > 0) return NextResponse.json({ error: "HAS_PRODUCTS" }, { status: 409 });

  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
