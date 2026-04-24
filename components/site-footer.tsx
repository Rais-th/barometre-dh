import { getLocale, getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "footer" });
  const tSite = await getTranslations({ locale, namespace: "site" });
  const tDisc = await getTranslations({ locale, namespace: "disclaimer" });

  return (
    <footer className="mt-24 border-t border-ink-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-8 md:grid-cols-[2fr_3fr]">
          <div>
            <p className="text-sm font-semibold tracking-tight text-ink-900">
              {tSite("name")}
            </p>
            <p className="mt-1 text-xs text-ink-500">{tSite("partnerLine")}</p>
          </div>
          <div className="space-y-3 text-[13px] leading-relaxed text-ink-600">
            <p>{tDisc("emergency")}</p>
            <p>{tDisc("privacy")}</p>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-ink-200 pt-6 text-[12px] text-ink-500 sm:flex-row sm:items-center">
          <p>{t("rights")}</p>
          <a
            href="https://github.com/Rais-th/barometre-dh"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink-700 underline decoration-brand-300 decoration-2 underline-offset-4 hover:text-brand-800"
          >
            {t("sourceCode")}
          </a>
        </div>
      </div>
    </footer>
  );
}
