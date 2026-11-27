// New Renofix logo (concept, 2026-11-27). The client asked for a new logo instead of the
// existing navy and orange one. The mark is a room drawn in plan: walls, a doorway and its
// door swing, i.e. the drawing every Renofix project starts from. The wordmark is set in
// the active variation's display face, so each variation shows its own version.

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      {/* walls, with a doorway left open on the bottom edge */}
      <path
        d="M14 37H3V3h34v34H26"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="square"
      />
      {/* interior wall */}
      <path d="M20 3v14" fill="none" stroke="currentColor" strokeWidth="4" />
      {/* door leaf and swing */}
      <path d="M26 37V25" fill="none" stroke="var(--accent)" strokeWidth="3" />
      <path d="M26 25a12 12 0 0 0-12 12" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-[var(--fg)]">
      <LogoMark className="h-8 w-8 shrink-0" />
      <span
        className={compact ? "hidden leading-none min-[440px]:inline" : "leading-none"}
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: "var(--display-weight)" as unknown as number,
          letterSpacing: "0.04em",
          fontSize: "1.45rem",
          textTransform: "uppercase",
        }}
      >
        Renofix
      </span>
    </span>
  );
}
