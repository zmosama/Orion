import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/ratelimit";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.email().max(200),
  password: z.string().min(8).max(100),
  phone: z.string().max(20).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  if (!rateLimit(`register:${clientIp(req)}`, 5, 60_000)) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "EMAIL_EXISTS" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      passwordHash,
      phone: parsed.data.phone || null,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
