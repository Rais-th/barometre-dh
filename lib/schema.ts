import { z } from "zod";

export const reportTypes = [
  "DOMESTIC_VIOLENCE",
  "GBV",
  "ELECTORAL_VIOLENCE",
  "OTHER",
] as const;

export const ageBrackets = [
  "UNDER_13",
  "A_13_17",
  "A_18_24",
  "A_25_34",
  "A_35_44",
  "A_45_54",
  "A_55_PLUS",
  "UNKNOWN",
] as const;

export const aggressorRelations = [
  "SPOUSE",
  "PARTNER_EX",
  "FAMILY",
  "NEIGHBOR",
  "COWORKER",
  "AUTHORITY_FIGURE",
  "STRANGER",
  "OTHER",
  "UNKNOWN",
] as const;

export const contactPreferences = [
  "ANONYMOUS",
  "CALLBACK_SELF",
  "CALLBACK_TRUSTED",
] as const;

export const caseSubmissionSchema = z.object({
  reportType: z.enum(reportTypes),
  incidentSummary: z.string().min(1).max(10_000),
  provinceCode: z.string().min(1).max(8),
  territoire: z.string().max(120).optional().nullable(),
  preciseAddress: z.string().max(500).optional().nullable(),
  victimAgeBracket: z.enum(ageBrackets),
  victimProfession: z.string().max(200).optional().nullable(),
  aggressorRelation: z.enum(aggressorRelations),
  aggressorKnown: z.boolean(),
  contactPreference: z.enum(contactPreferences),
  trustedContactPhone: z.string().max(60).optional().nullable(),
  fileUrl: z.string().url().optional().nullable(),
  fileName: z.string().max(200).optional().nullable(),
  fileContentType: z.string().max(120).optional().nullable(),
  fileSize: z.number().int().nonnegative().max(10 * 1024 * 1024).optional().nullable(),
  consent: z.literal(true),
  locale: z.enum(["fr", "sw"]).default("fr"),
});

export type CaseSubmission = z.infer<typeof caseSubmissionSchema>;
