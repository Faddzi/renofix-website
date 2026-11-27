import { contact, getInTouch } from "@/lib/content";

export function ClosingCta() {
  return (
    <section aria-labelledby="cta-title" className="bg-[var(--accent)] text-[var(--on-accent)]">
      <div className="wrap flex flex-col gap-8 py-20 md:py-24 lg:flex-row lg:items-end lg:justify-between">
        <h2 id="cta-title" className="display max-w-[16ch] text-[clamp(2.6rem,7vw,5.5rem)]">
          {getInTouch.freeConsultation}
        </h2>
        <div className="flex flex-wrap gap-3">
          <a
            href={`tel:${contact.priti.tel}`}
            className="btn border-2 border-[var(--on-accent)] bg-[var(--on-accent)] text-[var(--accent)] hover:bg-transparent hover:text-[var(--on-accent)]"
          >
            Call {contact.priti.display}
          </a>
          <a
            href={contact.whatsapp.href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn border-2 border-[var(--on-accent)] text-[var(--on-accent)] hover:bg-[var(--on-accent)] hover:text-[var(--accent)]"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
