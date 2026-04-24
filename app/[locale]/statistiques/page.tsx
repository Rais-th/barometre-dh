import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db";
import { PROVINCES } from "@/lib/provinces";

export const revalidate = 3600;

const MIN_BUCKET = 5;

type Bucket = { key: string; label: string; count: number };

function applyPrivacyMask(buckets: Bucket[]): Bucket[] {
  // Hide counts below threshold to avoid re-identification in small locales.
  return buckets.map((b) => (b.count < MIN_BUCKET ? { ...b, count: 0 } : b));
}

export default async function StatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "stats" });
  const tReport = await getTranslations({ locale, namespace: "report.type" });

  let total = 0;
  let byType: Bucket[] = [];
  let byProvince: Bucket[] = [];
  let byMonth: Bucket[] = [];

  try {
    total = await prisma.case.count();

    const typeGroups = await prisma.case.groupBy({
      by: ["reportType"],
      _count: { _all: true },
    });
    byType = typeGroups
      .map((g) => ({
        key: g.reportType,
        label: tReport(g.reportType as any),
        count: g._count._all,
      }))
      .sort((a, b) => b.count - a.count);

    const provinceGroups = await prisma.case.groupBy({
      by: ["provinceCode"],
      _count: { _all: true },
    });
    const provinceNames = Object.fromEntries(
      PROVINCES.map((p) => [p.code, locale === "sw" ? p.nameSw : p.nameFr])
    );
    byProvince = provinceGroups
      .map((g) => ({
        key: g.provinceCode,
        label: provinceNames[g.provinceCode] ?? g.provinceCode,
        count: g._count._all,
      }))
      .sort((a, b) => b.count - a.count);

    // By month — raw SQL for date truncation works cross-DB via date.toISOString slice
    const all = await prisma.case.findMany({ select: { submittedAt: true } });
    const monthMap = new Map<string, number>();
    for (const c of all) {
      const ym = c.submittedAt.toISOString().slice(0, 7);
      monthMap.set(ym, (monthMap.get(ym) ?? 0) + 1);
    }
    byMonth = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([ym, count]) => ({ key: ym, label: ym, count }));
  } catch {
    // DB unavailable during build; render empty.
  }

  byType = applyPrivacyMask(byType);
  byProvince = applyPrivacyMask(byProvince);
  byMonth = applyPrivacyMask(byMonth);

  return (
    <article className="animate-fade-in">
      <header className="max-w-3xl">
        <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-brand-800">
          Transparence publique
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-[1.1] tracking-tightest text-ink-900 sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-[1.7] text-ink-700">
          {t("lead")}
        </p>
      </header>

      <p className="mt-4 max-w-2xl text-[12px] leading-relaxed text-ink-500">
        {t("privacy")}
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        <MetricCard label={t("totalCases")} value={total} big />
        <MetricCard
          label={t("updatedAt")}
          value={new Date().toLocaleDateString(locale === "sw" ? "sw-KE" : "fr-FR")}
        />
      </div>

      <BucketSection
        title={t("byType")}
        buckets={byType}
        emptyLabel={t("empty")}
      />
      <BucketSection
        title={t("byProvince")}
        buckets={byProvince.slice(0, 10)}
        emptyLabel={t("empty")}
      />
      <BucketSection
        title={t("byMonth")}
        buckets={byMonth}
        emptyLabel={t("empty")}
      />
    </article>
  );
}

function MetricCard({
  label,
  value,
  big,
}: {
  label: string;
  value: string | number;
  big?: boolean;
}) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-6">
      <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-ink-500">
        {label}
      </p>
      <p
        className={
          "mt-3 tnum tracking-tight " +
          (big ? "text-4xl font-semibold text-brand-900" : "text-xl font-semibold text-ink-900")
        }
      >
        {value}
      </p>
    </div>
  );
}

function BucketSection({
  title,
  buckets,
  emptyLabel,
}: {
  title: string;
  buckets: Bucket[];
  emptyLabel: string;
}) {
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  return (
    <section className="mt-14">
      <h2 className="text-[17px] font-semibold tracking-tight text-ink-900">
        {title}
      </h2>
      {buckets.length === 0 ? (
        <p className="mt-3 rounded-xl border border-ink-200 bg-white p-6 text-sm text-ink-500">
          {emptyLabel}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-ink-200 overflow-hidden rounded-xl border border-ink-200 bg-white">
          {buckets.map((b) => {
            const pct = total > 0 ? Math.round((b.count / total) * 100) : 0;
            return (
              <li key={b.key} className="px-5 py-4">
                <div className="flex items-baseline justify-between gap-4 text-[14px]">
                  <span className="font-medium text-ink-800">{b.label}</span>
                  <span className="tnum text-ink-500">
                    {b.count} · {pct}%
                  </span>
                </div>
                <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-brand-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
