import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { caseSubmissionSchema } from "@/lib/schema";
import { encryptJSON, generateCaseCode } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = caseSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  const encryptedPayload = encryptJSON({
    incidentSummary: input.incidentSummary,
    preciseAddress: input.preciseAddress ?? null,
    trustedContactPhone: input.trustedContactPhone ?? null,
  });

  const code = generateCaseCode();

  try {
    const created = await prisma.case.create({
      data: {
        code,
        reportType: input.reportType,
        provinceCode: input.provinceCode,
        territoire: input.territoire ?? null,
        victimAgeBracket: input.victimAgeBracket,
        victimProfession: input.victimProfession ?? null,
        aggressorRelation: input.aggressorRelation,
        aggressorKnown: input.aggressorKnown,
        contactPreference: input.contactPreference,
        encryptedPayload,
        status: "NEW",
        locale: input.locale,
        files:
          input.fileUrl && input.fileName && input.fileContentType && input.fileSize
            ? {
                create: [
                  {
                    url: input.fileUrl,
                    filename: input.fileName,
                    contentType: input.fileContentType,
                    size: input.fileSize,
                  },
                ],
              }
            : undefined,
      },
      select: { code: true },
    });
    return NextResponse.json({ code: created.code }, { status: 201 });
  } catch (err) {
    console.error("case_create_failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
