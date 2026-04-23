import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { decryptJSON } from "@/lib/crypto";
import { PROVINCES } from "@/lib/provinces";
import { AdminShell } from "../../admin-shell";
import { CaseDetail } from "./case-detail";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user) {
    redirect({ href: "/admin", locale });
  }

  const record = await prisma.case.findUnique({
    where: { id },
    include: {
      files: true,
      assignedPartner: true,
      notes: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });
  if (!record) notFound();

  const partners = await prisma.partner.findMany({
    orderBy: [{ provinceCode: "asc" }, { name: "asc" }],
    select: { id: true, name: true, provinceCode: true },
  });

  let decrypted: {
    incidentSummary: string;
    preciseAddress: string | null;
    trustedContactPhone: string | null;
  } = { incidentSummary: "", preciseAddress: null, trustedContactPhone: null };
  try {
    decrypted = decryptJSON(record.encryptedPayload);
  } catch {
    /* empty */
  }

  const tCase = await getTranslations({ locale, namespace: "admin.case" });
  const tReport = await getTranslations({ locale, namespace: "report" });
  const provinceNames = Object.fromEntries(
    PROVINCES.map((p) => [p.code, locale === "sw" ? p.nameSw : p.nameFr])
  );

  return (
    <AdminShell active="queue">
      <header className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {tCase("title", { code: record.code })}
        </h1>
        <p className="text-xs text-neutral-500">
          {tCase("receivedAt")}: {record.submittedAt.toLocaleString()}
        </p>
      </header>

      <CaseDetail
        caseData={{
          id: record.id,
          code: record.code,
          reportType: record.reportType,
          typeLabel: tReport(`type.${record.reportType}`),
          province: provinceNames[record.provinceCode] ?? record.provinceCode,
          territoire: record.territoire,
          victimAgeBracket: record.victimAgeBracket,
          victimAgeLabel: tReport(`age.${record.victimAgeBracket}`),
          victimProfession: record.victimProfession,
          aggressorRelation: record.aggressorRelation,
          aggressorRelationLabel: tReport(`relation.${record.aggressorRelation}`),
          aggressorKnown: record.aggressorKnown,
          contactPreference: record.contactPreference,
          contactLabel: tReport(`contact.${record.contactPreference}`),
          incidentSummary: decrypted.incidentSummary,
          preciseAddress: decrypted.preciseAddress,
          trustedContactPhone: decrypted.trustedContactPhone,
          status: record.status,
          assignedPartner: record.assignedPartner
            ? {
                id: record.assignedPartner.id,
                name: record.assignedPartner.name,
              }
            : null,
          files: record.files.map((f) => ({
            id: f.id,
            url: f.url,
            filename: f.filename,
            contentType: f.contentType,
            size: f.size,
          })),
          notes: record.notes.map((n) => ({
            id: n.id,
            body: n.body,
            authorName: n.user.name,
            createdAt: n.createdAt.toISOString(),
          })),
        }}
        partners={partners}
      />
    </AdminShell>
  );
}
