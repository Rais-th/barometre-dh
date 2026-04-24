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
      <header className="max-w-3xl">
        <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-brand-800">
          Baromètre DH
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-[1.1] tracking-tightest text-ink-900 sm:text-5xl">
          {t("title")}
        </h1>
      </header>

      <TwoCol
        eyebrow="01"
        title={t("missionTitle")}
        body={t("missionBody")}
      />

      {/* Founder quote — shimmer surface, dignified. */}
      <section className="surface-navy relative mt-16 overflow-hidden rounded-2xl px-8 py-12 text-white sm:px-12 sm:py-14">
        <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-brand-300">
          {t("founderTitle")}
        </p>
        <blockquote className="mt-5 max-w-3xl text-[20px] leading-[1.55] tracking-tight text-white/95 sm:text-[24px]">
          <span className="text-brand-400">«</span> {t("founderQuote")}{" "}
          <span className="text-brand-400">»</span>
        </blockquote>
        <p className="mt-4 text-[13px] font-medium text-white/70">
          — {t("founderAttribution")}
        </p>
      </section>

      <TwoCol
        eyebrow="02"
        title={t("partnersTitle")}
        body={t("partnersBody")}
      />

      <TwoCol
        eyebrow="03"
        title={t("teamTitle")}
        body={t("teamBody")}
      />

      <section className="mt-16 rounded-xl border border-ink-200 bg-white p-6">
        <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-ink-500">
          {t("contactTitle")}
        </p>
        <p className="mt-3">
          <a
            href={`mailto:${t("contactEmail")}`}
            className="text-[18px] font-semibold tracking-tight text-brand-800 underline decoration-brand-300 decoration-2 underline-offset-4 hover:text-brand-900"
          >
            {t("contactEmail")}
          </a>
        </p>
      </section>
    </article>
  );
}

function TwoCol({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <section className="mt-16 grid gap-8 border-t border-ink-200 pt-12 md:grid-cols-12 md:gap-10">
      <div className="md:col-span-4">
        <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-ink-500">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900 sm:text-[28px]">
          {title}
        </h2>
      </div>
      <div className="md:col-span-8">
        <p className="text-[16px] leading-[1.8] text-ink-700">{body}</p>
      </div>
    </section>
  );
}
