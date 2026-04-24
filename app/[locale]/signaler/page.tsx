import { getTranslations, setRequestLocale } from "next-intl/server";
import { PROVINCES } from "@/lib/provinces";
import { IntakeForm } from "./intake-form";
import type { Locale } from "@/i18n/routing";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "report" });

  const provinces = PROVINCES.map((p) => ({
    code: p.code,
    name: locale === "sw" ? p.nameSw : p.nameFr,
  })).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section className="animate-fade-in">
      <header className="max-w-2xl">
        <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-brand-800">
          Formulaire confidentiel · 8 étapes
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-tightest text-ink-900 sm:text-[40px]">
          {t("title")}
        </h1>
        <p className="mt-3 text-[15px] leading-[1.65] text-ink-600">{t("lead")}</p>
      </header>

      <IntakeForm provinces={provinces} locale={locale as Locale} />
    </section>
  );
}
