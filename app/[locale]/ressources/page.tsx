import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "resources" });

  return (
    <article className="animate-fade-in">
      <header className="max-w-3xl">
        <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-brand-800">
          Guide pratique
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-[1.1] tracking-tightest text-ink-900 sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-[16px] leading-[1.7] text-ink-700">{t("lead")}</p>
      </header>

      <div
        role="alert"
        className="mt-10 flex gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] leading-relaxed text-red-900"
      >
        <span aria-hidden className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white">
          !
        </span>
        <p>{t("reminder")}</p>
      </div>

      <section className="mt-14">
        <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-ink-500">
          01
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
          {t("emergencyTitle")}
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          <EmergencyItem label={t("police")} />
          <EmergencyItem label={t("hotline")} />
          <EmergencyItem label={t("ambulance")} />
        </ul>
      </section>

      <section className="mt-16">
        <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-ink-500">
          02
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
          {t("lawsTitle")}
        </h2>
        <div className="mt-6 space-y-3">
          <LawCard title={t("law1Title")} body={t("law1Body")} />
          <LawCard title={t("law2Title")} body={t("law2Body")} />
          <LawCard title={t("law3Title")} body={t("law3Body")} />
        </div>
      </section>

      <section className="surface-navy relative mt-16 overflow-hidden rounded-2xl px-8 py-10 text-white sm:px-10 sm:py-12">
        <div className="relative grid gap-6 md:grid-cols-12 md:items-center">
          <div className="md:col-span-8">
            <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-brand-300">
              {t("downloadTitle")}
            </p>
            <p className="mt-3 max-w-xl text-[16px] leading-[1.7] text-white/90">
              {t("downloadBody")}
            </p>
          </div>
          <div className="md:col-span-4 md:flex md:justify-end">
            <a
              href={`/guides/droits-${locale}.pdf`}
              download
              className="group inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-[14px] font-semibold text-ink-900 shadow-[0_1px_0_0_rgba(255,255,255,0.4)_inset,0_12px_24px_-12px_rgba(0,0,0,0.35)] transition-all hover:bg-brand-200"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {t("downloadCta")}
            </a>
          </div>
        </div>
      </section>
    </article>
  );
}

function EmergencyItem({ label }: { label: string }) {
  return (
    <li className="rounded-xl border border-ink-200 bg-white px-5 py-6 text-center text-[15px] font-semibold tracking-tight text-ink-900">
      {label}
    </li>
  );
}

function LawCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-xl border border-ink-200 bg-white p-5">
      <h3 className="text-[16px] font-semibold tracking-tight text-ink-900">
        {title}
      </h3>
      <p className="mt-2 text-[14px] leading-[1.7] text-ink-600">{body}</p>
    </article>
  );
}
