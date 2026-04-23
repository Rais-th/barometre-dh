import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://barometre-dh.vercel.app"),
  title: {
    default: "Baromètre DH",
    template: "%s · Baromètre DH",
  },
  description:
    "Plateforme citoyenne de signalement et de référencement des violences faites aux femmes et aux jeunes filles en République démocratique du Congo.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
