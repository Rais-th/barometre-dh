"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

type Row = {
  id: string;
  code: string;
  reportType: string;
  provinceCode: string;
  provinceName: string;
  status: string;
  submittedAt: string;
  assignedPartnerName: string | null;
};

const STATUSES = ["NEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
const TYPES = ["DOMESTIC_VIOLENCE", "GBV", "ELECTORAL_VIOLENCE", "OTHER"] as const;

export function CaseQueue({
  cases,
  filters,
  provinces,
}: {
  cases: Row[];
  filters: { status: string; type: string; province: string };
  provinces: Array<{ code: string; name: string }>;
}) {
  const t = useTranslations("admin.queue");
  const tReport = useTranslations("report.type");
  const tCase = useTranslations("admin.case");
  const router = useRouter();

  const setFilter = (key: "status" | "type" | "province", value: string) => {
    const params = new URLSearchParams();
    const next = { ...filters, [key]: value };
    if (next.status) params.set("status", next.status);
    if (next.type) params.set("type", next.type);
    if (next.province) params.set("province", next.province);
    router.replace(
      ("/admin/cases" + (params.size ? `?${params}` : "")) as any
    );
  };

  const statusLabel = (s: string) =>
    tCase(`status_${s.toLowerCase()}` as any);

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-3">
        <FilterSelect
          label={t("filterStatus")}
          value={filters.status}
          onChange={(v) => setFilter("status", v)}
          options={[
            { value: "", label: t("all") },
            ...STATUSES.map((s) => ({ value: s, label: statusLabel(s) })),
          ]}
        />
        <FilterSelect
          label={t("filterType")}
          value={filters.type}
          onChange={(v) => setFilter("type", v)}
          options={[
            { value: "", label: t("all") },
            ...TYPES.map((ty) => ({ value: ty, label: tReport(ty as any) })),
          ]}
        />
        <FilterSelect
          label={t("filterProvince")}
          value={filters.province}
          onChange={(v) => setFilter("province", v)}
          options={[
            { value: "", label: t("all") },
            ...provinces.map((p) => ({ value: p.code, label: p.name })),
          ]}
        />
        <a
          href={`/api/admin/cases/export?${new URLSearchParams({
            ...(filters.status && { status: filters.status }),
            ...(filters.type && { type: filters.type }),
            ...(filters.province && { province: filters.province }),
          })}`}
          className="ml-auto inline-flex items-end rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          {t("export")}
        </a>
      </div>

      {cases.length === 0 ? (
        <p className="mt-10 rounded-2xl bg-white p-8 text-center text-sm text-neutral-600 ring-1 ring-sand-200">
          {t("empty")}
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-sand-200">
          <table className="min-w-full divide-y divide-sand-200 text-sm">
            <thead className="bg-sand-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <Th>{t("code")}</Th>
                <Th>{t("type")}</Th>
                <Th>{t("province")}</Th>
                <Th>{t("status")}</Th>
                <Th>{t("date")}</Th>
                <Th className="text-right">{t("open")}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-sand-50/60">
                  <Td className="font-mono text-xs">{c.code}</Td>
                  <Td>{tReport(c.reportType as any)}</Td>
                  <Td>{c.provinceName}</Td>
                  <Td>
                    <StatusPill status={c.status} label={statusLabel(c.status)} />
                  </Td>
                  <Td>
                    {new Date(c.submittedAt).toLocaleString()}
                  </Td>
                  <Td className="text-right">
                    <Link
                      href={`/admin/cases/${c.id}` as any}
                      className="text-brand-700 hover:underline"
                    >
                      {t("open")}
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex flex-col text-xs font-medium text-neutral-700">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 min-w-40 rounded-md border border-sand-200 bg-white px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o.value || "_all"} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={"px-4 py-3 text-left font-medium " + className}>{children}</th>;
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={"px-4 py-3 align-middle " + className}>{children}</td>;
}

function StatusPill({ status, label }: { status: string; label: string }) {
  const palette: Record<string, string> = {
    NEW: "bg-brand-100 text-brand-800",
    ASSIGNED: "bg-sand-200 text-sand-800",
    IN_PROGRESS: "bg-amber-100 text-amber-900",
    RESOLVED: "bg-green-100 text-green-900",
    CLOSED: "bg-neutral-200 text-neutral-800",
  };
  return (
    <span
      className={
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium " +
        (palette[status] ?? "bg-neutral-100 text-neutral-800")
      }
    >
      {label}
    </span>
  );
}
