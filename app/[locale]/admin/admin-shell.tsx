"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function AdminShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: "queue" | "partners";
}) {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();

  const tabs: Array<{ key: "queue" | "partners"; href: string; label: string }> = [
    { key: "queue", href: "/admin/cases", label: t("queue") },
    { key: "partners", href: "/admin/partners", label: t("partners") },
  ];

  return (
    <div className="animate-fade-in">
      <nav
        aria-label="Admin"
        className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-sand-200 pb-4"
      >
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const isActive = active === tab.key || pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.key}
                href={tab.href as any}
                className={
                  "rounded-full px-4 py-2 text-sm font-medium " +
                  (isActive
                    ? "bg-brand-600 text-white"
                    : "bg-white text-neutral-700 ring-1 ring-sand-200 hover:bg-sand-50")
                }
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-full px-4 py-2 text-sm font-medium text-neutral-700 ring-1 ring-sand-200 hover:bg-sand-50"
        >
          {t("logout")}
        </button>
      </nav>
      {children}
    </div>
  );
}
