import { NextResponse } from "next/server";
import { releaseExpiredReservations } from "@/lib/stock";

export const dynamic = "force-dynamic";

/**
 * تحرير حجوزات الطلبات اللي عدّت مهلة دفعها (إرجاع الستوك + status = EXPIRED).
 * ينادى دورياً من Cloudflare Workers Cron أو أي scheduler خارجي:
 *   GET /api/cron/release-stock?key=CRON_SECRET
 */
export async function GET(req: Request) {
  // fail-closed: لو السر مش متظبط في البيئة، المسار يرفض بدل ما يفضل مفتوح
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET_NOT_CONFIGURED" }, { status: 500 });
  }

  const url = new URL(req.url);
  const provided = req.headers.get("x-cron-secret") ?? url.searchParams.get("key");
  if (provided !== secret) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const released = await releaseExpiredReservations();
  return NextResponse.json({ released });
}
