import { PrismaClient, PartnerCategory } from "@prisma/client";
import { hash } from "bcryptjs";
import { PROVINCES } from "../lib/provinces";

const prisma = new PrismaClient();

async function main() {
  // 1. Provinces
  for (const p of PROVINCES) {
    await prisma.province.upsert({
      where: { code: p.code },
      update: { nameFr: p.nameFr, nameSw: p.nameSw },
      create: p,
    });
  }

  // 2. Admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@dignitehumaine.org";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminPassword) {
    const passwordHash = await hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        passwordHash,
        name: process.env.SEED_ADMIN_NAME || "La Dignité Humaine",
        role: "ADMIN",
      },
    });
    console.log(`Seeded admin: ${adminEmail}`);
  } else {
    console.log("Skipping admin seed (SEED_ADMIN_PASSWORD not set).");
  }

  // 3. Example verified partner structures. La Dignité Humaine Asbl itself + placeholders.
  const examplePartners: Array<{
    name: string;
    category: PartnerCategory;
    provinceCode: string;
    contactPhone?: string;
    contactEmail?: string;
    address?: string;
    services: string;
    verified: boolean;
  }> = [
    {
      name: "La Dignité Humaine Asbl",
      category: "OTHER",
      provinceCode: "KN",
      contactEmail: "contact@dignitehumaine.org",
      services: "Accueil, écoute, référencement vers structures partenaires.",
      verified: true,
    },
    {
      name: "Ministère du Genre, Famille et Enfant — Cellule d'écoute",
      category: "MINISTRY",
      provinceCode: "KN",
      services: "Prise en charge institutionnelle, coordination des cas.",
      verified: false,
    },
    {
      name: "Ligne verte nationale — Violences faites aux femmes",
      category: "HOTLINE",
      provinceCode: "KN",
      contactPhone: "49",
      services: "Écoute téléphonique 24h/24, orientation d'urgence.",
      verified: false,
    },
  ];

  for (const partner of examplePartners) {
    const existing = await prisma.partner.findFirst({
      where: { name: partner.name, provinceCode: partner.provinceCode },
    });
    if (!existing) {
      await prisma.partner.create({ data: partner });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
