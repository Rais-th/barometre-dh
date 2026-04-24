"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type StepId =
  | "type"
  | "summary"
  | "location"
  | "victim"
  | "aggressor"
  | "contact"
  | "file"
  | "consent";

const STEP_ORDER: StepId[] = [
  "type",
  "summary",
  "location",
  "victim",
  "aggressor",
  "contact",
  "file",
  "consent",
];

export function IntakeForm({
  provinces,
  locale,
}: {
  provinces: Province[];
  locale: Locale;
}) {
  const t = useTranslations("report");
  const [state, setState] = useState<FormState>(initial);
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const currentStep = STEP_ORDER[stepIdx];
  const total = STEP_ORDER.length;
  const progress = ((stepIdx + 1) / total) * 100;

  const stepValid = useMemo(() => {
    switch (currentStep) {
      case "type":
        return Boolean(state.reportType);
      case "summary":
        return state.incidentSummary.trim().length > 0;
      case "location":
        return Boolean(state.provinceCode);
      case "victim":
        return Boolean(state.victimAgeBracket);
      case "aggressor":
        return Boolean(state.aggressorRelation) && Boolean(state.aggressorKnown);
      case "contact":
        return Boolean(state.contactPreference);
      case "file":
        return true;
      case "consent":
        return state.consent;
    }
  }, [currentStep, state]);

  const goNext = useCallback(() => {
    if (!stepValid) return;
    setDirection("forward");
    setStepIdx((i) => Math.min(i + 1, total - 1));
  }, [stepValid, total]);

  const goBack = useCallback(() => {
    setDirection("back");
    setStepIdx((i) => Math.max(i - 1, 0));
  }, []);

  // Autoadvance: on pure-radio steps, advance shortly after a choice is made.
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => goNext(), 280);
  }, [goNext]);
  useEffect(() => () => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
  }, []);

  // Keyboard: Enter advances (unless focused on textarea), Escape goes back.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (e.key === "Enter" && tag !== "textarea" && tag !== "button") {
        if (stepValid && !successCode && currentStep !== "consent") {
          e.preventDefault();
          goNext();
        }
      } else if (e.key === "Escape" && stepIdx > 0 && !successCode) {
        goBack();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepValid, stepIdx, successCode, currentStep, goNext, goBack]);

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

  async function handleSubmit() {
    if (!state.consent || submitting) return;
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

  // Success state
  if (successCode) {
    return (
      <div className="mt-10 animate-step overflow-hidden rounded-2xl border border-green-200 bg-white">
        <div className="surface-navy relative px-8 py-10 text-white sm:px-12 sm:py-12">
          <div className="relative flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-brand-300">
              {t("successTitle")}
            </p>
          </div>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.7] text-white/90">
            {t("successBody", { code: successCode })}
          </p>
          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-brand-300">
              Référence
            </p>
            <p className="tnum text-2xl font-semibold text-white">{successCode}</p>
          </div>
          <p className="mt-6 text-[13px] text-white/60">{t("successTakeCode")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      {/* Card shell */}
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
        {/* Progress + step counter */}
        <div className="relative h-1 w-full bg-ink-100">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-700 to-brand-400 transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between border-b border-ink-200 px-6 py-3 sm:px-8">
          <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-ink-500">
            Étape{" "}
            <span className="tnum text-ink-900">{String(stepIdx + 1).padStart(2, "0")}</span>
            <span className="mx-1 text-ink-400">/</span>
            <span className="tnum">{String(total).padStart(2, "0")}</span>
          </p>
          <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-ink-500">
            {stepLabel(currentStep, t)}
          </p>
        </div>

        {/* Step body — keyed so it re-mounts on change to animate. */}
        <div
          key={`${stepIdx}-${direction}`}
          className={direction === "forward" ? "animate-step" : "animate-step-back"}
        >
          <div className="px-6 py-10 sm:px-10 sm:py-12">
            {error && (
              <div
                role="alert"
                className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-900"
              >
                <strong className="mr-2 font-semibold">{t("errorTitle")}:</strong>
                {t("errorBody")}
              </div>
            )}

            {currentStep === "type" && (
              <StepShell
                eyebrow={t("typeTitle")}
                question={t("typeTitle")}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {reportTypes.map((type) => (
                    <RadioCard
                      key={type}
                      name="reportType"
                      value={type}
                      label={t(`type.${type}`)}
                      checked={state.reportType === type}
                      onChange={() => {
                        update("reportType", type);
                        scheduleAutoAdvance();
                      }}
                    />
                  ))}
                </div>
              </StepShell>
            )}

            {currentStep === "summary" && (
              <StepShell
                eyebrow={t("summaryTitle")}
                question={t("summaryTitle")}
                hint={t("summaryHelp")}
              >
                <textarea
                  autoFocus
                  required
                  minLength={1}
                  maxLength={10_000}
                  rows={6}
                  value={state.incidentSummary}
                  onChange={(e) => update("incidentSummary", e.target.value)}
                  placeholder={t("summaryPlaceholder")}
                  className="w-full resize-y rounded-md border border-ink-200 bg-white px-4 py-3 text-[15px] leading-[1.6] text-ink-900 transition-colors placeholder:text-ink-400 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
              </StepShell>
            )}

            {currentStep === "location" && (
              <StepShell
                eyebrow={t("locationTitle")}
                question={t("locationTitle")}
              >
                <div className="space-y-4">
                  <Field label={t("province")}>
                    <select
                      autoFocus
                      required
                      value={state.provinceCode}
                      onChange={(e) => update("provinceCode", e.target.value)}
                      className="w-full rounded-md border border-ink-200 bg-white px-3 py-2.5 text-[14px] text-ink-900 transition-colors focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
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
                      className="w-full rounded-md border border-ink-200 bg-white px-3 py-2.5 text-[14px] text-ink-900 transition-colors focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
                    />
                  </Field>
                  <Field label={t("preciseAddress")} hint={t("preciseAddressHelp")}>
                    <input
                      type="text"
                      value={state.preciseAddress}
                      onChange={(e) => update("preciseAddress", e.target.value)}
                      className="w-full rounded-md border border-ink-200 bg-white px-3 py-2.5 text-[14px] text-ink-900 transition-colors focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
                    />
                  </Field>
                </div>
              </StepShell>
            )}

            {currentStep === "victim" && (
              <StepShell eyebrow={t("victimTitle")} question={t("victimTitle")}>
                <div className="space-y-5">
                  <Field label={t("ageBracket")}>
                    <div className="grid gap-2 sm:grid-cols-4">
                      {ageBrackets.map((a) => (
                        <RadioPill
                          key={a}
                          name="age"
                          value={a}
                          label={t(`age.${a}`)}
                          checked={state.victimAgeBracket === a}
                          onChange={() => update("victimAgeBracket", a)}
                        />
                      ))}
                    </div>
                  </Field>
                  <Field label={t("profession")}>
                    <input
                      type="text"
                      value={state.victimProfession}
                      onChange={(e) => update("victimProfession", e.target.value)}
                      placeholder={t("professionPlaceholder")}
                      className="w-full rounded-md border border-ink-200 bg-white px-3 py-2.5 text-[14px] text-ink-900 transition-colors focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
                    />
                  </Field>
                </div>
              </StepShell>
            )}

            {currentStep === "aggressor" && (
              <StepShell eyebrow={t("aggressorTitle")} question={t("aggressorTitle")}>
                <div className="space-y-5">
                  <Field label={t("aggressorRelation")}>
                    <select
                      autoFocus
                      required
                      value={state.aggressorRelation}
                      onChange={(e) =>
                        update(
                          "aggressorRelation",
                          e.target.value as FormState["aggressorRelation"],
                        )
                      }
                      className="w-full rounded-md border border-ink-200 bg-white px-3 py-2.5 text-[14px] text-ink-900 transition-colors focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
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
              </StepShell>
            )}

            {currentStep === "contact" && (
              <StepShell eyebrow={t("contactTitle")} question={t("contactTitle")}>
                <div className="grid gap-3 sm:grid-cols-3">
                  {contactPreferences.map((c) => (
                    <RadioCard
                      key={c}
                      name="contactPref"
                      value={c}
                      label={t(`contact.${c}`)}
                      checked={state.contactPreference === c}
                      onChange={() => {
                        update("contactPreference", c);
                        if (c === "ANONYMOUS") scheduleAutoAdvance();
                      }}
                    />
                  ))}
                </div>
                {state.contactPreference && state.contactPreference !== "ANONYMOUS" && (
                  <div className="mt-5 animate-fade-in">
                    <Field
                      label={t("trustedContactPhone")}
                      hint={t("trustedContactHelp")}
                    >
                      <input
                        type="tel"
                        inputMode="tel"
                        value={state.trustedContactPhone}
                        onChange={(e) => update("trustedContactPhone", e.target.value)}
                        className="w-full rounded-md border border-ink-200 bg-white px-3 py-2.5 text-[14px] text-ink-900 transition-colors focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
                      />
                    </Field>
                  </div>
                )}
              </StepShell>
            )}

            {currentStep === "file" && (
              <StepShell
                eyebrow={t("filesTitle")}
                question={t("filesTitle")}
                hint={t("filesHelp")}
              >
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-ink-300 bg-ink-50 px-6 py-8 text-[14px] text-ink-700 transition-colors hover:border-brand-700 hover:bg-brand-50">
                  <input
                    type="file"
                    accept="image/*,audio/*"
                    onChange={(e) => update("file", e.target.files?.[0] ?? null)}
                    className="sr-only"
                  />
                  <svg
                    width="18"
                    height="18"
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
                {state.file && (
                  <button
                    type="button"
                    onClick={() => update("file", null)}
                    className="mt-3 font-mono-tight text-[11px] font-medium uppercase tracking-[0.15em] text-ink-500 underline decoration-ink-300 underline-offset-4 hover:text-ink-900"
                  >
                    Retirer le fichier
                  </button>
                )}
              </StepShell>
            )}

            {currentStep === "consent" && (
              <StepShell eyebrow={t("consentTitle")} question={t("consentTitle")}>
                <label className="flex items-start gap-3 rounded-md border border-ink-200 bg-ink-50 p-5 text-[14px] leading-[1.65] text-ink-800">
                  <input
                    type="checkbox"
                    required
                    checked={state.consent}
                    onChange={(e) => update("consent", e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-ink-300 text-brand-800 focus:ring-brand-300"
                  />
                  <span>{t("consent")}</span>
                </label>
              </StepShell>
            )}
          </div>
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between border-t border-ink-200 bg-ink-50/60 px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIdx === 0}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium text-ink-600 transition-colors hover:bg-white hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Retour
          </button>

          {currentStep === "consent" ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!stepValid || submitting}
              className="group inline-flex items-center justify-center rounded-md bg-ink-900 px-6 py-2.5 text-[14px] font-semibold text-white shadow-[0_1px_0_0_rgba(255,255,255,0.1)_inset,0_10px_20px_-12px_rgba(0,0,0,0.35)] transition-all hover:bg-brand-900 disabled:cursor-not-allowed disabled:bg-ink-300 disabled:shadow-none"
            >
              {submitting ? t("submitting") : t("submit")}
              <svg
                className="ml-1.5 transition-transform group-hover:translate-x-0.5"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!stepValid}
              className="group inline-flex items-center gap-1.5 rounded-md bg-ink-900 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-brand-900 disabled:cursor-not-allowed disabled:bg-ink-300"
            >
              Suivant
              <svg
                className="transition-transform group-hover:translate-x-0.5"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <p className="mt-4 text-center font-mono-tight text-[11px] font-medium uppercase tracking-[0.15em] text-ink-400">
        <kbd className="rounded border border-ink-200 bg-white px-1.5 py-0.5 text-ink-600">Entrée</kbd>
        <span className="mx-2">pour avancer</span>
        <kbd className="rounded border border-ink-200 bg-white px-1.5 py-0.5 text-ink-600">Esc</kbd>
        <span className="ml-2">pour revenir</span>
      </p>
    </div>
  );
}

function stepLabel(id: StepId, t: (k: string) => string): string {
  switch (id) {
    case "type":
      return t("typeTitle");
    case "summary":
      return "Récit";
    case "location":
      return t("locationTitle");
    case "victim":
      return t("victimTitle");
    case "aggressor":
      return t("aggressorTitle");
    case "contact":
      return t("contactTitle");
    case "file":
      return t("filesTitle");
    case "consent":
      return t("consentTitle");
  }
}

function StepShell({
  eyebrow,
  question,
  hint,
  children,
}: {
  eyebrow: string;
  question: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.18em] text-brand-800">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-[22px] font-semibold leading-[1.2] tracking-tight text-ink-900 sm:text-[26px]">
        {question}
      </h2>
      {hint && <p className="mt-2 text-[13px] text-ink-500">{hint}</p>}
      <div className="mt-8">{children}</div>
    </div>
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
      <span className="font-mono-tight text-[11px] font-medium uppercase tracking-[0.15em] text-ink-600">
        {label}
      </span>
      <div className="mt-2">{children}</div>
      {hint && <span className="mt-1.5 block text-[11px] text-ink-500">{hint}</span>}
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
        "flex cursor-pointer items-center gap-3 rounded-md border p-4 text-[14px] transition-all " +
        (checked
          ? "border-brand-800 bg-brand-100 text-ink-900 ring-1 ring-brand-700"
          : "border-ink-200 bg-white text-ink-800 hover:-translate-y-0.5 hover:border-brand-700 hover:shadow-[0_8px_16px_-10px_rgba(24,74,131,0.25)]")
      }
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-brand-800 focus:ring-brand-300"
      />
      <span className="font-medium">{label}</span>
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
        "inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-[13px] font-medium transition-colors " +
        (checked
          ? "border-brand-800 bg-brand-100 text-ink-900"
          : "border-ink-200 bg-white text-ink-700 hover:border-brand-700")
      }
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 text-brand-800 focus:ring-brand-300"
      />
      {label}
    </label>
  );
}
