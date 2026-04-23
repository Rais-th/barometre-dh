import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z
    .enum(["NEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"])
    .optional(),
  assignedPartnerId: z.string().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const data: any = {};
  if (parsed.data.status !== undefined) data.status = parsed.data.status;
  if (parsed.data.assignedPartnerId !== undefined) {
    data.assignedPartnerId = parsed.data.assignedPartnerId;
    if (parsed.data.assignedPartnerId) {
      data.assignedById = (session.user as any).id;
      if (!parsed.data.status) data.status = "ASSIGNED";
    }
  }
  const updated = await prisma.case.update({
    where: { id },
    data,
    include: { assignedPartner: true },
  });

  // Fire-and-forget email notification when partner is newly assigned.
  if (
    parsed.data.assignedPartnerId &&
    updated.assignedPartner?.contactEmail &&
    process.env.RESEND_API_KEY
  ) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM || "Baromètre DH <no-reply@barometre-dh.org>",
        to: updated.assignedPartner.contactEmail,
        subject: `Baromètre DH — nouveau cas assigné (${updated.code})`,
        text:
          `Bonjour,\n\nLa Dignité Humaine Asbl vous a assigné le cas ${updated.code}.\n` +
          `Merci de vous connecter à votre espace coordinateur pour consulter les détails.\n\n` +
          `Cet email ne contient aucune donnée sensible. Les informations complètes sont disponibles uniquement dans l'espace sécurisé.\n\n` +
          `Baromètre DH`,
      });
    } catch (e) {
      console.error("email_notification_failed", e);
    }
  }

  await prisma.accessLog.create({
    data: {
      userId: (session.user as any).id,
      action: "case.update",
      target: id,
    },
  });

  return NextResponse.json({ ok: true });
}
