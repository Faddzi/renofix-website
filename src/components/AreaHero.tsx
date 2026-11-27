"use client";

// Arrival at the top of each area page. A pinned, full-width panel that plays a 3D scene as
// the visitor scrolls: Mumbai dives from the night skyline into one lit window, Thane watches
// an apartment rise from its floor plan and furnish itself, and Navi Mumbai watches a modular
// kitchen assemble itself from an exploded drawing.
//
// Desktops with a real GPU get the live scene. Phones, tablets and low-power machines get the
// same flight as a short sequence of frames rendered from the scene
// (public/images/areas/<slug>/), crossfaded and zoomed with the scroll, so the moment still
// lands without WebGL. Everything here moves only while the visitor scrolls, so it also runs
// with reduced motion on (Windows sets it whenever animation effects are off); reduced motion
// only drops the zoom on the frames.

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { canRun3D } from "@/lib/canRun3D";
import { contact } from "@/lib/content";
import type { Area } from "@/lib/areas";

const SkylineScene = dynamic(() => import("./AreaScene"), { ssr: false });
const ApartmentScene = dynamic(() => import("./ApartmentScene"), { ssr: false });
const KitchenScene = dynamic(() => import("./KitchenScene"), { ssr: false });

export const ARRIVAL_FRAMES = 16;
// The skyline flight finishes at 90% of the scroll and holds; the apartment uses all of it.
export const arrivalEnd = (arrival: Area["arrival"]) => (arrival === "skyline" ? 0.9 : 1);
const frameSrc = (slug: string, kind: "w" | "t", i: number) => `/images/areas/${slug}/${kind}-${i}.webp`;

export function AreaHero({ area }: { area: Area }) {
  const section = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [use3D, setUse3D] = useState(false);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    const start = () => setUse3D(canRun3D({ scrollLinked: true }));
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (ric) ric(start);
    else setTimeout(start, 300);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const s = section.current;
      const p = panel.current;
      if (!s || !p) return;
      const top = parseFloat(getComputedStyle(p).top) || 0;
      const sr = s.getBoundingClientRect();
      const travel = sr.height - p.offsetHeight;
      const v = travel > 1 ? Math.min(1, Math.max(0, (top - sr.top) / travel)) : 1;
      progressRef.current = v;
      setProgress(v);
      window.dispatchEvent(new Event("renofix-area-redraw"));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  // Frame sequence: frame i was rendered at progress i / (N - 1) * arrivalEnd.
  const end = arrivalEnd(area.arrival);
  const f = Math.min(1, progress / end) * (ARRIVAL_FRAMES - 1);
  const base = Math.min(ARRIVAL_FRAMES - 1, Math.floor(f));
  const mix = f - base;
  const skyline = area.arrival === "skyline";
  const kitchen = area.arrival === "kitchen";
  const showFrames = !use3D || !ready;

  return (
    <section
      ref={section}
      aria-labelledby="area-title"
      className={`relative h-[240vh] ${skyline ? "bg-[#0b1426]" : kitchen ? "bg-[#191714]" : "bg-[#1f3550]"} text-white`}
    >
      <div
        ref={panel}
        className="sticky top-16 h-[calc(100svh-4rem)] min-h-[34rem] overflow-hidden md:top-20 md:h-[calc(100svh-5rem)]"
      >
        <div
          className="absolute inset-0"
          role="img"
          aria-label={
            skyline
              ? `A 3D flight over ${area.name} at dusk, down into the lit window of a finished Renofix living room`
              : kitchen
                ? `A 3D exploded drawing of a modular kitchen that assembles itself, piece by piece, in a ${area.name} home`
                : `A 3D floor plan of a ${area.name} apartment that rises into walls and furnishes itself, room by room`
          }
        >
          {showFrames &&
            [base, base + 1].map((i, k) =>
              i < ARRIVAL_FRAMES ? (
                <picture key={i}>
                  <source media="(min-aspect-ratio: 1/1)" srcSet={frameSrc(area.slug, "w", i)} />
                  <img
                    src={frameSrc(area.slug, "t", i)}
                    alt=""
                    decoding="async"
                    fetchPriority={i === 0 ? "high" : "auto"}
                    className={`absolute inset-0 h-full w-full object-cover ${
                      skyline ? "origin-[50%_28%] [@media(min-aspect-ratio:1/1)]:origin-[72%_45%]" : "origin-center"
                    }`}
                    style={{
                      opacity: k === 0 ? 1 : mix,
                      transform: `scale(${k === 0 && !reduced ? 1 + mix * (skyline ? 0.14 : 0.04) : 1})`,
                    }}
                  />
                </picture>
              ) : null,
            )}
          {/* warm the browser cache for the next frames */}
          {showFrames && (
            <div hidden>
              {[base + 2, base + 3].filter((i) => i < ARRIVAL_FRAMES).map((i) => (
                <picture key={i}>
                  <source media="(min-aspect-ratio: 1/1)" srcSet={frameSrc(area.slug, "w", i)} />
                  <img src={frameSrc(area.slug, "t", i)} alt="" loading="eager" />
                </picture>
              ))}
            </div>
          )}
          {use3D && (
            <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
              {skyline ? (
                <SkylineScene
                  look="sea"
                  seed={7}
                  photo={area.photo?.src ?? "/images/living-dining-open-plan-01.jpg"}
                  progress={progressRef}
                  onReady={() => setReady(true)}
                  onLost={() => setUse3D(false)}
                />
              ) : kitchen ? (
                <KitchenScene progress={progressRef} onReady={() => setReady(true)} onLost={() => setUse3D(false)} />
              ) : (
                <ApartmentScene
                  plan={area.slug === "interior-design-thane" ? "2bhk" : "3bhk"}
                  progress={progressRef}
                  onReady={() => setReady(true)}
                  onLost={() => setUse3D(false)}
                />
              )}
            </div>
          )}
        </div>

        {/* keeps the headline readable over the scene */}
        <div
          data-arrival-overlay
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b1426]/90 via-[#0b1426]/35 to-transparent [@media(min-aspect-ratio:1/1)]:bg-gradient-to-r [@media(min-aspect-ratio:1/1)]:from-[#0b1426]/85 [@media(min-aspect-ratio:1/1)]:via-[#0b1426]/30 [@media(min-aspect-ratio:1/1)]:via-45%"
        />

        <div data-arrival-overlay className="pointer-events-none absolute inset-0 flex items-end [@media(min-aspect-ratio:1/1)]:items-center">
          <div className="wrap pb-20 lg:pb-0">
            <div className="pointer-events-auto flex max-w-[34rem] flex-col gap-5">
              <h1 id="area-title" className="display text-[clamp(2.6rem,6.4vw,5.2rem)]">
                {area.headline}
              </h1>
              <p className="text-lg text-white/85 md:text-xl">{area.lead}</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/contact" className="btn btn-primary">
                  Book a free consultation
                </Link>
                <a
                  href={`tel:${contact.priti.tel}`}
                  className="btn border-2 border-white text-white hover:bg-white hover:text-[#0b1426]"
                >
                  Call {contact.priti.display}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div
          data-arrival-overlay
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 right-6 hidden items-center gap-3 text-sm font-semibold text-white/70 lg:flex"
          style={{ opacity: Math.max(0, 1 - progress * 5) }}
        >
          Scroll
          <span className="block h-px w-10 bg-white/60" />
        </div>
      </div>
    </section>
  );
}
