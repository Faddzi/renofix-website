import type { Metadata } from "next";
import { EnquiryForm } from "@/components/EnquiryForm";
import { contact, getInTouch } from "@/lib/content";

export const metadata: Metadata = {
  title: "Get in Touch",
  description:
    "Book a free consultation with Renofix. Call, WhatsApp or email us, or share your space, requirements and timeline and we will respond within 24 hours.",
  alternates: { canonical: "/contact" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  url: "https://renofix.in/contact",
  mainEntity: {
    "@type": "HomeAndConstructionBusiness",
    name: "Renofix",
    email: contact.email,
    telephone: [contact.priti.tel, contact.husain.tel],
  },
};

const ways = [
  { label: "Call Priti", value: contact.priti.display, href: `tel:${contact.priti.tel}` },
  { label: "Call Husain", value: contact.husain.display, href: `tel:${contact.husain.tel}` },
  { label: "WhatsApp", value: contact.whatsapp.display, href: contact.whatsapp.href, external: true },
  { label: "Email", value: contact.email, href: `mailto:${contact.email}` },
  { label: "Instagram", value: contact.instagram.handle, href: contact.instagram.href, external: true },
];

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section aria-labelledby="contact-title">
        <div className="wrap pb-20 pt-10 md:pb-28 md:pt-16">
          <h1 id="contact-title" className="display max-w-[14ch] text-[clamp(3rem,9vw,7rem)]">
            {getInTouch.heading}
          </h1>
          <p className="prose-col mt-8 text-lg md:text-xl">{getInTouch.intro}</p>

          <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-16">
            <EnquiryForm />

            <aside aria-label="Other ways to reach us" className="lg:border-l lg:border-[var(--line)] lg:pl-12">
              <ul className="border-t border-[var(--line)]">
                {ways.map((w) => (
                  <li key={w.label} className="border-b border-[var(--line)]">
                    <a
                      href={w.href}
                      {...(w.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="group flex flex-col gap-0.5 py-4"
                    >
                      <span className="text-[var(--muted)]">{w.label}</span>
                      <span className="break-words text-xl font-semibold group-hover:text-[var(--accent)]">{w.value}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[var(--muted)]">{contact.serviceArea}</p>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
