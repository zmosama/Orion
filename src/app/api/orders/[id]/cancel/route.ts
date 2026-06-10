import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { cancelOrder } from "@/lib/stock";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await params;

  // الإلغاء مشروط بالملكية والحالة، والـ restock ذرّي ومحمي من التكرار (في lib/stock)
  const ok = await cancelOrder(id, session.user.id);
  if (!ok) {
    return NextResponse.json({ error: "NOT_CANCELLABLE" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
