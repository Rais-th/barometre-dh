import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });

  return (
    <article className="animate-fade-in">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
          {t("title")}
        </h1>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold text-neutral-900">
            {t("missionTitle")}
          </h2>
        </div>
        <div className="md:col-span-3">
          <p className="text-base leading-relaxed text-neutral-700">
            {t("missionBody")}
          </p>
        </div>
      </section>

      <section className="mt-12 rounded-2xl bg-gradient-to-br from-brand-800 to-brand-600 p-8 text-white">
        <h2 className="text-xl font-semibold">{t("founderTitle")}</h2>
        <blockquote className="mt-4 border-l-4 border-white/40 pl-5 text-base italic leading-relaxed text-white/95">
          {t("founderQuote")}
        </blockquote>
        <p className="mt-4 text-sm text-white/85">
          {t("founderAttribution")}
        </p>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold text-neutral-900">
            {t("partnersTitle")}
          </h2>
        </div>
        <div className="md:col-span-3">
          <p className="text-base leading-relaxed text-neutral-700">
            {t("partnersBody")}
          </p>
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold text-neutral-900">
            {t("teamTitle")}
          </h2>
        </div>
        <div className="md:col-span-3">
          <p className="text-base leading-relaxed text-neutral-700">
            {t("teamBody")}
          </p>
        </div>
      </section>

      <section className="mt-12 rounded-2xl bg-white p-6 ring-1 ring-sand-200">
        <h2 className="text-xl font-semibold text-neutral-900">
          {t("contactTitle")}
        </h2>
        <p className="mt-2 text-base text-neutral-700">
          <a
            href={`mailto:${t("contactEmail")}`}
            className="text-brand-700 underline decoration-brand-300 underline-offset-4 hover:text-brand-800"
          >
            {t("contactEmail")}
          </a>
        </p>
      </section>
    </article>
  );
}
