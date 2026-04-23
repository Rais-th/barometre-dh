import { getLocale, getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "footer" });
  const tSite = await getTranslations({ locale, namespace: "site" });
  const tDisc = await getTranslations({ locale, namespace: "disclaimer" });

  return (
    <footer className="mt-16 border-t border-sand-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-xs leading-relaxed text-neutral-600">
          {tDisc("emergency")}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-neutral-600">
          {tDisc("privacy")}
        </p>
        <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-sand-200 pt-6 text-sm text-neutral-600 sm:flex-row sm:items-center">
          <p>
            <span className="font-medium text-neutral-800">{tSite("name")}</span>
            <span className="mx-2 text-neutral-400">·</span>
            <span>{tSite("partnerLine")}</span>
          </p>
          <p className="flex items-center gap-4">
            <a
              href="https://github.com/Rais-th/barometre-dh"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-brand-400 underline-offset-4 hover:text-neutral-900"
            >
              {t("sourceCode")}
            </a>
            <span className="text-neutral-500">{t("rights")}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
