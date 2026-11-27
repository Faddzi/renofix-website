import Link from "next/link";
import { contact } from "@/lib/content";
import { Logo } from "./Logo";
import { nav } from "@/lib/nav";
import { areas } from "@/lib/areas";

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface)] pb-24 lg:pb-0">
      <div className="wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] md:py-16">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="text-[var(--muted)]">{contact.since}</p>
        </div>

        <div>
          <h2 className="mb-3 font-semibold">Contact</h2>
          <ul className="flex flex-col gap-2">
            <li>
              {contact.priti.label}:{" "}
              <a className="link-underline" href={`tel:${contact.priti.tel}`}>
                {contact.priti.display}
              </a>
            </li>
            <li>
              {contact.husain.label}:{" "}
              <a className="link-underline" href={`tel:${contact.husain.tel}`}>
                {contact.husain.display}
              </a>
            </li>
            <li>
              <a className="link-underline" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </li>
            <li>
              Instagram:{" "}
              <a className="link-underline" href={contact.instagram.href} target="_blank" rel="noopener noreferrer">
                {contact.instagram.handle}
              </a>
            </li>
          </ul>
        </div>

        <nav aria-label="Areas we serve">
          <h2 className="mb-3 font-semibold">Areas we serve</h2>
          <ul className="flex flex-col gap-2">
            {areas.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/${a.slug}`}
                  title={`Interior design and renovation in ${a.name}`}
                  className="group inline-flex items-baseline gap-2 hover:text-[var(--accent)]"
                >
                  {a.name}
                  <span aria-hidden="true" className="text-[var(--muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Footer">
          <h2 className="mb-3 font-semibold">Pages</h2>
          <ul className="flex flex-col gap-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link className="link-underline" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-[var(--line)]">
        <p className="wrap py-5 text-sm text-[var(--muted)]">
          Developed &amp; maintained by{" "}
          <a className="link-underline" href="https://seven72.com/?ref=renofix" target="_blank" rel="noopener">
            seven72.com
          </a>
        </p>
      </div>
    </footer>
  );
}
