import type { Metadata } from "next";
import { ClosingCta } from "@/components/ClosingCta";
import { Founders } from "@/components/Founders";
import { about } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet the founders of Renofix: Priti Kumawat leads design and planning, and Husain Electricwala leads site execution and material quality.",
  alternates: { canonical: "/about" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: "https://renofix.in/about",
  mainEntity: {
    "@type": "HomeAndConstructionBusiness",
    name: "Renofix",
    url: "https://renofix.in",
    foundingDate: "2024",
    founder: about.founders.map((f) => ({
      "@type": "Person",
      name: f.name.replace(/^(Ms|Mr)\. /, ""),
      jobTitle: f.role,
    })),
  },
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Founders />

      <section aria-label="Founder biographies" className="border-t border-[var(--line)]">
        <div className="wrap grid gap-14 py-20 md:py-28 lg:grid-cols-2 lg:gap-16">
          {about.founders.map((f) => (
            <article key={f.id} aria-labelledby={`${f.id}-name`} className="flex min-w-0 flex-col gap-5">
              <div
                aria-hidden="true"
                className="h-2 w-16"
                style={{ background: f.id === "priti" ? "#1f3550" : "var(--accent)" }}
              />
              <div>
                <h2 id={`${f.id}-name`} className="section-title">
                  {f.name}
                </h2>
                <p className="mt-2 text-lg font-semibold text-[var(--muted)]">{f.role}</p>
              </div>
              <p className="prose-col text-lg">{f.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
