import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PROVINCES } from "@/lib/provinces";
import { AdminShell } from "../admin-shell";

export const dynamic = "force-dynamic";

export default async function PartnersAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user) {
    redirect({ href: "/admin", locale });
  }
  const tCat = await getTranslations({ locale, namespace: "structures.category" });
  const tStr = await getTranslations({ locale, namespace: "structures" });

  const partners = await prisma.partner.findMany({
    orderBy: [{ provinceCode: "asc" }, { name: "asc" }],
  });
  const provinceNames = Object.fromEntries(
    PROVINCES.map((p) => [p.code, locale === "sw" ? p.nameSw : p.nameFr])
  );

  return (
    <AdminShell active="partners">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        {tStr("title")}
      </h1>
      <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-sand-200">
        <table className="min-w-full divide-y divide-sand-200 text-sm">
          <thead className="bg-sand-50 text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Catégorie</th>
              <th className="px-4 py-3 text-left">Province</th>
              <th className="px-4 py-3 text-left">Téléphone</th>
              <th className="px-4 py-3 text-left">Courriel</th>
              <th className="px-4 py-3 text-left">Vérifié</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {partners.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{tCat(p.category as any)}</td>
                <td className="px-4 py-3">{provinceNames[p.provinceCode] ?? p.provinceCode}</td>
                <td className="px-4 py-3">{p.contactPhone ?? ""}</td>
                <td className="px-4 py-3">{p.contactEmail ?? ""}</td>
                <td className="px-4 py-3">{p.verified ? "Oui" : "Non"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
