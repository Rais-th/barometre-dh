"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import {
  reportTypes,
  ageBrackets,
  aggressorRelations,
  contactPreferences,
} from "@/lib/schema";

type Province = { code: string; name: string };

type FormState = {
  reportType: (typeof reportTypes)[number] | "";
  incidentSummary: string;
  provinceCode: string;
  territoire: string;
  preciseAddress: string;
  victimAgeBracket: (typeof ageBrackets)[number] | "";
  victimProfession: string;
  aggressorRelation: (typeof aggressorRelations)[number] | "";
  aggressorKnown: "yes" | "no" | "";
  contactPreference: (typeof contactPreferences)[number] | "";
  trustedContactPhone: string;
  file: File | null;
  consent: boolean;
};

const initial: FormState = {
  reportType: "",
  incidentSummary: "",
  provinceCode: "",
  territoire: "",
  preciseAddress: "",
  victimAgeBracket: "",
  victimProfession: "",
  aggressorRelation: "",
  aggressorKnown: "",
  contactPreference: "",
  trustedContactPhone: "",
  file: null,
  consent: false,
};

export function IntakeForm({
  provinces,
  locale,
}: {
  provinces: Province[];
  locale: Locale;
}) {
  const t = useTranslations("report");
  const [state, setState] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const canSubmit =
    state.reportType &&
    state.incidentSummary.trim().length > 0 &&
    state.provinceCode &&
    state.victimAgeBracket &&
    state.aggressorRelation &&
    state.aggressorKnown &&
    state.contactPreference &&
    state.consent &&
    !submitting;

  async function uploadFile(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body: fd });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "upload_failed");
    }
    return (await res.json()) as {
      url: string;
      filename: string;
      contentType: string;
      size: number;
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      let filePayload: {
        fileUrl?: string;
        fileName?: string;
        fileContentType?: string;
        fileSize?: number;
      } = {};
      if (state.file) {
        try {
          const uploaded = await uploadFile(state.file);
          filePayload = {
            fileUrl: uploaded.url,
            fileName: uploaded.filename,
            fileContentType: uploaded.contentType,
            fileSize: uploaded.size,
          };
        } catch {
          // If upload fails (e.g. token missing), continue without attachment.
          filePayload = {};
        }
      }

      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: state.reportType,
          incidentSummary: state.incidentSummary.trim(),
          provinceCode: state.provinceCode,
          territoire: state.territoire.trim() || null,
          preciseAddress: state.preciseAddress.trim() || null,
          victimAgeBracket: state.victimAgeBracket,
          victimProfession: state.victimProfession.trim() || null,
          aggressorRelation: state.aggressorRelation,
          aggressorKnown: state.aggressorKnown === "yes",
          contactPreference: state.contactPreference,
          trustedContactPhone: state.trustedContactPhone.trim() || null,
          ...filePayload,
          consent: true,
          locale,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { code: string };
      setSuccessCode(data.code);
    } catch (err) {
      console.error(err);
      setError("generic");
    } finally {
      setSubmitting(false);
    }
  }

  if (successCode) {
    return (
      <div className="mt-10 rounded-2xl bg-green-50 p-8 ring-1 ring-green-200">
        <h2 className="text-2xl font-semibold text-green-900">
          {t("successTitle")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-green-900">
          {t("successBody", { code: successCode })}
        </p>
        <p className="mt-2 text-xs text-green-800/80">
          {t("successTakeCode")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-10">
      {error && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-900 ring-1 ring-red-200"
        >
          <strong className="block font-semibold">{t("errorTitle")}</strong>
          <span>{t("errorBody")}</span>
        </div>
      )}

      <Fieldset legend={t("typeTitle")}>
        <div className="grid gap-3 sm:grid-cols-2">
          {reportTypes.map((type) => (
            <RadioCard
              key={type}
              name="reportType"
              value={type}
              label={t(`type.${type}`)}
              checked={state.reportType === type}
              onChange={() => update("reportType", type)}
            />
          ))}
        </div>
      </Fieldset>

      <Fieldset legend={t("summaryTitle")} hint={t("summaryHelp")}>
        <textarea
          required
          minLength={1}
          maxLength={10_000}
          rows={6}
          value={state.incidentSummary}
          onChange={(e) => update("incidentSummary", e.target.value)}
          placeholder={t("summaryPlaceholder")}
          className="w-full resize-y rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </Fieldset>

      <Fieldset legend={t("locationTitle")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("province")}>
            <select
              required
              value={state.provinceCode}
              onChange={(e) => update("provinceCode", e.target.value)}
              className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">{t("provincePlaceholder")}</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("territoire")}>
            <input
              type="text"
              value={state.territoire}
              onChange={(e) => update("territoire", e.target.value)}
              placeholder={t("territoirePlaceholder")}
              className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
            />
          </Field>
        </div>
        <Field label={t("preciseAddress")} hint={t("preciseAddressHelp")}>
          <input
            type="text"
            value={state.preciseAddress}
            onChange={(e) => update("preciseAddress", e.target.value)}
            className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
          />
        </Field>
      </Fieldset>

      <Fieldset legend={t("victimTitle")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("ageBracket")}>
            <select
              required
              value={state.victimAgeBracket}
              onChange={(e) =>
                update(
                  "victimAgeBracket",
                  e.target.value as FormState["victimAgeBracket"]
                )
              }
              className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">—</option>
              {ageBrackets.map((a) => (
                <option key={a} value={a}>
                  {t(`age.${a}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("profession")}>
            <input
              type="text"
              value={state.victimProfession}
              onChange={(e) => update("victimProfession", e.target.value)}
              placeholder={t("professionPlaceholder")}
              className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
            />
          </Field>
        </div>
      </Fieldset>

      <Fieldset legend={t("aggressorTitle")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("aggressorRelation")}>
            <select
              required
              value={state.aggressorRelation}
              onChange={(e) =>
                update(
                  "aggressorRelation",
                  e.target.value as FormState["aggressorRelation"]
                )
              }
              className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">—</option>
              {aggressorRelations.map((r) => (
                <option key={r} value={r}>
                  {t(`relation.${r}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("aggressorKnown")}>
            <div className="flex gap-3">
              <RadioPill
                name="aggKnown"
                value="yes"
                label={t("aggressorKnownYes")}
                checked={state.aggressorKnown === "yes"}
                onChange={() => update("aggressorKnown", "yes")}
              />
              <RadioPill
                name="aggKnown"
                value="no"
                label={t("aggressorKnownNo")}
                checked={state.aggressorKnown === "no"}
                onChange={() => update("aggressorKnown", "no")}
              />
            </div>
          </Field>
        </div>
      </Fieldset>

      <Fieldset legend={t("contactTitle")}>
        <div className="grid gap-3 sm:grid-cols-3">
          {contactPreferences.map((c) => (
            <RadioCard
              key={c}
              name="contactPref"
              value={c}
              label={t(`contact.${c}`)}
              checked={state.contactPreference === c}
              onChange={() => update("contactPreference", c)}
            />
          ))}
        </div>
        {state.contactPreference &&
          state.contactPreference !== "ANONYMOUS" && (
            <Field
              label={t("trustedContactPhone")}
              hint={t("trustedContactHelp")}
            >
              <input
                type="tel"
                inputMode="tel"
                value={state.trustedContactPhone}
                onChange={(e) => update("trustedContactPhone", e.target.value)}
                className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
              />
            </Field>
          )}
      </Fieldset>

      <Fieldset legend={t("filesTitle")} hint={t("filesHelp")}>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-sand-300 bg-white px-4 py-3 text-sm text-neutral-700 hover:border-brand-400">
          <input
            type="file"
            accept="image/*,audio/*"
            onChange={(e) => update("file", e.target.files?.[0] ?? null)}
            className="sr-only"
          />
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
            <path d="M12 5v14M5 12h14" />
          </svg>
          {state.file ? state.file.name : t("filesLabel")}
        </label>
      </Fieldset>

      <Fieldset legend={t("consentTitle")}>
        <label className="flex items-start gap-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            required
            checked={state.consent}
            onChange={(e) => update("consent", e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-sand-300 text-brand-600 focus:ring-brand-500"
          />
          <span>{t("consent")}</span>
        </label>
      </Fieldset>

      <div className="sticky bottom-0 -mx-4 border-t border-sand-200 bg-sand-50/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex w-full items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-neutral-300 sm:w-auto"
        >
          {submitting ? t("submitting") : t("submit")}
        </button>
      </div>
    </form>
  );
}

function Fieldset({
  legend,
  hint,
  children,
}: {
  legend: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl bg-white p-6 ring-1 ring-sand-200">
      <legend className="px-1 text-base font-semibold text-neutral-900">
        {legend}
      </legend>
      {hint && (
        <p className="mt-1 text-xs text-neutral-500">{hint}</p>
      )}
      <div className="mt-4 space-y-4">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-neutral-700">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <span className="mt-1 block text-xs text-neutral-500">{hint}</span>}
    </label>
  );
}

function RadioCard({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={
        "flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition " +
        (checked
          ? "border-brand-500 bg-brand-50 text-brand-900 ring-1 ring-brand-300"
          : "border-sand-200 bg-white text-neutral-800 hover:border-brand-300")
      }
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-brand-600 focus:ring-brand-500"
      />
      <span>{label}</span>
    </label>
  );
}

function RadioPill({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={
        "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition " +
        (checked
          ? "border-brand-500 bg-brand-50 text-brand-900"
          : "border-sand-200 bg-white text-neutral-800 hover:border-brand-300")
      }
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 text-brand-600 focus:ring-brand-500"
      />
      {label}
    </label>
  );
}
