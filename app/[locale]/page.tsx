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
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-6 py-12 text-white shadow-sm sm:px-10 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-sand-300/20 blur-3xl"
        />
        <div className="relative max-w-3xl">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/90 sm:text-lg">
            {t("heroLead")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signaler"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-800 shadow-sm transition hover:bg-sand-50"
            >
              {t("ctaReport")}
            </Link>
            <Link
              href="/ressources"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              {t("ctaResources")}
            </Link>
          </div>
        </div>
      </section>

      {/* What */}
      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {t("whatTitle")}
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <Card title={t("whatDomestic")} body={t("whatDomesticDesc")} accent="bg-brand-100 text-brand-800" />
          <Card title={t("whatGBV")} body={t("whatGBVDesc")} accent="bg-sand-200 text-sand-800" />
          <Card
            title={t("whatElectoral")}
            body={t("whatElectoralDesc")}
            accent="bg-neutral-900 text-neutral-50"
          />
        </div>
      </section>

      {/* How */}
      <section className="mt-14 rounded-2xl bg-white p-8 ring-1 ring-sand-200">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {t("howTitle")}
        </h2>
        <ol className="mt-6 grid gap-5 sm:grid-cols-3">
          <Step n={1} body={t("how1")} />
          <Step n={2} body={t("how2")} />
          <Step n={3} body={t("how3")} />
        </ol>
      </section>

      {/* Who */}
      <section className="mt-14 grid gap-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {t("whoTitle")}
          </h2>
        </div>
        <div className="md:col-span-3">
          <p className="text-base leading-relaxed text-neutral-700">{t("whoBody")}</p>
        </div>
      </section>

      {/* Trust */}
      <section className="mt-14 rounded-2xl bg-neutral-900 p-8 text-neutral-100">
        <h2 className="text-xl font-semibold tracking-tight">{t("trustTitle")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-300">{t("trustBody")}</p>
        <div className="mt-6">
          <Link
            href="/signaler"
            className="inline-flex items-center justify-center rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-400"
          >
            {t("ctaReport")}
          </Link>
        </div>
      </section>
    </div>
  );
}

function Card({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <article className="rounded-2xl bg-white p-6 ring-1 ring-sand-200 transition hover:ring-brand-300">
      <span className={"inline-block rounded-full px-3 py-1 text-xs font-medium " + accent}>
        {title}
      </span>
      <p className="mt-4 text-sm leading-relaxed text-neutral-700">{body}</p>
    </article>
  );
}

function Step({ n, body }: { n: number; body: string }) {
  return (
    <li className="flex gap-4">
      <span
        aria-hidden
        className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white"
      >
        {n}
      </span>
      <p className="text-sm leading-relaxed text-neutral-700">{body}</p>
    </li>
  );
}
