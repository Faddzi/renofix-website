"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { about } from "@/lib/content";

const FounderScene = dynamic(() => import("./FounderScene"), { ssr: false });

// Static render of the scene at the half-and-half state: shown first, and kept on
// low-power devices, with reduced motion, or without WebGL.
const STATIC_RENDER = "/images/about-render-split.jpg";

function canRun3D() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return false;
  if ((nav.hardwareConcurrency ?? 8) <= 4) return false;
  if ((nav.deviceMemory ?? 8) <= 2) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const [priti, husain] = about.founders;

export function Founders() {
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const split = useRef(0.5);
  const pointer = useRef({ x: 0, y: 0 });
  const invalidate = useRef<() => void>(() => {});
  const [use3D, setUse3D] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [splitPos, setSplitPos] = useState(0.5);
  const [active, setActive] = useState<"priti" | "husain" | null>(null);

  useEffect(() => {
    const start = () => setUse3D(canRun3D());
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (ric) ric(start);
    else setTimeout(start, 300);
  }, []);

  // Scroll moves the split from all blueprint to half blueprint, half built.
  useEffect(() => {
    if (!use3D) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const s = section.current;
      const f = frame.current;
      if (!s || !f) return;
      const vh = window.innerHeight;
      const sr = s.getBoundingClientRect();
      let p: number;
      if (sr.height > vh * 1.2) p = -sr.top / ((sr.height - vh) * 0.75);
      else {
        const fr = f.getBoundingClientRect();
        p = (vh * 0.85 - fr.top) / (vh * 0.5);
      }
      p = Math.min(1, Math.max(0, p));
      const eased = p * p * (3 - 2 * p);
      const next = 1 - eased * 0.5;
      split.current = next;
      setSplitPos(next);
      invalidate.current();
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
  }, [use3D]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    pointer.current.x = x * 2 - 1;
    pointer.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (e.pointerType === "mouse") setActive(x < split.current ? "priti" : "husain");
    invalidate.current();
  };
  const onLeave = () => {
    pointer.current.x = 0;
    pointer.current.y = 0;
    setActive(null);
    invalidate.current();
  };
  const onTap = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const side = (e.clientX - r.left) / r.width < split.current ? "priti" : "husain";
    setActive((a) => (a === side ? null : side));
  };

  const onReady = useCallback((inv: () => void) => {
    invalidate.current = inv;
    inv();
    setSceneReady(true);
  }, []);

  const shown = use3D ? splitPos : 0.5;
  const line = active === "priti" ? priti.sceneLine : active === "husain" ? husain.sceneLine : null;

  return (
    <section ref={section} aria-labelledby="founders-title" className={use3D ? "relative lg:h-[170vh]" : "relative"}>
      <div className="lg:sticky lg:top-20 lg:flex lg:h-[calc(100dvh-5rem)] lg:flex-col">
        <div className="wrap flex w-full flex-col gap-6 pb-10 pt-8 md:pt-12 lg:min-h-0 lg:flex-1 lg:pb-8">
          <h1 id="founders-title" className="display text-[clamp(3rem,10vw,7.5rem)]">
            {about.heading}
          </h1>

          <div
            ref={frame}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            onPointerUp={onTap}
            className="relative aspect-[4/3] w-full min-w-0 select-none overflow-hidden bg-[var(--hero-ground)] sm:aspect-[16/9] lg:aspect-auto lg:min-h-[20rem] lg:flex-1"
            role="img"
            aria-label="One modular kitchen shown half as a design blueprint and half as the finished build"
          >
            <Image src={STATIC_RENDER} alt="" fill priority sizes="(min-width: 88rem) 84rem, 100vw" className="object-cover" />
            {use3D && (
              <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: sceneReady ? 1 : 0 }}>
                <FounderScene split={split} pointer={pointer} onReady={onReady} />
              </div>
            )}

            {/* split line */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-[2px] bg-[var(--accent)]"
              style={{ left: `calc(${shown * 100}% - 1px)`, opacity: shown > 0.995 ? 0 : 1 }}
            />

            {/* founder names on their halves */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between gap-3 p-3 sm:p-5">
              <span
                className="bg-[#1f3550] px-2.5 py-1.5 text-sm font-semibold text-[#e8eef5] sm:text-base"
                style={{ outline: active === "priti" ? "2px solid #e8eef5" : "none" }}
              >
                {priti.name.replace(/^Ms\. /, "")}, {priti.role}
              </span>
              <span
                className="bg-[var(--fg)] px-2.5 py-1.5 text-sm font-semibold text-[var(--bg)] sm:text-base"
                style={{
                  outline: active === "husain" ? "2px solid var(--accent)" : "none",
                  opacity: shown > 0.97 ? 0 : 1,
                }}
              >
                {husain.name.replace(/^Mr\. /, "")}, {husain.role}
              </span>
            </div>

            {/* hover line, quoted from the bio */}
            {line && (
              <p
                aria-hidden="true"
                className={`pointer-events-none absolute top-3 max-w-[min(26rem,80%)] bg-[var(--bg)] px-4 py-3 text-base leading-snug text-[var(--fg)] shadow-[0_1px_0_var(--line)] sm:top-5 sm:text-lg ${
                  active === "priti" ? "left-3 sm:left-5" : "right-3 sm:right-5"
                }`}
              >
                {line}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
