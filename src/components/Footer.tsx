import Link from "next/link";
import { contact } from "@/lib/content";
import { Logo } from "./Logo";
import { nav } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface)] pb-24 lg:pb-0">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr] md:py-16">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="text-[var(--muted)]">
            {contact.serviceArea}
            <br />
            {contact.since}
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Contact</h2>
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

        <nav aria-label="Footer">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Pages</h2>
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
