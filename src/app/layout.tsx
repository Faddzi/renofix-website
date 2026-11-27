import type { Metadata, Viewport } from "next";
import { Anton, Archivo } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileContactBar } from "@/components/MobileContactBar";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--f-anton", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], variable: "--f-archivo", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://renofix.in"),
  title: {
    default: "Renofix | Interior design and renovation in Mumbai",
    template: "%s | Renofix",
  },
  description:
    "Renofix is a Mumbai-based interior design and renovation firm. Modular kitchens, ceiling designs, bathroom renovations and complete home interiors, from concept to handover.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Renofix",
  },
};

export const viewport: Viewport = {
  themeColor: "#f2ede4",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${anton.variable} ${archivo.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--fg)] focus:px-4 focus:py-2 focus:text-[var(--bg)]"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <MobileContactBar />
      </body>
    </html>
  );
}
