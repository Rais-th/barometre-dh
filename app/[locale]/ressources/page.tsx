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
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-700">
          {t("lead")}
        </p>
      </header>

      <div
        role="alert"
        className="mt-8 rounded-2xl border-l-4 border-red-500 bg-red-50 p-5 text-sm leading-relaxed text-red-900"
      >
        {t("reminder")}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-neutral-900">{t("emergencyTitle")}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          <EmergencyItem label={t("police")} />
          <EmergencyItem label={t("hotline")} />
          <EmergencyItem label={t("ambulance")} />
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-neutral-900">{t("lawsTitle")}</h2>
        <div className="mt-4 space-y-4">
          <LawCard title={t("law1Title")} body={t("law1Body")} />
          <LawCard title={t("law2Title")} body={t("law2Body")} />
          <LawCard title={t("law3Title")} body={t("law3Body")} />
        </div>
      </section>

      <section className="mt-12 rounded-2xl bg-brand-700 p-8 text-white">
        <h2 className="text-xl font-semibold">{t("downloadTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/85">{t("downloadBody")}</p>
        <a
          href={`/guides/droits-${locale}.pdf`}
          download
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 hover:bg-sand-50"
        >
          <svg
            width="16"
            height="16"
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
      </section>
    </article>
  );
}

function EmergencyItem({ label }: { label: string }) {
  return (
    <li className="rounded-xl bg-white p-4 text-center text-sm font-medium text-neutral-800 ring-1 ring-sand-200">
      {label}
    </li>
  );
}

function LawCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl bg-white p-5 ring-1 ring-sand-200">
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700">{body}</p>
    </article>
  );
}
