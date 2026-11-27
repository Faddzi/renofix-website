"use client";

// About page founder scene: one modular kitchen drawn twice. Left of the split it is a
// blueprint (Priti: design and planning). Right of the split it is built (Husain: site
// execution and materials). The split is a straight screen-space line: the same camera
// renders the blueprint layer into the left part of the canvas and the built layer into
// the right part, using the scissor test. Plain geometry, no external models.

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export const BLUEPRINT_BG = "#1f3550";
const BUILT_BG = "#efe9df";
const LAYER_PLAN = 1;
const LAYER_BUILT = 2;

type Part = {
  size: [number, number, number];
  pos: [number, number, number];
  color: string;
  edges?: boolean;
};

const C = {
  floor: "#d9cfbf",
  wall: "#efe9df",
  base: "#5f6b4e",
  baseFront: "#67745a",
  timber: "#b98a5e",
  top: "#ece6dc",
  tile: "#d6ccbc",
  steel: "#9a9a96",
  dark: "#2b2a28",
  handle: "#3a3631",
};

function kitchenParts(): Part[] {
  const parts: Part[] = [
    // room shell
    { size: [6, 0.02, 4], pos: [0, -0.01, -0.5], color: C.floor },
    { size: [6, 3, 0.04], pos: [0, 1.5, -1.52], color: C.wall },
    { size: [0.04, 3, 4], pos: [-2.52, 1.5, -0.5], color: C.wall },
    // base run, plinth and worktop
    { size: [3.0, 0.1, 0.56], pos: [-0.1, 0.05, -1.2], color: C.dark, edges: false },
    { size: [3.0, 0.76, 0.6], pos: [-0.1, 0.48, -1.2], color: C.base },
    { size: [3.04, 0.04, 0.64], pos: [-0.1, 0.88, -1.18], color: C.top },
    // backsplash
    { size: [3.0, 0.62, 0.02], pos: [-0.1, 1.21, -1.49], color: C.tile },
    // wall units
    { size: [1.8, 0.72, 0.35], pos: [-0.7, 1.9, -1.32], color: C.timber },
    // hood and duct over the hob
    { size: [0.62, 0.12, 0.46], pos: [0.75, 1.62, -1.26], color: C.steel },
    { size: [0.26, 0.74, 0.24], pos: [0.75, 2.05, -1.38], color: C.steel },
    // hob and sink
    { size: [0.58, 0.012, 0.44], pos: [0.75, 0.906, -1.18], color: C.dark, edges: false },
    { size: [0.5, 0.012, 0.38], pos: [-0.85, 0.906, -1.2], color: C.steel },
    { size: [0.03, 0.26, 0.03], pos: [-0.85, 1.03, -1.42], color: C.steel },
    { size: [0.03, 0.03, 0.16], pos: [-0.85, 1.15, -1.35], color: C.steel },
    // tall unit on the right
    { size: [0.62, 2.3, 0.6], pos: [1.72, 1.15, -1.2], color: C.timber },
  ];
  // base doors and handles
  for (let i = 0; i < 5; i++) {
    const x = -1.6 + 0.3 + i * 0.6;
    parts.push({ size: [0.57, 0.7, 0.02], pos: [x, 0.48, -0.895], color: C.baseFront });
    parts.push({ size: [0.3, 0.02, 0.02], pos: [x, 0.79, -0.875], color: C.handle, edges: false });
  }
  // wall unit doors
  for (let i = 0; i < 3; i++) {
    const x = -1.6 + 0.3 + i * 0.6;
    parts.push({ size: [0.57, 0.68, 0.02], pos: [x, 1.9, -1.14], color: C.timber });
  }
  // tall unit doors
  parts.push({ size: [0.58, 1.4, 0.02], pos: [1.72, 1.55, -0.895], color: C.timber });
  parts.push({ size: [0.58, 0.82, 0.02], pos: [1.72, 0.44, -0.895], color: C.timber });
  return parts;
}

function useLayer(ref: React.RefObject<THREE.Object3D | null>, layer: number) {
  useLayoutEffect(() => {
    ref.current?.traverse((o) => o.layers.set(layer));
  }, [ref, layer]);
}

function PlanKitchen({ parts }: { parts: Part[] }) {
  const ref = useRef<THREE.Group>(null);
  useLayer(ref, LAYER_PLAN);
  const geos = useMemo(
    () => parts.map((p) => ({ p, box: new THREE.BoxGeometry(...p.size) })),
    [parts],
  );
  const edges = useMemo(() => geos.map(({ box }) => new THREE.EdgesGeometry(box, 15)), [geos]);
  return (
    <group ref={ref}>
      {geos.map(({ p, box }, i) => (
        <group key={i} position={p.pos}>
          <mesh geometry={box}>
            <meshBasicMaterial color="#2a4566" transparent opacity={0.55} depthWrite />
          </mesh>
          <lineSegments geometry={edges[i]}>
            <lineBasicMaterial color="#dbe6f2" />
          </lineSegments>
        </group>
      ))}
      {/* drafting grid on the floor */}
      <gridHelper args={[6, 24, "#4f6d91", "#3b5677"]} position={[0, 0.002, -0.5]} />
    </group>
  );
}

function BuiltKitchen({ parts }: { parts: Part[] }) {
  const ref = useRef<THREE.Group>(null);
  useLayer(ref, LAYER_BUILT);
  const geos = useMemo(
    () => parts.map((p) => ({ p, box: new THREE.BoxGeometry(...p.size) })),
    [parts],
  );
  const edges = useMemo(() => geos.map(({ box }) => new THREE.EdgesGeometry(box, 15)), [geos]);
  return (
    <group ref={ref}>
      {geos.map(({ p, box }, i) => (
        <group key={i} position={p.pos}>
          <mesh geometry={box}>
            <meshStandardMaterial color={p.color} roughness={0.8} metalness={p.color === C.steel ? 0.4 : 0} />
          </mesh>
          {p.edges !== false && (
            <lineSegments geometry={edges[i]}>
              <lineBasicMaterial color="#6f655a" transparent opacity={0.6} />
            </lineSegments>
          )}
        </group>
      ))}
      {/* under-cabinet light strip */}
      <mesh position={[-0.7, 1.535, -1.2]}>
        <boxGeometry args={[1.7, 0.01, 0.03]} />
        <meshBasicMaterial color="#fff3d6" />
      </mesh>
    </group>
  );
}

function Lights() {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    ref.current?.traverse((o) => o.layers.enableAll());
  }, []);
  return (
    <group ref={ref}>
      <hemisphereLight args={["#fffaf2", "#cbbfae", 1.2]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[2.5, 5, 4]} intensity={1.5} />
      <pointLight position={[-0.7, 1.45, -1.0]} intensity={1.5} distance={2.5} color="#ffe2b8" />
    </group>
  );
}

// Takes over rendering: blueprint layer left of the split, built layer right of it.
function SplitRenderer({
  split,
  pointer,
}: {
  split: React.RefObject<number>;
  pointer: React.RefObject<{ x: number; y: number }>;
}) {
  const { invalidate } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, 1.05, -1.2), []);
  const plan = useMemo(() => new THREE.Color(BLUEPRINT_BG), []);
  const built = useMemo(() => new THREE.Color(BUILT_BG), []);
  const cur = useRef({ x: 0, y: 0 });

  useFrame(({ gl, scene, camera, size }) => {
    const p = pointer.current;
    cur.current.x += (p.x - cur.current.x) * 0.08;
    cur.current.y += (p.y - cur.current.y) * 0.08;
    const r = 4.6;
    const yaw = cur.current.x * 0.1;
    camera.position.set(target.x + Math.sin(yaw) * r, 1.75 + cur.current.y * 0.15, target.z + Math.cos(yaw) * r);
    camera.lookAt(target);

    const w = size.width;
    const h = size.height;
    const sx = Math.round(w * Math.min(1, Math.max(0, split.current)));
    gl.autoClear = false;
    gl.setScissorTest(true);
    gl.setViewport(0, 0, w, h);

    if (sx > 0) {
      gl.setScissor(0, 0, sx, h);
      gl.setClearColor(plan, 1);
      gl.clear();
      camera.layers.set(LAYER_PLAN);
      gl.render(scene, camera);
    }
    if (sx < w) {
      gl.setScissor(sx, 0, w - sx, h);
      gl.setClearColor(built, 1);
      gl.clear();
      camera.layers.set(LAYER_BUILT);
      gl.render(scene, camera);
    }
    gl.setScissorTest(false);

    if (Math.abs(p.x - cur.current.x) > 0.001 || Math.abs(p.y - cur.current.y) > 0.001) invalidate();
  }, 1);
  return null;
}

export default function FounderScene({
  split,
  pointer,
  onReady,
  onLost,
}: {
  split: React.RefObject<number>;
  pointer: React.RefObject<{ x: number; y: number }>;
  onReady?: (invalidate: () => void) => void;
  onLost?: () => void;
}) {
  const parts = useMemo(() => kitchenParts(), []);
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{ antialias: true }}
      camera={{ fov: 38, near: 0.1, far: 40, position: [0, 1.75, 3.4] }}
      onCreated={({ gl, invalidate }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.domElement.addEventListener("webglcontextlost", () => onLost?.(), { once: true });
        onReady?.(invalidate);
      }}
      aria-hidden="true"
    >
      <Lights />
      <PlanKitchen parts={parts} />
      <BuiltKitchen parts={parts} />
      <SplitRenderer split={split} pointer={pointer} />
    </Canvas>
  );
}
