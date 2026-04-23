"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type CaseData = {
  id: string;
  code: string;
  reportType: string;
  typeLabel: string;
  province: string;
  territoire: string | null;
  victimAgeBracket: string;
  victimAgeLabel: string;
  victimProfession: string | null;
  aggressorRelation: string;
  aggressorRelationLabel: string;
  aggressorKnown: boolean;
  contactPreference: string;
  contactLabel: string;
  incidentSummary: string;
  preciseAddress: string | null;
  trustedContactPhone: string | null;
  status: string;
  assignedPartner: { id: string; name: string } | null;
  files: Array<{
    id: string;
    url: string;
    filename: string;
    contentType: string;
    size: number;
  }>;
  notes: Array<{
    id: string;
    body: string;
    authorName: string;
    createdAt: string;
  }>;
};

const STATUSES = ["NEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export function CaseDetail({
  caseData,
  partners,
}: {
  caseData: CaseData;
  partners: Array<{ id: string; name: string; provinceCode: string }>;
}) {
  const t = useTranslations("admin.case");
  const router = useRouter();
  const [status, setStatus] = useState(caseData.status);
  const [partnerId, setPartnerId] = useState(caseData.assignedPartner?.id ?? "");
  const [note, setNote] = useState("");
  const [savedFlag, setSavedFlag] = useState(false);
  const [pending, startTransition] = useTransition();

  async function update(body: any) {
    const res = await fetch(`/api/admin/cases/${caseData.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setSavedFlag(true);
      setTimeout(() => setSavedFlag(false), 2000);
      startTransition(() => router.refresh());
    }
  }

  async function addNote() {
    if (!note.trim()) return;
    const res = await fetch(`/api/admin/cases/${caseData.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: note.trim() }),
    });
    if (res.ok) {
      setNote("");
      setSavedFlag(true);
      setTimeout(() => setSavedFlag(false), 2000);
      startTransition(() => router.refresh());
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <section className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-sand-200">
          <h2 className="text-base font-semibold text-neutral-900">
            {t("summary")}
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
            {caseData.incidentSummary}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-sand-200">
          <h2 className="text-base font-semibold text-neutral-900">
            {t("location")}
          </h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <Meta label={t("location")}>
              {caseData.province}
              {caseData.territoire ? ` · ${caseData.territoire}` : ""}
            </Meta>
            {caseData.preciseAddress && (
              <Meta label={t("preciseAddress")}>{caseData.preciseAddress}</Meta>
            )}
          </dl>
        </div>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-sand-200">
          <h2 className="text-base font-semibold text-neutral-900">
            {t("victim")} / {t("aggressor")}
          </h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <Meta label={t("victim")}>
              {caseData.victimAgeLabel}
              {caseData.victimProfession ? ` · ${caseData.victimProfession}` : ""}
            </Meta>
            <Meta label={t("aggressor")}>
              {caseData.aggressorRelationLabel}
            </Meta>
            <Meta label={t("contact")}>{caseData.contactLabel}</Meta>
            {caseData.trustedContactPhone && (
              <Meta label={t("trustedContactPhone")}>
                <a
                  href={`tel:${caseData.trustedContactPhone}`}
                  className="text-brand-700 hover:underline"
                >
                  {caseData.trustedContactPhone}
                </a>
              </Meta>
            )}
          </dl>
        </div>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-sand-200">
          <h2 className="text-base font-semibold text-neutral-900">
            {t("files")}
          </h2>
          {caseData.files.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-600">{t("noFiles")}</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {caseData.files.map((f) => (
                <li key={f.id}>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-700 hover:underline"
                  >
                    {f.filename}
                  </a>
                  <span className="ml-2 text-xs text-neutral-500">
                    {f.contentType} · {(f.size / 1024).toFixed(0)} KB
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-sand-200">
          <h2 className="text-base font-semibold text-neutral-900">
            {t("notes")}
          </h2>
          <div className="mt-4 flex gap-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={t("addNote")}
              className="flex-1 rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={addNote}
              disabled={pending || !note.trim()}
              className="self-end rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:bg-neutral-300"
            >
              {t("noteSubmit")}
            </button>
          </div>
          <ul className="mt-4 space-y-3">
            {caseData.notes.map((n) => (
              <li key={n.id} className="rounded-xl bg-sand-50 p-4 text-sm">
                <p className="whitespace-pre-wrap text-neutral-800">{n.body}</p>
                <p className="mt-2 text-xs text-neutral-500">
                  {n.authorName} · {new Date(n.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-sand-200">
          <h2 className="text-base font-semibold text-neutral-900">
            {t("status")}
          </h2>
          <select
            value={status}
            onChange={(e) => {
              const v = e.target.value;
              setStatus(v);
              update({ status: v });
            }}
            className="mt-3 w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status_${s.toLowerCase()}` as any)}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-2xl bg-white p-6 ring-1 ring-sand-200">
          <h2 className="text-base font-semibold text-neutral-900">
            {t("assignedPartner")}
          </h2>
          <select
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            className="mt-3 w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => update({ assignedPartnerId: partnerId || null })}
            disabled={pending}
            className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:bg-neutral-300"
          >
            {t("assignCta")}
          </button>
          {savedFlag && (
            <p className="mt-2 text-xs text-green-700">{t("saved")}</p>
          )}
        </div>
      </aside>
    </div>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-neutral-500">{label}</dt>
      <dd className="mt-1 text-sm text-neutral-800">{children}</dd>
    </div>
  );
}
