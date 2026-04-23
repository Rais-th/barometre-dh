import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PROVINCES } from "@/lib/provinces";
import { CaseQueue } from "./case-queue";
import { AdminShell } from "../admin-shell";

export const dynamic = "force-dynamic";

export default async function CasesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; type?: string; province?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user) {
    redirect({ href: "/admin", locale });
  }
  const sp = await searchParams;

  const where: any = {};
  if (sp.status) where.status = sp.status;
  if (sp.type) where.reportType = sp.type;
  if (sp.province) where.provinceCode = sp.province;

  const cases = await prisma.case.findMany({
    where,
    orderBy: { submittedAt: "desc" },
    take: 200,
    include: { assignedPartner: { select: { name: true } } },
  });

  const t = await getTranslations({ locale, namespace: "admin" });

  const provinceNames = Object.fromEntries(
    PROVINCES.map((p) => [p.code, locale === "sw" ? p.nameSw : p.nameFr])
  );

  return (
    <AdminShell active="queue">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        {t("queue.title")}
      </h1>
      <CaseQueue
        cases={cases.map((c) => ({
          id: c.id,
          code: c.code,
          reportType: c.reportType,
          provinceCode: c.provinceCode,
          provinceName: provinceNames[c.provinceCode] ?? c.provinceCode,
          status: c.status,
          submittedAt: c.submittedAt.toISOString(),
          assignedPartnerName: c.assignedPartner?.name ?? null,
        }))}
        filters={{
          status: sp.status ?? "",
          type: sp.type ?? "",
          province: sp.province ?? "",
        }}
        provinces={PROVINCES.map((p) => ({
          code: p.code,
          name: locale === "sw" ? p.nameSw : p.nameFr,
        }))}
      />
    </AdminShell>
  );
}
