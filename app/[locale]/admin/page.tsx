import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";

export default async function AdminLogin({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (session?.user) {
    redirect({ href: "/admin/cases", locale });
  }
  const t = await getTranslations({ locale, namespace: "admin.login" });

  return (
    <section className="mx-auto max-w-md animate-fade-in">
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-neutral-600">{t("subtitle")}</p>
      </header>
      <LoginForm labels={{ email: t("email"), password: t("password"), submit: t("submit"), error: t("error") }} />
    </section>
  );
}
