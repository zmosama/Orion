import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { adminUpdateOrderStatus } from "@/lib/stock";
import { OrderStatus } from "@/lib/constants";

const schema = z.object({
  status: z.enum([
    OrderStatus.PENDING_PAYMENT,
    OrderStatus.CONFIRMED,
    OrderStatus.PAID,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const ok = await adminUpdateOrderStatus(id, parsed.data.status);
  if (!ok) return NextResponse.json({ error: "INVALID_TRANSITION" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
