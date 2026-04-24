"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Partner = {
  id: string;
  name: string;
  category: string;
  provinceCode: string;
  provinceName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  website: string | null;
  address: string | null;
  services: string;
  verified: boolean;
};

export function StructuresBrowser({ partners }: { partners: Partner[] }) {
  const t = useTranslations("structures");
  const [province, setProvince] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const provinceOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of partners) {
      seen.set(p.provinceCode, p.provinceName);
    }
    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [partners]);

  const categoryOptions = useMemo(() => {
    const set = new Set(partners.map((p) => p.category));
    return Array.from(set).sort();
  }, [partners]);

  const filtered = partners.filter((p) => {
    if (province && p.provinceCode !== province) return false;
    if (category && p.category !== category) return false;
    return true;
  });

  return (
    <>
      <div className="mt-10 flex flex-wrap gap-4 rounded-xl border border-ink-200 bg-white p-4">
        <label className="flex flex-col text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-600">
          {t("filterProvince")}
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="mt-1.5 min-w-48 rounded-md border border-ink-200 bg-white px-3 py-2 text-[14px] text-ink-900 transition-colors focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            <option value="">{t("all")}</option>
            {provinceOptions.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-600">
          {t("filterCategory")}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1.5 min-w-48 rounded-md border border-ink-200 bg-white px-3 py-2 text-[14px] text-ink-900 transition-colors focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            <option value="">{t("all")}</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {t(`category.${c}` as any)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-xl border border-ink-200 bg-white p-8 text-center text-[14px] text-ink-500">
          {t("empty")}
        </p>
      ) : (
        <ul className="mt-8 grid gap-3 md:grid-cols-2">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-ink-200 bg-white p-5 transition-colors hover:border-brand-400"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[16px] font-semibold tracking-tight text-ink-900">
                  {p.name}
                </h3>
                {p.verified && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-brand-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-800">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {t("verified")}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                {t(`category.${p.category}` as any)} · {p.provinceName}
              </p>
              <p className="mt-3 text-[14px] leading-[1.65] text-ink-700">
                {p.services}
              </p>
              <dl className="mt-4 space-y-1.5 text-[13px] text-ink-700">
                {p.contactPhone && (
                  <Row label={t("phone")}>
                    <a
                      href={`tel:${p.contactPhone}`}
                      className="text-brand-800 underline decoration-brand-300 decoration-1 underline-offset-4 hover:text-brand-900"
                    >
                      {p.contactPhone}
                    </a>
                  </Row>
                )}
                {p.contactEmail && (
                  <Row label={t("email")}>
                    <a
                      href={`mailto:${p.contactEmail}`}
                      className="text-brand-800 underline decoration-brand-300 decoration-1 underline-offset-4 hover:text-brand-900"
                    >
                      {p.contactEmail}
                    </a>
                  </Row>
                )}
                {p.website && (
                  <Row label={t("website")}>
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-800 underline decoration-brand-300 decoration-1 underline-offset-4 hover:text-brand-900"
                    >
                      {p.website}
                    </a>
                  </Row>
                )}
                {p.address && <Row label={t("address")}>{p.address}</Row>}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 flex-none text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-500">
        {label}
      </dt>
      <dd className="text-[13px]">{children}</dd>
    </div>
  );
}
