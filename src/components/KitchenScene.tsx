"use client";

// Navi Mumbai arrival: a modular kitchen assembles itself. Every carcass, shutter, worktop,
// handle and appliance starts as an exploded drawing floating around the room, each piece
// outlined like a technical drawing. As the visitor scrolls, the pieces fly into place one by
// one, the outlines give way to finished materials, the camera swings round to the front,
// and the under-cabinet light comes on. Reuses the kitchen model from the About page scene.

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { KITCHEN_COLORS, kitchenParts } from "./FounderScene";

type Progress = React.MutableRefObject<number>;

const BG = new THREE.Color("#191714");
const BG_END = new THREE.Color("#231f1a");
const LINE = new THREE.Color("#e8a77f");
const SHELL = 3; // the first parts are the floor and two walls

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

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

function Kitchen({ progress, onReady }: { progress: Progress; onReady?: () => void }) {
  const { invalidate } = useThree();
  const parts = useMemo(() => kitchenParts(), []);
  const pieces = useMemo(() => {
    const r = rng(29);
    const centre = new THREE.Vector3(0, 1.1, -1.0);
    return parts.map((p, i) => {
      const box = new THREE.BoxGeometry(...p.size);
      const home = new THREE.Vector3(...p.pos);
      // exploded position: pushed out from the kitchen's centre, towards the viewer and up
      const dir = home.clone().sub(centre);
      dir.z += 1.2;
      dir.normalize();
      const far = 0.7 + r() * 0.9;
      const from = home.clone().addScaledVector(dir, far).add(new THREE.Vector3((r() - 0.5) * 0.6, 0.3 + r() * 0.7, 0.3 + r() * 0.6));
      const spin = new THREE.Euler((r() - 0.5) * 1.4, (r() - 0.5) * 1.8, (r() - 0.5) * 1.0);
      return {
        p,
        box,
        edges: new THREE.EdgesGeometry(box, 15),
        home,
        from,
        spin,
        shell: i < SHELL,
        order: i < SHELL ? 0 : (i - SHELL) / Math.max(1, parts.length - SHELL - 1),
      };
    });
  }, [parts]);

  const groups = useRef<(THREE.Group | null)[]>([]);
  const mats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const lines = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const strip = useRef<THREE.MeshBasicMaterial>(null);
  const glow = useRef<THREE.PointLight>(null);
  const finished = useMemo(() => pieces.map((pc) => new THREE.Color(pc.p.color)), [pieces]);
  const drawing = useMemo(() => new THREE.Color("#2a2622"), []);

  useEffect(() => {
    onReady?.();
    invalidate();
  }, [onReady, invalidate]);

  useFrame(({ scene }) => {
    const p = progress.current;
    const fin = smooth(0.55, 0.8, p);
    pieces.forEach((pc, i) => {
      const g = groups.current[i];
      if (!g) return;
      // the room shell is there from the start; the rest fly in, staggered, over 8%-72%
      const t0 = pc.shell ? 0 : 0.08 + pc.order * 0.56;
      const t = pc.shell ? 1 : easeOut(clamp01((p - t0) / 0.1));
      g.position.lerpVectors(pc.from, pc.home, t);
      g.rotation.set(pc.spin.x * (1 - t), pc.spin.y * (1 - t), pc.spin.z * (1 - t));
      const m = mats.current[i];
      if (m) {
        m.color.copy(drawing).lerp(finished[i], fin);
        m.opacity = pc.shell ? 0.08 + 0.92 * fin : 0.35 + 0.65 * Math.max(fin, t * 0.4);
      }
      const l = lines.current[i];
      if (l) l.opacity = (1 - fin) * (pc.shell ? 0.14 : 0.95) + fin * 0.25;
    });
    const lit = smooth(0.82, 0.96, p);
    if (strip.current) strip.current.color.setRGB(0.2 + lit * 0.8, 0.18 + lit * 0.77, 0.15 + lit * 0.69);
    if (glow.current) glow.current.intensity = lit * 2.4;
    const bg = scene.background as THREE.Color | null;
    if (bg) bg.copy(BG).lerp(BG_END, fin);
  });

  return (
    <group>
      {pieces.map((pc, i) => (
        <group key={i} ref={(g) => void (groups.current[i] = g)} position={pc.from}>
          <mesh geometry={pc.box} castShadow={!pc.shell} receiveShadow>
            <meshStandardMaterial
              ref={(m) => void (mats.current[i] = m)}
              color={drawing}
              roughness={0.8}
              metalness={pc.p.color === KITCHEN_COLORS.steel ? 0.4 : 0}
              transparent
              opacity={0.35}
            />
          </mesh>
          {pc.p.edges !== false && (
            <lineSegments geometry={pc.edges}>
              <lineBasicMaterial ref={(m) => void (lines.current[i] = m)} color={LINE} transparent opacity={0.95} />
            </lineSegments>
          )}
        </group>
      ))}
      {/* under-cabinet light strip, switched on at the end */}
      <mesh position={[-0.7, 1.535, -1.2]}>
        <boxGeometry args={[1.7, 0.01, 0.03]} />
        <meshBasicMaterial ref={strip} color="#332e26" toneMapped={false} />
      </mesh>
      <pointLight ref={glow} position={[-0.7, 1.4, -0.95]} intensity={0} distance={2.6} color="#ffd9a6" />
    </group>
  );
}

// Camera: a high, wide three-quarter view of the exploded drawing that swings round to a
// close front view as the kitchen comes together. Wide screens keep it right of the headline.
function Rig({ progress, pointer }: { progress: Progress; pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const { invalidate, size } = useThree();
  const cur = useRef({ x: 0, y: 0, p: 0 });
  const scratch = useRef({ look: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(), fwd: new THREE.Vector3() });

  useFrame(({ camera }) => {
    const s = scratch.current;
    const c = cur.current;
    c.x += (pointer.current.x - c.x) * 0.08;
    c.y += (pointer.current.y - c.y) * 0.08;
    c.p += (progress.current - c.p) * 0.14;
    const t = smooth(0, 1, c.p);
    const aspect = size.width / Math.max(1, size.height);
    const wide = aspect >= 1.15;
    const k = wide ? 1 : Math.min(2.2, 1.05 / aspect);

    const yaw = THREE.MathUtils.lerp(0.85, -0.32, t) + c.x * 0.07;
    const elev = THREE.MathUtils.lerp(0.62, 0.2, t) - c.y * 0.03;
    const dist = THREE.MathUtils.lerp(11, 6.4, t) * k;
    s.look.set(0, THREE.MathUtils.lerp(1.3, 1.05, t), -1.0);
    camera.position.set(
      s.look.x + Math.sin(yaw) * Math.cos(elev) * dist,
      s.look.y + Math.sin(elev) * dist,
      s.look.z + Math.cos(yaw) * Math.cos(elev) * dist,
    );
    // shift the view so the kitchen sits right of the headline (wide) or above it (tall)
    const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov);
    const visH = 2 * Math.tan(fov / 2) * dist;
    s.fwd.subVectors(s.look, camera.position).normalize();
    s.right.crossVectors(s.fwd, camera.up).normalize();
    s.up.crossVectors(s.right, s.fwd).normalize();
    const shift = new THREE.Vector3()
      .addScaledVector(s.right, wide ? -0.17 * visH * aspect : 0)
      .addScaledVector(s.up, wide ? 0 : -0.24 * visH);
    camera.position.add(shift);
    camera.lookAt(s.look.add(shift));

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

export default function KitchenScene({
  progress,
  onReady,
  onLost,
}: {
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
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
        camera={{ fov: 34, near: 0.1, far: 80, position: [6, 5, 5] }}
        onCreated={({ gl, scene, invalidate }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          scene.background = BG.clone();
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
        <hemisphereLight args={["#fff6e8", "#b8a993", 1.3]} />
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[3, 5, 4]}
          intensity={1.6}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
          shadow-bias={-0.0005}
        />
        <Rig progress={progress} pointer={pointer} />
        <Kitchen progress={progress} onReady={onReady} />
      </Canvas>
    </div>
  );
}
