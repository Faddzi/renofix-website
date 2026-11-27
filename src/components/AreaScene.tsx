"use client";

// Area landing page arrival: the city at dusk, seen from the air. As the visitor scrolls,
// the camera swoops down across the rooftops to one tower and into a single lit window,
// where a finished Renofix room is waiting. The page then fades to the real photo of it.
//
// Everything is plain geometry and one small shader: hundreds of towers are a single
// instanced mesh whose windows are drawn by the shader from world position, so the
// scene stays cheap. Each area gets its own layout: Mumbai has the sea and a curved
// lit promenade, Thane has the hills behind and a lake, Navi Mumbai has a wide planned
// grid with the creek behind. Units are loosely "metres / 3".

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type AreaLook = "sea" | "hills" | "grid";

type Progress = React.MutableRefObject<number>;

const SKY_TOP = new THREE.Color("#0b1426");
const SKY_MID = new THREE.Color("#243457");
const SKY_LOW = new THREE.Color("#e58a58");
const FOG = new THREE.Color("#3a3756");
// The custom shaders write their colour straight to the screen (no output conversion), so
// the fog colour they blend to must be the display value of the fog the built-in materials use.
const FOG_OUT = FOG.clone().convertLinearToSRGB();

// The tower the camera flies into, and its one special window (front face, facing +z).
const TOWER = { x: 0, z: 0, w: 3.2, d: 3.2, h: 17 };
const WIN = { y: 9.2, w: 1.24, h: 0.66 };
const WIN_Z = TOWER.z + TOWER.d / 2 + 0.012;

// Camera flight, sampled by scroll progress. The last two points depend on the screen's
// shape: the flight ends with the window filling a good part of the frame, to the right of
// the headline on wide screens and above it on tall ones.
function flightPath(aspect: number) {
  const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const wide = aspect >= 1.15;
  const endD = wide ? 1.65 : Math.max(1.6, WIN.w / 0.9 / (2 * tan * aspect));
  const visH = 2 * tan * endD;
  const visW = visH * aspect;
  const off = wide ? { x: 0.22 * visW, y: 0.05 * visH } : { x: 0, y: 0.22 * visH };
  const path = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-34, 27, 46),
      new THREE.Vector3(-17, 20, 30),
      new THREE.Vector3(-5, 13.5, 15),
      new THREE.Vector3(-0.6 - off.x, 10, 6 + endD),
      new THREE.Vector3(-off.x, WIN.y - off.y + 0.05, WIN_Z + endD + 1.6),
      new THREE.Vector3(-off.x, WIN.y - off.y, WIN_Z + endD),
    ],
    false,
    "centripetal",
  );
  const lookTo = new THREE.Vector3(TOWER.x - off.x, WIN.y - off.y, WIN_Z);
  return { path, lookTo };
}
const FOV = 42;
const LOOK_FROM = new THREE.Vector3(-2, 5, -18);

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// gentle ease: the path gives the close approach as much time as the long descent
const ease = (t: number) => t * t * (3 - 2 * t);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// ---------------------------------------------------------------------------------------
// Towers: one instanced box, windows drawn in the fragment shader.

const towerVert = /* glsl */ `
  attribute float aSeed;
  attribute float aLit;
  varying vec3 vWorld;
  varying vec3 vN;
  varying float vDepth;
  varying float vSeed;
  varying float vLit;
  void main() {
    mat4 m = modelMatrix;
    #ifdef USE_INSTANCING
      m = m * instanceMatrix;
    #endif
    vec4 wp = m * vec4(position, 1.0);
    vWorld = wp.xyz;
    vN = normalize(mat3(m) * normal);
    vSeed = aSeed;
    vLit = aLit;
    vec4 mv = viewMatrix * wp;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const towerFrag = /* glsl */ `
  uniform vec3 uFog;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform vec3 uBase;
  varying vec3 vWorld;
  varying vec3 vN;
  varying float vDepth;
  varying float vSeed;
  varying float vLit;

  // stable per-window random number (inputs are whole numbers, kept small for precision)
  float hash(vec2 p) {
    p = mod(p, 512.0);
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec3 n = normalize(vN);
    // facade lit from the dusk sky behind the city, darker towards the street
    float sky = 0.55 + 0.45 * clamp(vWorld.y / 22.0, 0.0, 1.0);
    float side = abs(n.x) > 0.5 ? 0.78 : 1.0;
    vec3 col = uBase * sky * side;

    if (abs(n.y) > 0.5) {
      col = uBase * 0.7;
    } else {
      float u = abs(n.x) > 0.5 ? vWorld.z : vWorld.x;
      vec2 g = vec2(u / 0.32, vWorld.y / 0.36);
      vec2 cell = floor(g);
      vec2 f = fract(g);
      float win = step(0.16, f.x) * step(f.x, 0.84) * step(0.22, f.y) * step(f.y, 0.82);
      float seed = floor(vSeed + 0.5);
      float face = floor(n.x + 0.5) * 3.0 + floor(n.z + 0.5) * 7.0;
      cell += vec2(seed * 13.0 + face, seed * 5.0);
      float h = hash(cell);
      float lit = step(1.0 - vLit, h);
      float tone = hash(cell + 9.1);
      vec3 warm = mix(vec3(0.98, 0.58, 0.28), vec3(1.0, 0.8, 0.58), tone) * (0.62 + 0.33 * hash(cell + 2.7));
      vec3 dark = vec3(0.07, 0.09, 0.14) + 0.06 * tone;
      // a few cool-white offices and TV-blue rooms
      if (tone > 0.94) warm = vec3(0.62, 0.72, 0.86);
      vec3 glass = mix(dark, warm, lit);
      // far away, windows are smaller than a pixel: show their average glow instead of noise
      vec2 fw = fwidth(g);
      float far = smoothstep(0.25, 0.7, max(fw.x, fw.y));
      vec3 near = mix(col, glass, win);
      vec3 avg = mix(col, mix(dark, vec3(1.0, 0.7, 0.45), vLit * 0.9), 0.42);
      col = mix(near, avg, far);
      // ground floor shops
      if (vWorld.y < 0.36) col = mix(col, vec3(1.0, 0.75, 0.45), win * 0.6);
    }

    float fog = smoothstep(uFogNear, uFogFar, vDepth);
    col = mix(col, uFog, fog);
    gl_FragColor = vec4(col, 1.0);
  }
`;

type Tower = { x: number; z: number; w: number; d: number; h: number };

function cityLayout(look: AreaLook, seed: number) {
  const r = rng(seed);
  const towers: Tower[] = [];
  const lights: number[] = [];
  const spacing = look === "grid" ? 4.2 : 3.3;
  const nx = look === "grid" ? 13 : 15;
  const nz = look === "grid" ? 15 : 20;

  for (let ix = -nx; ix <= nx; ix++) {
    for (let iz = -nz; iz <= 3; iz++) {
      const jitter = look === "grid" ? 0.15 : 0.9;
      const x = ix * spacing + (r() - 0.5) * jitter;
      const z = iz * spacing + (r() - 0.5) * jitter;
      // keep the flight path and the hero tower's surroundings clear
      if (Math.abs(x - TOWER.x) < 5.5 && z > TOWER.z - 4) continue;
      if (Math.hypot(x - TOWER.x, z - TOWER.z) < 4) continue;
      // carve out the camera's diagonal approach from the front-left
      const along = (x + z * 0.75) / 1.25;
      if (z > -2 && along < 4 && x < 2 && x > -40 && Math.abs(x * 0.6 - z * 0.8) < 9 && z > 0) continue;
      // water
      if (look === "sea" && x < -16 + Math.sin(z * 0.12) * 4) continue;
      if (look === "hills" && x > 18 && z < -20 && z > -50) continue;
      if (look === "grid" && z < -nz * spacing + 8) continue;
      if (r() < (look === "grid" ? 0.12 : 0.2)) continue;

      const dist = Math.hypot(x, z + 10);
      const tall = r() < 0.12 ? 2.2 : 1;
      let h = (2 + Math.pow(r(), 2.2) * 14) * tall;
      if (look === "hills") h *= 0.85;
      if (look === "grid") h = h * 0.8 + 1.5;
      h *= 1 - Math.min(0.4, dist / 160);
      const w = spacing * (0.45 + r() * 0.3);
      const d = spacing * (0.45 + r() * 0.3);
      towers.push({ x, z, w, d, h: Math.max(1.2, h) });
    }
  }

  // street lights along the roads between blocks
  for (let ix = -nx; ix <= nx; ix++) {
    for (let k = -nz * 4; k <= 12; k++) {
      const x = (ix + 0.5) * spacing;
      const z = k * (spacing / 4);
      if (look === "sea" && x < -16 + Math.sin(z * 0.12) * 4) continue;
      if (r() < 0.35) continue;
      lights.push(x, 0.12, z);
    }
  }
  for (let iz = -nz; iz <= 3; iz++) {
    for (let k = -nx * 4; k <= nx * 4; k++) {
      const x = k * (spacing / 4);
      const z = (iz + 0.5) * spacing;
      if (look === "sea" && x < -16 + Math.sin(z * 0.12) * 4) continue;
      if (r() < 0.45) continue;
      lights.push(x, 0.12, z);
    }
  }

  // Mumbai: a curved, brightly lit promenade along the shore
  const promenade: number[] = [];
  if (look === "sea") {
    for (let z = -80; z <= 20; z += 0.55) {
      promenade.push(-16.6 + Math.sin(z * 0.12) * 4, 0.16, z);
    }
  }
  return { towers, lights: new Float32Array(lights), promenade: new Float32Array(promenade) };
}

function Towers({ towers, look }: { towers: Tower[]; look: AreaLook }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { invalidate } = useThree();
  const geo = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1);
    g.translate(0, 0.5, 0);
    const seeds = new Float32Array(towers.length);
    const lit = new Float32Array(towers.length);
    const r = rng(towers.length * 7 + 3);
    for (let i = 0; i < towers.length; i++) {
      seeds[i] = Math.floor(r() * 400);
      lit[i] = 0.25 + r() * 0.45;
    }
    g.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
    g.setAttribute("aLit", new THREE.InstancedBufferAttribute(lit, 1));
    return g;
  }, [towers]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: towerVert,
        fragmentShader: towerFrag,
        uniforms: {
          uFog: { value: FOG_OUT },
          uFogNear: { value: 30 },
          uFogFar: { value: look === "grid" ? 120 : 105 },
          uBase: { value: new THREE.Color("#2b3247") },
        },
      }),
    [look],
  );

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const o = new THREE.Object3D();
    towers.forEach((t, i) => {
      o.position.set(t.x, 0, t.z);
      o.scale.set(t.w, t.h, t.d);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
    invalidate();
  }, [towers, invalidate]);

  return <instancedMesh ref={mesh} args={[geo, mat, towers.length]} frustumCulled={false} />;
}

// The tower we fly into: same facade shader, with the Renofix room set into one window.
function HeroTower({ photo }: { photo: string }) {
  const geo = useMemo(() => {
    const g = new THREE.BoxGeometry(TOWER.w, TOWER.h, TOWER.d);
    g.translate(TOWER.x, TOWER.h / 2, TOWER.z);
    g.setAttribute("aSeed", new THREE.Float32BufferAttribute(new Array(24).fill(42.0), 1));
    g.setAttribute("aLit", new THREE.Float32BufferAttribute(new Array(24).fill(0.38), 1));
    return g;
  }, []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: towerVert,
        fragmentShader: towerFrag,
        uniforms: {
          uFog: { value: FOG_OUT },
          uFogNear: { value: 30 },
          uFogFar: { value: 110 },
          uBase: { value: new THREE.Color("#363d52") },
        },
      }),
    [],
  );
  const tex = useTexture(photo, (t) => {
    const tt = t as THREE.Texture;
    tt.colorSpace = THREE.SRGBColorSpace;
    tt.anisotropy = 8;
  });
  // show the middle of the photo at the window's proportions
  const roomTex = useMemo(() => {
    const t = (tex as THREE.Texture).clone();
    const img = t.image as { width: number; height: number } | undefined;
    const aspect = img ? img.width / img.height : 16 / 9;
    const want = WIN.w / WIN.h;
    if (aspect > want) {
      t.repeat.set(want / aspect, 1);
      t.offset.set((1 - want / aspect) / 2, 0);
    } else {
      t.repeat.set(1, aspect / want);
      t.offset.set(0, (1 - aspect / want) / 2);
    }
    t.needsUpdate = true;
    return t;
  }, [tex]);

  const frame = 0.05;
  return (
    <group>
      <mesh geometry={geo} material={mat} />
      {/* recessed, warm-lit room behind the glass */}
      <mesh position={[TOWER.x, WIN.y, WIN_Z]}>
        <planeGeometry args={[WIN.w + frame * 2, WIN.h + frame * 2]} />
        <meshBasicMaterial color="#14161c" toneMapped={false} />
      </mesh>
      <mesh position={[TOWER.x, WIN.y, WIN_Z + 0.002]}>
        <planeGeometry args={[WIN.w, WIN.h]} />
        <meshBasicMaterial map={roomTex} toneMapped={false} />
      </mesh>
      {/* glow that marks the window from the air */}
      <mesh position={[TOWER.x, WIN.y, WIN_Z + 0.004]}>
        <planeGeometry args={[WIN.w * 4, WIN.h * 5.5]} />
        <meshBasicMaterial
          map={glowTexture()}
          color="#ffb070"
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* a thin accent line down the tower's corner, the only brand colour in the city */}
      <mesh position={[TOWER.x - TOWER.w / 2 - 0.01, TOWER.h / 2, WIN_Z + 0.01]}>
        <boxGeometry args={[0.06, TOWER.h, 0.06]} />
        <meshBasicMaterial color="#e0582a" toneMapped={false} />
      </mesh>
    </group>
  );
}

let glowTex: THREE.Texture | null = null;
function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,0.55)");
  grd.addColorStop(0.35, "rgba(255,255,255,0.18)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

function Lights({ positions, size, color }: { positions: Float32Array; size: number; color: string }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);
  if (!positions.length) return null;
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial
        map={glowTexture()}
        color={color}
        size={size}
        sizeAttenuation
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        fog={false}
      />
    </points>
  );
}

function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { uTop: { value: SKY_TOP }, uMid: { value: SKY_MID }, uLow: { value: SKY_LOW }, uFog: { value: FOG_OUT } },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uLow; uniform vec3 uFog;
          varying vec3 vDir;
          void main() {
            float y = vDir.y;
            vec3 c = mix(uMid, uTop, smoothstep(0.1, 0.55, y));
            // warm glow above the horizon, strongest towards the west (-x)
            float west = 0.5 + 0.5 * clamp(-vDir.x, 0.0, 1.0);
            c = mix(c, uLow, (1.0 - smoothstep(0.0, 0.2, y)) * 0.85 * west);
            // fade into the fogged ground at the horizon, so there is no seam
            c = mix(uFog, c, smoothstep(-0.01, 0.07, y));
            gl_FragColor = vec4(c, 1.0);
          }
        `,
      }),
    [],
  );
  return (
    <mesh material={mat} renderOrder={-1}>
      <sphereGeometry args={[2500, 48, 24]} />
    </mesh>
  );
}

function Ground({ look }: { look: AreaLook }) {
  const water = useMemo(() => {
    if (look === "sea") {
      // everything west of the promenade curve
      const s = new THREE.Shape();
      s.moveTo(-400, -400);
      for (let z = -400; z <= 400; z += 4) {
        const x = Math.abs(z) < 120 ? -16.8 + Math.sin(z * 0.12) * 4 : -16.8;
        s.lineTo(x, z);
      }
      s.lineTo(-400, 400);
      return s;
    }
    if (look === "hills") {
      const s = new THREE.Shape();
      s.moveTo(19, -22);
      s.bezierCurveTo(40, -18, 46, -40, 38, -52);
      s.bezierCurveTo(28, -58, 17, -48, 19, -22);
      return s;
    }
    // Navi Mumbai: the creek beyond the grid
    const s = new THREE.Shape();
    s.moveTo(-400, -66);
    s.bezierCurveTo(-40, -58, 30, -70, 400, -60);
    s.lineTo(400, -400);
    s.lineTo(-400, -400);
    return s;
  }, [look]);
  const waterGeo = useMemo(() => new THREE.ShapeGeometry(water, 64), [water]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6000, 6000]} />
        <meshBasicMaterial color="#141826" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} geometry={waterGeo}>
        <meshBasicMaterial color="#1d2a45" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Hills() {
  const geo = useMemo(() => {
    // a low ridge line behind Thane
    const pts: number[] = [];
    const idx: number[] = [];
    const r = rng(11);
    const n = 60;
    for (let i = 0; i <= n; i++) {
      const x = -160 + (i / n) * 320;
      const h = 10 + Math.sin(i * 0.37) * 5 + Math.sin(i * 0.11 + 1) * 7 + r() * 3;
      pts.push(x, 0, -110, x, h, -118 - r() * 6);
    }
    for (let i = 0; i < n; i++) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    g.setIndex(idx);
    return g;
  }, []);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color="#1f2742" side={THREE.DoubleSide} fog />
    </mesh>
  );
}

// Drives the camera along the flight path from scroll progress, with a little pointer drift.
function Flight({ progress, pointer }: { progress: Progress; pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const { invalidate, size } = useThree();
  const cur = useRef({ x: 0, y: 0, p: 0 });
  const flight = useMemo(() => flightPath(size.width / Math.max(1, size.height)), [size.width, size.height]);
  const scratch = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3() });

  useFrame(({ camera }) => {
    const { pos, look } = scratch.current;
    const c = cur.current;
    c.x += (pointer.current.x - c.x) * 0.08;
    c.y += (pointer.current.y - c.y) * 0.08;
    c.p += (progress.current - c.p) * 0.14;
    const t = ease(Math.min(1, Math.max(0, c.p / 0.9)));
    flight.path.getPoint(t, pos);
    const drift = 1 - smooth(0.6, 0.95, t);
    pos.x += c.x * 2.2 * drift;
    pos.y -= c.y * 1.2 * drift;
    camera.position.copy(pos);
    look.copy(LOOK_FROM).lerp(flight.lookTo, smooth(0.0, 0.75, t));
    camera.lookAt(look);
    if (
      Math.abs(pointer.current.x - c.x) > 0.001 ||
      Math.abs(pointer.current.y - c.y) > 0.001 ||
      Math.abs(progress.current - c.p) > 0.0005
    ) {
      invalidate();
    }
  });
  return null;
}

function Ready({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}

function City({ look, seed, photo, onReady }: { look: AreaLook; seed: number; photo: string; onReady?: () => void }) {
  const layout = useMemo(() => cityLayout(look, seed), [look, seed]);
  return (
    <>
      <Sky />
      <Ground look={look} />
      {look === "hills" && <Hills />}
      <Towers towers={layout.towers} look={look} />
      <Lights positions={layout.lights} size={0.55} color="#ffb46a" />
      <Lights positions={layout.promenade} size={0.9} color="#ffd9a0" />
      <HeroTower photo={photo} />
      <Ready onReady={onReady} />
    </>
  );
}

export default function AreaScene({
  look,
  seed,
  photo,
  progress,
  onReady,
  onLost,
}: {
  look: AreaLook;
  seed: number;
  photo: string;
  progress: Progress;
  onReady?: () => void;
  onLost?: () => void;
}) {
  const pointer = useRef({ x: 0, y: 0 });
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current?.parentElement;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      window.dispatchEvent(new Event("renofix-area-redraw"));
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
        camera={{ fov: FOV, near: 0.1, far: 4000, position: [-34, 27, 46] }}
        onCreated={({ gl, scene, invalidate }) => {
          scene.fog = new THREE.Fog(FOG, 30, 140);
          gl.toneMapping = THREE.NoToneMapping;
          const redraw = () => invalidate();
          window.addEventListener("renofix-area-redraw", redraw);
          gl.domElement.addEventListener(
            "webglcontextlost",
            () => {
              window.removeEventListener("renofix-area-redraw", redraw);
              onLost?.();
            },
            { once: true },
          );
        }}
        aria-hidden="true"
      >
        <Flight progress={progress} pointer={pointer} />
        <Suspense fallback={null}>
          <City look={look} seed={seed} photo={photo} onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
