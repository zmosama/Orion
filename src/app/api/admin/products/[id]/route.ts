import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { productSchema, syncVariants, toProductData } from "@/lib/admin-products";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const slugTaken = await prisma.product.findFirst({
    where: { slug: parsed.data.slug, id: { not: id } },
  });
  if (slugTaken) return NextResponse.json({ error: "SLUG_EXISTS" }, { status: 409 });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data: toProductData(parsed.data) });
      await syncVariants(tx, id, parsed.data.variants);
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

  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    // غالباً foreign key: المنتج له OrderItems — الحذف ممنوع للحفاظ على تاريخ الطلبات
    return NextResponse.json({ error: "HAS_ORDERS" }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
