import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap flex flex-col items-start gap-6 py-24 md:py-32">
      <p className="display text-[clamp(5rem,18vw,12rem)] text-[var(--accent)]">404</p>
      <h1 className="section-title">Page not found</h1>
      <Link href="/" className="btn btn-primary">
        Back to Home
      </Link>
    </section>
  );
}
