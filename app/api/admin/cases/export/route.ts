import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes("\n") || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const where: any = {};
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");
  const province = url.searchParams.get("province");
  if (status) where.status = status;
  if (type) where.reportType = type;
  if (province) where.provinceCode = province;

  const cases = await prisma.case.findMany({
    where,
    orderBy: { submittedAt: "desc" },
    include: { assignedPartner: { select: { name: true } } },
  });

  // Note: CSV export excludes decrypted PII (summary/address/phone). Only
  // metadata and status are included so the file can be shared with ministries.
  const header = [
    "code",
    "submitted_at",
    "report_type",
    "province",
    "territoire",
    "victim_age_bracket",
    "aggressor_relation",
    "aggressor_known",
    "contact_preference",
    "status",
    "assigned_partner",
    "locale",
  ];
  const rows = cases.map((c) =>
    [
      c.code,
      c.submittedAt.toISOString(),
      c.reportType,
      c.provinceCode,
      c.territoire ?? "",
      c.victimAgeBracket,
      c.aggressorRelation,
      c.aggressorKnown ? "yes" : "no",
      c.contactPreference,
      c.status,
      c.assignedPartner?.name ?? "",
      c.locale,
    ]
      .map(csvEscape)
      .join(",")
  );
  const body = [header.join(","), ...rows].join("\n");

  await prisma.accessLog.create({
    data: {
      userId: (session.user as any).id,
      action: "case.export",
      target: `filters=${url.search}`,
    },
  });

  const filename = `barometre-dh-cases-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"${filename}\"`,
      "Cache-Control": "no-store",
    },
  });
}
