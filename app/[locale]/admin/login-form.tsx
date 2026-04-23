"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export function LoginForm({
  labels,
}: {
  labels: { email: string; password: string; submit: string; error: string };
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const locale = useLocale();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (!res || res.error) {
      setError(labels.error);
      return;
    }
    router.replace({ pathname: "/admin/cases" }, { locale });
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl bg-white p-6 ring-1 ring-sand-200">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-900 ring-1 ring-red-200">
          {error}
        </p>
      )}
      <label className="block">
        <span className="text-xs font-medium text-neutral-700">{labels.email}</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-neutral-700">{labels.password}</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-neutral-300"
      >
        {labels.submit}
      </button>
    </form>
  );
}
