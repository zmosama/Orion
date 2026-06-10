import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// استخدم دول في كل الصفحات والمكونات بدل next/link و next/navigation
// عشان الـ locale الحالي يتحافظ عليه في التنقل
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
