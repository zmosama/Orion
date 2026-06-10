import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { productSchema, toProductData } from "@/lib/admin-products";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const existing = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "SLUG_EXISTS" }, { status: 409 });

  const product = await prisma.product.create({ data: toProductData(parsed.data) });
  return NextResponse.json({ ok: true, id: product.id }, { status: 201 });
}
