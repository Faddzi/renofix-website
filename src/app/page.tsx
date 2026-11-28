import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { ClosingCta } from "@/components/ClosingCta";
import { contact, home, services, steps, testimonials } from "@/lib/content";
import { categoryLabels, projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: { absolute: "Renofix | Interior design and renovation in Mumbai" },
  description:
    "Interior design and renovation in Mumbai, Thane and Navi Mumbai: modular kitchens, ceiling designs, bathroom renovations and complete home interiors. Book a free consultation.",
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: "Renofix",
  url: "https://renofix.in",
  email: contact.email,
  telephone: [contact.priti.tel, contact.husain.tel],
  foundingDate: "2024",
  areaServed: [
    { "@type": "City", name: "Mumbai" },
    { "@type": "City", name: "Thane" },
    { "@type": "City", name: "Navi Mumbai" },
  ],
  sameAs: [contact.instagram.href],
};

export default function HomePage() {
  const featured = projects.filter((p) => p.featured).slice(0, 6);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero />

      {/* Statement */}
      <section aria-label="Statement" className="bg-[var(--fg)] text-[var(--bg)]">
        <div className="wrap py-20 md:py-28">
          <p className="display text-[clamp(3rem,11vw,9.5rem)]">{home.statement}</p>
        </div>
      </section>

      {/* Introduction */}
      <section aria-labelledby="intro-title">
        <div className="wrap grid gap-8 py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <h2 id="intro-title" className="section-title">
            {home.introLead}
          </h2>
          <div className="prose-col flex flex-col gap-5 text-lg">
            {home.intro.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* What we do */}
      <section aria-labelledby="services-title" className="border-t border-[var(--line)]">
        <div className="wrap grid gap-8 py-20 md:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <h2 id="services-title" className="section-title">
            What we do
          </h2>
          <ul className="border-t border-[var(--line)]">
            {services.map((s) => (
              <li key={s.label} className="border-b border-[var(--line)]">
                {s.category ? (
                  <Link
                    href={`/portfolio#${s.category}`}
                    className="group flex items-center justify-between gap-4 py-4 text-xl font-medium md:text-2xl"
                  >
                    <span className="group-hover:text-[var(--accent)]">{s.label}</span>
                    <span className="text-sm text-[var(--muted)] group-hover:text-[var(--accent)]">
                      See {categoryLabels[s.category as keyof typeof categoryLabels]}
                      <span aria-hidden="true"> →</span>
                    </span>
                  </Link>
                ) : (
                  <span className="block py-4 text-xl font-medium md:text-2xl">{s.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why choose us */}
      <section aria-labelledby="why-title" className="bg-[var(--surface)]">
        <div className="wrap py-20 md:py-24">
          <h2 id="why-title" className="section-title mb-10 md:mb-14">
            Why choose us
          </h2>
          <ul className="grid grid-cols-1 border-l border-t border-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
            {home.whyChooseUs.map((item) => (
              <li
                key={item}
                className="flex min-h-36 items-end border-b border-r border-[var(--line)] p-6 md:min-h-44 md:p-8"
              >
                <span className="display text-[clamp(1.9rem,3.4vw,2.9rem)]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Featured work */}
      <section aria-labelledby="work-title">
        <div className="wrap py-20 md:py-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-14">
            <h2 id="work-title" className="section-title">
              Featured work
            </h2>
            <Link href="/portfolio" className="link-underline font-semibold">
              View the portfolio
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <li key={p.slug}>
                <Link href={`/portfolio#${p.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface)]">
                    <Image
                      src={p.cover.src}
                      alt={p.cover.alt}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-3">
                    <span className="text-lg font-semibold group-hover:text-[var(--accent)]">{p.title}</span>
                    <span className="shrink-0 text-sm text-[var(--muted)]">{categoryLabels[p.category]}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How we work */}
      <section aria-labelledby="how-title" className="border-t border-[var(--line)]">
        <div className="wrap grid gap-8 py-20 md:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <h2 id="how-title" className="section-title">
            How we work
          </h2>
          <ol className="border-t border-[var(--line)]">
            {steps.map((step, i) => (
              <li key={step} className="flex items-baseline gap-6 border-b border-[var(--line)] py-4">
                <span className="w-8 shrink-0 font-semibold tabular-nums text-[var(--accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xl font-medium md:text-2xl">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Testimonials: real client quotes only. One featured quote per card. */}
      <section aria-labelledby="testimonials-title" className="bg-[var(--surface)]">
        <div className="wrap py-20 md:py-24">
          <h2 id="testimonials-title" className="section-title mb-10 md:mb-14">
            Testimonials
          </h2>
          <ul className="grid gap-12">
            {testimonials.map((t) => (
              <li key={t.name}>
                <figure className="grid gap-6 border-l-4 border-[var(--accent)] pl-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12 md:pl-10">
                  <p
                    aria-hidden="true"
                    className="font-[family-name:var(--font-display)] text-4xl uppercase leading-[1.05] md:text-6xl"
                  >
                    &ldquo;{t.highlight}&rdquo;
                  </p>
                  <div className="flex flex-col gap-6">
                    <blockquote className="prose-col text-lg">
                      <p>&ldquo;{t.quote}&rdquo;</p>
                    </blockquote>
                    <figcaption className="text-sm">
                      <span className="font-semibold">{t.name}</span>
                      <span className="text-[var(--muted)]"> · {t.project}</span>
                    </figcaption>
                  </div>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Mission and vision */}
      <section aria-label="Mission and vision">
        <div className="wrap grid gap-12 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="flex flex-col gap-4">
            <h2 className="section-title">Our Mission</h2>
            <p className="prose-col text-lg">{home.mission}</p>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="section-title">Our Vision</h2>
            <p className="prose-col text-lg">{home.vision}</p>
          </div>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
