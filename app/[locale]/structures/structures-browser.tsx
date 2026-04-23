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
      <div className="mt-8 flex flex-wrap gap-3">
        <label className="flex flex-col text-xs font-medium text-neutral-700">
          {t("filterProvince")}
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="mt-1 min-w-48 rounded-md border border-sand-200 bg-white px-3 py-2 text-sm text-neutral-900"
          >
            <option value="">{t("all")}</option>
            {provinceOptions.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-xs font-medium text-neutral-700">
          {t("filterCategory")}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 min-w-48 rounded-md border border-sand-200 bg-white px-3 py-2 text-sm text-neutral-900"
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
        <p className="mt-12 rounded-2xl bg-white p-8 text-center text-sm text-neutral-600 ring-1 ring-sand-200">
          {t("empty")}
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl bg-white p-5 ring-1 ring-sand-200"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-neutral-900">
                  {p.name}
                </h3>
                {p.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-800">
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
              <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500">
                {t(`category.${p.category}` as any)} · {p.provinceName}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                {p.services}
              </p>
              <dl className="mt-4 space-y-1 text-sm text-neutral-700">
                {p.contactPhone && (
                  <Row label={t("phone")}>
                    <a
                      href={`tel:${p.contactPhone}`}
                      className="text-brand-700 hover:underline"
                    >
                      {p.contactPhone}
                    </a>
                  </Row>
                )}
                {p.contactEmail && (
                  <Row label={t("email")}>
                    <a
                      href={`mailto:${p.contactEmail}`}
                      className="text-brand-700 hover:underline"
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
                      className="text-brand-700 hover:underline"
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
    <div className="flex gap-2">
      <dt className="w-20 flex-none text-xs uppercase tracking-wider text-neutral-500">
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}
