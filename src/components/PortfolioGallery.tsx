"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { categoryLabels, type Category, type Photo, type Project } from "@/lib/projects";

type Filter = Category | "all";
type Slide = { photo: Photo; project: Project; n: number; of: number };

function isCategory(v: string): v is Category {
  return v in categoryLabels;
}

export function PortfolioGallery({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  // only offer the categories that have projects
  const categories = useMemo(
    () => (Object.keys(categoryLabels) as Category[]).filter((c) => projects.some((p) => p.category === c)),
    [projects],
  );
  const shown = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.category === filter)),
    [filter, projects],
  );
  // every photo of the shown projects, in order, for the lightbox
  const slides = useMemo<Slide[]>(
    () =>
      shown.flatMap((project) => {
        const all = [project.cover, ...(project.photos ?? [])];
        return all.map((photo, i) => ({ photo, project, n: i + 1, of: all.length }));
      }),
    [shown],
  );

  // #kitchens selects a category; #project-slug shows all and scrolls to that project
  useEffect(() => {
    const apply = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      if (!h) return;
      if (isCategory(h)) setFilter(h);
      else if (projects.some((p) => p.slug === h)) {
        setFilter("all");
        requestAnimationFrame(() => document.getElementById(h)?.scrollIntoView({ block: "center" }));
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [projects]);

  const choose = (f: Filter) => {
    setFilter(f);
    const url = f === "all" ? window.location.pathname : `#${f}`;
    window.history.replaceState(null, "", url);
  };

  const show = (i: number, from: HTMLElement) => {
    opener.current = from;
    setOpen(i);
  };
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + slides.length) % slides.length)),
    [slides.length],
  );

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) {
      d.close();
      opener.current?.focus();
    }
  }, [open]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  };

  const slide = open === null ? null : slides[open];

  return (
    <>
      <div role="group" aria-label="Filter projects by category" className="mb-10 flex flex-wrap gap-2 md:mb-14">
        {(["all", ...categories] as Filter[]).map((f) => {
          const count = f === "all" ? projects.length : projects.filter((p) => p.category === f).length;
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={active}
              onClick={() => choose(f)}
              className={`min-h-11 border-2 px-4 py-2 font-semibold transition-colors ${
                active
                  ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]"
                  : "border-[var(--line)] hover:border-[var(--fg)]"
              }`}
            >
              {f === "all" ? "All" : categoryLabels[f]}
              <span className={active ? "ml-2 opacity-70" : "ml-2 text-[var(--muted)]"}>{count}</span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {shown.length} {shown.length === 1 ? "project" : "projects"} shown
      </p>

      <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => {
          const first = slides.findIndex((s) => s.project.slug === p.slug);
          const count = 1 + (p.photos?.length ?? 0);
          return (
            <li key={p.slug} id={p.slug} className="scroll-mt-28">
              <button
                type="button"
                onClick={(e) => show(first, e.currentTarget)}
                className="group block w-full text-left"
                aria-label={`${p.title}, ${categoryLabels[p.category]}. Open ${count > 1 ? `${count} photos` : "photo"}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface)]">
                  <Image
                    src={p.cover.src}
                    alt={p.cover.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  {count > 1 && (
                    <span className="absolute bottom-3 right-3 bg-[var(--bg)] px-2 py-1 text-sm font-semibold">
                      {count} photos
                    </span>
                  )}
                </div>
                <span className="mt-3 flex items-baseline justify-between gap-3">
                  <span className="text-lg font-semibold group-hover:text-[var(--accent)]">{p.title}</span>
                  <span className="shrink-0 text-sm text-[var(--muted)]">{categoryLabels[p.category]}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialog}
        onClose={close}
        onKeyDown={onKey}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        aria-label={slide ? `${slide.project.title}, photo ${slide.n} of ${slide.of}` : "Photo viewer"}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-[#141311] p-0 text-[#f2ede4] backdrop:bg-black/80"
      >
        {slide && (
          <div className="flex h-full flex-col">
            <div className="wrap flex items-center justify-between gap-4 py-3">
              <p className="flex min-w-0 items-baseline gap-3 font-semibold">
                <span className="min-w-0 truncate">{slide.project.title}</span>
                <span className="shrink-0 font-normal opacity-70">
                  {open! + 1} / {slides.length}
                </span>
              </p>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center hover:text-[var(--accent)]"
                aria-label="Close"
                autoFocus
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                  <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </button>
            </div>

            <div
              className="relative min-h-0 flex-1 touch-pan-y"
              onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
              onPointerUp={(e) => {
                const s = swipe.current;
                swipe.current = null;
                if (!s) return;
                const dx = e.clientX - s.x;
                if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y)) step(dx < 0 ? 1 : -1);
              }}
            >
              <Image
                key={slide.photo.src}
                src={slide.photo.src}
                alt={slide.photo.alt}
                fill
                sizes="100vw"
                className="select-none object-contain"
                draggable={false}
              />
            </div>

            <div className="wrap flex items-center justify-between gap-4 py-3">
              <button
                type="button"
                onClick={() => step(-1)}
                className="btn border-2 border-[#f2ede4] text-[#f2ede4] hover:bg-[#f2ede4] hover:text-[#141311]"
              >
                <span aria-hidden="true">←</span> Previous
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className="btn border-2 border-[#f2ede4] text-[#f2ede4] hover:bg-[#f2ede4] hover:text-[#141311]"
              >
                Next <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
