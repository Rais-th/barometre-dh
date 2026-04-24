"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";
import { routing } from "@/i18n/routing";

export function LanguageToggle() {
  const t = useTranslations("language");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const [pending, startTransition] = useTransition();

  const switchTo = (next: string) => {
    startTransition(() => {
      // @ts-expect-error typed-routing dynamic params
      router.replace({ pathname, params }, { locale: next });
    });
  };

  return (
    <div
      className="inline-flex overflow-hidden rounded-md border border-ink-200 bg-white text-[11px] tnum"
      role="group"
      aria-label={t("switch")}
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          disabled={pending || loc === locale}
          onClick={() => switchTo(loc)}
          className={
            "px-2.5 py-1.5 font-semibold uppercase tracking-wider transition-colors " +
            (loc === locale
              ? "bg-brand-950 text-white"
              : "text-ink-600 hover:bg-ink-100 hover:text-ink-900")
          }
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
