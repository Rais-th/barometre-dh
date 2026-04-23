"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

export function PanicButton() {
  const t = useTranslations("panic");

  const handleClose = useCallback(() => {
    try {
      // Replace the history entry so Back does not return to the platform.
      window.history.replaceState(null, "", "about:blank");
    } catch {
      /* noop */
    }
    window.location.replace("https://www.google.com/search?q=m%C3%A9t%C3%A9o");
  }, []);

  return (
    <button
      type="button"
      onClick={handleClose}
      aria-label={t("a11y")}
      className="print-hide fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg ring-1 ring-black/10 transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
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
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
      {t("close")}
    </button>
  );
}
