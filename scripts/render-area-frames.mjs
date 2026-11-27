// Renders the frame sequences that phones and machines without a GPU see in place of the
// live 3D arrival on the area pages (src/components/AreaHero.tsx). Run it against the dev
// server after changing AreaScene.tsx or ApartmentScene.tsx, then convert with
// scripts/area-frames-to-webp.py. Needs Playwright with Chromium (software WebGL is fine).
//
//   npx next dev -p 3100
//   node scripts/render-area-frames.mjs interior-design-mumbai 0.9 /tmp/frames/interior-design-mumbai
//   node scripts/render-area-frames.mjs interior-design-thane 1 /tmp/frames/interior-design-thane
//   node scripts/render-area-frames.mjs interior-design-navi-mumbai 1 /tmp/frames/interior-design-navi-mumbai
//   python3 scripts/area-frames-to-webp.py /tmp/frames public/images/areas
//
// Optional 4th argument "w" or "t" renders only the landscape or portrait set.
// <end> is arrivalEnd() from AreaHero.tsx (0.9 for the skyline, 1 for the apartment).
// N must match ARRIVAL_FRAMES.
import { createRequire } from 'node:module';
// Playwright is not a project dependency; resolve it from wherever it is installed.
const { chromium } = createRequire(import.meta.url)('playwright');
const N = 16;
(async () => {
  const [slug, end, outdir, only] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const [kind, W, H] of [['w', 1440, 890], ['t', 1024, 2200]].filter(([k]) => !only || only === k)) {
    const c = await b.newContext({ viewport: { width: W, height: H } });
    await c.addInitScript(() => {
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      for (const C of [WebGLRenderingContext, WebGL2RenderingContext]) {
        const g = C.prototype.getParameter;
        C.prototype.getParameter = function (x) { return x === 0x9246 ? 'ANGLE (Apple, M1)' : g.call(this, x); };
      }
    });
    const p = await c.newPage();
    await p.goto(`http://localhost:3100/${slug}`, { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: '[data-arrival-overlay]{display:none!important} nextjs-portal{display:none!important}' });
    await p.waitForTimeout(6000);
    for (let i = 0; i < N; i++) {
      const v = (i / (N - 1)) * +end;
      await p.evaluate((v) => {
        const s = document.querySelector('section[aria-labelledby=area-title]');
        const panel = s.firstElementChild;
        const top = parseFloat(getComputedStyle(panel).top);
        const travel = s.offsetHeight - panel.offsetHeight;
        window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY - top + v * travel);
      }, v);
      await p.waitForTimeout(i === 0 ? 3000 : 5000);
      await p.locator('section[aria-labelledby=area-title] [role=img]').screenshot({ path: `${outdir}/${kind}-${i}.png` });
      console.log(slug, kind, i);
    }
    await c.close();
  }
  await b.close();
})();
