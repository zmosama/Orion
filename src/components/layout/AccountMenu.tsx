"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function AccountMenu() {
  const { data: session, status } = useSession();
  const t = useTranslations("header");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded border border-transparent px-2 py-1 text-start text-xs leading-tight hover:border-white"
      >
        <span className="block max-w-28 truncate text-gray-300">
          {status === "authenticated" && firstName
            ? t("hello", { name: firstName })
            : t("helloGuest")}
        </span>
        <span className="flex items-center gap-0.5 text-sm font-bold">
          {t("accountAndLists")}
          <ChevronDown className="h-3 w-3" />
        </span>
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-1 w-60 rounded-md border border-gray-200 bg-white p-4 text-gray-900 shadow-xl">
          {status === "authenticated" ? (
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="block hover:text-orion-accent-dark hover:underline"
                >
                  {t("yourAccount")}
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  onClick={() => setOpen(false)}
                  className="block hover:text-orion-accent-dark hover:underline"
                >
                  {t("yourOrders")}
                </Link>
              </li>
              <li className="border-t border-gray-200 pt-2">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-gray-600 hover:text-orion-accent-dark hover:underline"
                >
                  {t("signOut")}
                </button>
              </li>
            </ul>
          ) : (
            <div className="text-center">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block w-full rounded-full bg-orion-accent px-4 py-1.5 text-sm font-bold text-orion-dark transition-colors hover:bg-orion-accent-dark"
              >
                {t("signIn")}
              </Link>
              <p className="mt-2 text-xs text-gray-600">
                {t("newCustomer")}{" "}
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="text-orion-link hover:underline"
                >
                  {t("startHere")}
                </Link>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
