// Decides whether a 3D scene may run. The 3D moments are an enhancement: phones, tablets,
// low-power machines, data savers and reduced-motion users get the static render instead,
// as the PRD requires. Phones are excluded outright: mobile Chrome can kill the whole tab
// when a WebGL scene uses too much memory, which shows as "This page couldn't load".

// scrollLinked: the scene only moves while the visitor scrolls (nothing plays on its own), so it
// may run with reduced motion on. Windows turns that setting on whenever animation effects
// are off, which would otherwise hide the area-page scenes from most Windows laptops.
export function canRun3D({ scrollLinked = false }: { scrollLinked?: boolean } = {}): boolean {
  if (typeof window === "undefined") return false;
  const mq = (q: string) => window.matchMedia(q).matches;
  if (!scrollLinked && mq("(prefers-reduced-motion: reduce)")) return false;
  // touch-first devices (phones, tablets) and small screens
  if (!mq("(pointer: fine)") || !mq("(hover: hover)")) return false;
  if (window.innerWidth < 1024) return false;

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };
  if (nav.connection?.saveData) return false;
  if (nav.connection?.effectiveType && /(^|-)2g$|^3g$/.test(nav.connection.effectiveType)) return false;
  if ((nav.hardwareConcurrency ?? 8) <= 4) return false;
  if ((nav.deviceMemory ?? 8) < 4) return false;

  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    // software renderers (no GPU) are too slow for the scenes
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    if (/swiftshader|llvmpipe|software/i.test(renderer)) return false;
    return true;
  } catch {
    return false;
  }
}
