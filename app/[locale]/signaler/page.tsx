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
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-700">
          {t("lead")}
        </p>
      </header>

      <IntakeForm provinces={provinces} locale={locale as Locale} />
    </section>
  );
}
