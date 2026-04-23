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
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-700">
          {t("lead")}
        </p>
      </header>

      <p className="mt-4 max-w-2xl text-xs leading-relaxed text-neutral-500">
        {t("privacy")}
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
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
    <div className="rounded-2xl bg-white p-6 ring-1 ring-sand-200">
      <p className="text-xs uppercase tracking-wider text-neutral-500">
        {label}
      </p>
      <p className={big ? "mt-2 text-4xl font-semibold text-brand-800" : "mt-2 text-xl font-semibold text-neutral-900"}>
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
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      {buckets.length === 0 ? (
        <p className="mt-3 rounded-xl bg-white p-6 text-sm text-neutral-600 ring-1 ring-sand-200">
          {emptyLabel}
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {buckets.map((b) => {
            const pct = total > 0 ? Math.round((b.count / total) * 100) : 0;
            return (
              <li key={b.key} className="rounded-xl bg-white p-4 ring-1 ring-sand-200">
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="font-medium text-neutral-800">{b.label}</span>
                  <span className="tabular-nums text-neutral-600">
                    {b.count} ({pct}%)
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sand-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
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
