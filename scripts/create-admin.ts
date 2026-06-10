/**
 * إنشاء/تحديث مستخدم أدمن:
 *   npx tsx scripts/create-admin.ts <email> <password> [name]
 * لو الإيميل موجود بيترقّى لأدمن وتتغير كلمة السر.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [, , email, password, name = "Orion Admin"] = process.argv;

if (!email || !password || password.length < 8) {
  console.error("Usage: npx tsx scripts/create-admin.ts <email> <password(8+)> [name]");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase().trim() },
    update: { role: "admin", passwordHash },
    create: { email: email.toLowerCase().trim(), name, role: "admin", passwordHash },
  });
  console.log(`✅ Admin ready: ${user.email} (id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
