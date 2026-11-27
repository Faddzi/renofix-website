"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { home } from "@/lib/content";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

// Static render of the same 3D scene: shown first, kept on low-power devices,
// with reduced motion, or when WebGL is unavailable.
const STATIC_RENDER = "/images/hero-render-living-room.jpg";
const REAL_PHOTO = "/images/living-room-feature-wall-01.jpg";

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

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [use3D, setUse3D] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [progress, setProgress] = useState(0);
  // Read every frame by the 3D scene, so the build follows the scroll without re-rendering React.
  const progressRef = useRef(0);

  useEffect(() => {
    // Load the 3D scene only once the page is idle, so it never delays the headline or photos.
    const start = () => setUse3D(canRun3D());
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (ric) ric(start);
    else setTimeout(start, 300);
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const s = section.current;
      const f = frame.current;
      if (!s || !f) return;
      const vh = window.innerHeight;
      const sr = s.getBoundingClientRect();
      let p: number;
      if (sr.height > vh * 1.2) {
        // desktop: the hero is pinned while the room builds itself and turns into the real room
        p = -sr.top / (sr.height - vh);
      } else {
        // phones: build as the frame moves up through the screen
        const fr = f.getBoundingClientRect();
        p = (vh * 0.7 - fr.top) / (vh * 0.6);
      }
      p = Math.min(1, Math.max(0, p));
      progressRef.current = p;
      setProgress(p);
      window.dispatchEvent(new Event("renofix-hero-pointer"));
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
  }, []);

  // The 3D build uses the first ~60% of the progress; the real photo fades in after it.
  // Without 3D, the static render simply crossfades into the photo.
  const blend = use3D
    ? Math.min(1, Math.max(0, (progress - 0.68) / 0.24))
    : Math.min(1, Math.max(0, (progress - 0.15) / 0.6));

  return (
    <section ref={section} aria-labelledby="hero-title" className="relative lg:h-[260vh]">
      <div className="lg:sticky lg:top-20 lg:flex lg:h-[calc(100dvh-5rem)] lg:items-center">
        <div className="wrap grid gap-8 pb-12 pt-8 md:pt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12 lg:py-0">
          <div className="flex min-w-0 flex-col gap-6">
            <h1 id="hero-title" className="display text-[clamp(2.9rem,8.4vw,4.6rem)] lg:text-[clamp(3.4rem,5vw,5.6rem)]">
              {home.heroHeadline}
            </h1>
            <p className="max-w-[30rem] text-lg text-[var(--muted)] md:text-xl">{home.heroSupporting}</p>
            <div>
              <Link href="/contact" className="btn btn-primary">
                Book a free consultation
              </Link>
            </div>
          </div>

          <div
            ref={frame}
            className="relative aspect-[16/9] w-full min-w-0 overflow-hidden bg-[var(--hero-ground)]"
            role="img"
            aria-label="A 3D render of a Renofix living room that builds itself piece by piece and then becomes a photo of the same room after it was built"
          >
            <Image
              src={STATIC_RENDER}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
            {use3D && (
              <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: sceneReady ? 1 : 0 }}
              >
                <HeroScene progress={progressRef} onReady={() => setSceneReady(true)} />
              </div>
            )}
            <Image
              src={REAL_PHOTO}
              alt=""
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="pointer-events-none object-cover"
              style={{ opacity: blend }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
