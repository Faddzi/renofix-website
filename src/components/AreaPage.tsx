import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ClosingCta } from "@/components/ClosingCta";
import { areaBySlug, areas } from "@/lib/areas";
import { contact, home, services, steps } from "@/lib/content";
import { categoryLabels, projects } from "@/lib/projects";

export function areaMetadata(slug: string): Metadata {
  const a = areaBySlug(slug);
  return {
    title: { absolute: `Interior designer in ${a.name} | Renofix` },
    description: a.description,
    alternates: { canonical: `/${a.slug}` },
    openGraph: { title: `Interior design and renovation in ${a.name} | Renofix`, description: a.description },
  };
}

export function AreaPage({ slug }: { slug: string }) {
  const a = areaBySlug(slug);
  const others = areas.filter((o) => o.slug !== slug);
  const work = projects.filter((p) => p.featured).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: "Renofix",
    url: `https://renofix.in/${a.slug}`,
    email: contact.email,
    telephone: [contact.priti.tel, contact.husain.tel],
    foundingDate: "2024",
    areaServed: { "@type": "City", name: a.name },
    sameAs: [contact.instagram.href],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section aria-labelledby="area-title">
        <div className="wrap flex flex-col gap-6 pb-16 pt-10 md:pb-24 md:pt-16">
          <h1 id="area-title" className="display max-w-[18ch] text-[clamp(2.8rem,8vw,6.5rem)]">
            {a.headline}
          </h1>
          <p className="max-w-[40rem] text-lg text-[var(--muted)] md:text-xl">{a.lead}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-primary">
              Book a free consultation
            </Link>
            <a href={`tel:${contact.priti.tel}`} className="btn btn-ghost">
              Call {contact.priti.display}
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="area-intro-title" className="border-t border-[var(--line)]">
        <div className="wrap grid gap-8 py-20 md:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <h2 id="area-intro-title" className="section-title">
            {home.introLead}
          </h2>
          <div className="prose-col flex flex-col gap-5 text-lg">
            {home.intro.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="area-services-title" className="bg-[var(--surface)]">
        <div className="wrap grid gap-8 py-20 md:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <h2 id="area-services-title" className="section-title">
            What we do
          </h2>
          <ul className="border-t border-[var(--line)]">
            {services.map((s) => (
              <li key={s.label} className="border-b border-[var(--line)] py-4 text-xl font-medium md:text-2xl">
                {s.category ? (
                  <Link href={`/portfolio#${s.category}`} className="hover:text-[var(--accent)]">
                    {s.label}
                  </Link>
                ) : (
                  s.label
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="area-work-title">
        <div className="wrap py-20 md:py-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-14">
            <h2 id="area-work-title" className="section-title">
              Our work
            </h2>
            <Link href="/portfolio" className="link-underline font-semibold">
              View the portfolio
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {work.map((p) => (
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

      <section aria-labelledby="area-how-title" className="border-t border-[var(--line)]">
        <div className="wrap grid gap-8 py-20 md:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <h2 id="area-how-title" className="section-title">
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

      <section aria-labelledby="area-why-title" className="bg-[var(--surface)]">
        <div className="wrap py-20 md:py-24">
          <h2 id="area-why-title" className="section-title mb-10 md:mb-14">
            Why choose us
          </h2>
          <ul className="grid grid-cols-1 border-l border-t border-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
            {home.whyChooseUs.map((item) => (
              <li key={item} className="flex min-h-32 items-end border-b border-r border-[var(--line)] p-6 md:p-8">
                <span className="display text-[clamp(1.8rem,3.2vw,2.6rem)]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <nav aria-label="Other areas we serve" className="border-t border-[var(--line)]">
        <div className="wrap flex flex-wrap items-baseline gap-x-6 gap-y-2 py-10 text-lg">
          <span className="text-[var(--muted)]">Also in</span>
          {others.map((o) => (
            <Link key={o.slug} href={`/${o.slug}`} className="link-underline font-semibold">
              {o.name}
            </Link>
          ))}
        </div>
      </nav>

      <ClosingCta />
    </>
  );
}
