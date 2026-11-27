import type { Metadata } from "next";
import { ClosingCta } from "@/components/ClosingCta";
import { PortfolioGallery } from "@/components/PortfolioGallery";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Renofix projects in Mumbai, Thane and Navi Mumbai: modular kitchens, false ceilings, bathroom renovations, full home interiors and commercial fit-outs.",
  alternates: { canonical: "/portfolio" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Renofix portfolio",
  url: "https://renofix.in/portfolio",
  hasPart: projects.map((p) => ({
    "@type": "ImageObject",
    name: p.title,
    contentUrl: `https://renofix.in${p.cover.src}`,
    description: p.cover.alt,
  })),
};

export default function PortfolioPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section aria-labelledby="portfolio-title">
        <div className="wrap pb-20 pt-10 md:pb-28 md:pt-16">
          <h1 id="portfolio-title" className="display mb-8 text-[clamp(3rem,10vw,7.5rem)] md:mb-12">
            Portfolio
          </h1>
          <PortfolioGallery projects={projects} />
        </div>
      </section>
      <ClosingCta />
    </>
  );
}
