import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <div className="animate-fade-in">
      {/* Hero — deep navy, radial glow, dot grid, aurora. */}
      <section className="surface-navy relative overflow-hidden rounded-2xl px-6 py-16 text-white sm:px-12 sm:py-20">
        <div className="aurora" aria-hidden />
        <div className="relative grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-8">
            <p className="font-mono-tight inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-brand-300">
              <span className="pulse-dot" aria-hidden />
              RDC · 2026
            </p>
            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.04] tracking-tightest sm:text-5xl lg:text-[58px]">
              <span className="text-sheen">{t("heroTitle")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-[16px] leading-[1.7] text-white/75 sm:text-[17px]">
              {t("heroLead")}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signaler"
                className="group inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-[14px] font-semibold text-ink-900 shadow-[0_1px_0_0_rgba(255,255,255,0.4)_inset,0_12px_24px_-12px_rgba(0,0,0,0.4)] transition-all hover:bg-brand-200 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.6)_inset,0_16px_32px_-14px_rgba(138,199,249,0.5)]"
              >
                {t("ctaReport")}
                <svg
                  className="ml-1.5 transition-transform group-hover:translate-x-0.5"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/ressources"
                className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/[0.03] px-6 py-3 text-[14px] font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/[0.07]"
              >
                {t("ctaResources")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What — flat cards with subtle top hairline. */}
      <section className="mt-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-ink-500">
              01
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
              {t("whatTitle")}
            </h2>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <TopicCard index="A" title={t("whatDomestic")} body={t("whatDomesticDesc")} />
          <TopicCard index="B" title={t("whatGBV")} body={t("whatGBVDesc")} />
          <TopicCard index="C" title={t("whatElectoral")} body={t("whatElectoralDesc")} />
        </div>
      </section>

      {/* How — numbered steps. */}
      <section className="mt-20">
        <div>
          <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-ink-500">
            02
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
            {t("howTitle")}
          </h2>
        </div>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-8">
          <Step n={1} body={t("how1")} />
          <Step n={2} body={t("how2")} />
          <Step n={3} body={t("how3")} />
        </ol>
      </section>

      {/* Who — editorial two-column. */}
      <section className="mt-20 grid gap-10 border-t border-ink-200 pt-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-ink-500">
            03
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
            {t("whoTitle")}
          </h2>
        </div>
        <div className="md:col-span-8">
          <p className="text-[16px] leading-[1.8] text-ink-700">{t("whoBody")}</p>
        </div>
      </section>

      {/* Trust — same shimmer surface. */}
      <section className="surface-navy relative mt-20 overflow-hidden rounded-2xl px-8 py-12 text-ink-100 sm:px-12 sm:py-14">
        <div className="relative grid gap-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7">
            <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-brand-300">
              {t("trustTitle")}
            </p>
            <p className="mt-4 text-[17px] leading-[1.7] text-white/90 sm:text-lg">
              {t("trustBody")}
            </p>
          </div>
          <div className="md:col-span-5 md:flex md:items-end md:justify-end">
            <Link
              href="/signaler"
              className="group inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-[14px] font-semibold text-ink-900 shadow-[0_1px_0_0_rgba(255,255,255,0.4)_inset,0_12px_24px_-12px_rgba(0,0,0,0.35)] transition-all hover:bg-brand-200"
            >
              {t("ctaReport")}
              <svg
                className="ml-1.5 transition-transform group-hover:translate-x-0.5"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function TopicCard({
  index,
  title,
  body,
}: {
  index: string;
  title: string;
  body: string;
}) {
  return (
    <article className="hairline-top group relative overflow-hidden rounded-xl border border-ink-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[0_16px_32px_-16px_rgba(24,74,131,0.18)]">
      <span className="font-mono-tight inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-100 text-[11px] font-medium text-brand-900">
        {index}
      </span>
      <h3 className="mt-5 text-[17px] font-semibold tracking-tight text-ink-900">
        {title}
      </h3>
      <p className="mt-2 text-[14px] leading-[1.65] text-ink-600">{body}</p>
    </article>
  );
}

function Step({ n, body }: { n: number; body: string }) {
  return (
    <li className="relative border-t border-ink-200 pt-5">
      <span
        aria-hidden
        className="absolute -top-px left-0 block h-0.5 w-10 bg-gradient-to-r from-brand-700 to-brand-400"
      />
      <span className="font-mono-tight tnum text-[13px] font-medium text-brand-800">
        {String(n).padStart(2, "0")}
      </span>
      <p className="mt-3 text-[15px] leading-[1.65] text-ink-800">{body}</p>
    </li>
  );
}
