import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db";
import { PROVINCES } from "@/lib/provinces";
import { StructuresBrowser } from "./structures-browser";

export const revalidate = 300;

export default async function StructuresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "structures" });

  let partners: Awaited<ReturnType<typeof prisma.partner.findMany>> = [];
  try {
    partners = await prisma.partner.findMany({
      where: { verified: true },
      orderBy: [{ provinceCode: "asc" }, { name: "asc" }],
    });
  } catch {
    // DB unavailable (e.g. build without DATABASE_URL). Render empty list.
    partners = [];
  }

  const provinceNames = Object.fromEntries(
    PROVINCES.map((p) => [p.code, locale === "sw" ? p.nameSw : p.nameFr])
  );

  return (
    <section className="animate-fade-in">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-700">
          {t("lead")}
        </p>
      </header>

      <StructuresBrowser
        partners={partners.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          provinceCode: p.provinceCode,
          provinceName: provinceNames[p.provinceCode] ?? p.provinceCode,
          contactPhone: p.contactPhone,
          contactEmail: p.contactEmail,
          website: p.website,
          address: p.address,
          services: p.services,
          verified: p.verified,
        }))}
      />
    </section>
  );
}
