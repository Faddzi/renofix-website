"use client";

import { useRef, useState } from "react";

type Props = {
  src: string;
  poster: string;
  captions: string;
  name: string;
  project: string;
  duration: string;
};

// Portrait client video in a framed panel. Shows the poster with a large play
// button; the native controls appear only once it is playing.
export function TestimonialVideo({ src, poster, captions, name, project, duration }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  function play() {
    setStarted(true);
    void ref.current?.play();
  }

  return (
    <figure className="flex h-full flex-col bg-[var(--fg)]">
      <div className="relative aspect-[3/4] w-full overflow-hidden md:aspect-auto md:min-h-0 md:flex-1">
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          controls={started}
          playsInline
          preload="none"
          poster={poster}
          aria-label={`Video testimonial from ${name}`}
        >
          <source src={src} type="video/mp4" />
          <track kind="captions" src={captions} srcLang="en" label="English" default />
        </video>
        {!started && (
          <button
            type="button"
            onClick={play}
            className="group absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/45 via-transparent to-transparent"
            aria-label={`Play video testimonial from ${name}`}
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] shadow-lg transition-transform group-hover:scale-105 group-focus-visible:scale-105">
              <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8" fill="currentColor" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <figcaption className="flex items-center justify-between gap-4 px-5 py-4 text-sm text-[var(--bg)]">
        <span>
          <span className="font-semibold">{name}</span>
          <span className="opacity-70"> · {project}</span>
        </span>
        <span className="shrink-0 opacity-70">
          {duration}
          <span className="hidden sm:inline"> · English captions</span>
        </span>
      </figcaption>
    </figure>
  );
}
