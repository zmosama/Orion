import { auth } from "@/auth";
import type { Session } from "next-auth";

/** يرجّع الـ session لو المستخدم أدمن، وإلا null — استخدمها في كل صفحات وAPIs الأدمن */
export async function getAdminSession(): Promise<Session | null> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}
