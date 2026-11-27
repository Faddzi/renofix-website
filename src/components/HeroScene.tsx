"use client";

// 3D model of the finished Renofix living room in /images/living-room-feature-wall-01.jpg,
// built to line up with that photo. The camera matches the photo's viewpoint (one-point
// perspective, eye height about 1 m, back wall about 5 m away) and every piece is sized and
// placed from measurements taken on the photo. Patterned surfaces (blinds, wallpaper,
// prints, rug, screen medallions, leaf) use crops of the photo itself, in /images/hero/.
//
// As the visitor scrolls, the room builds itself: the empty shell first, then the ceiling,
// window and wall dressings, the built-in joinery and screen, the sofas, and the loose
// furniture. The last step of the scroll fades to the real photo.
//
// Units are metres. x runs from the left wall (-1.78) to the right wall (1.79), y is up,
// and the back wall is at z = -5.07 with the camera at z = 0.

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const C = {
  wall: "#eadcc3",
  ceiling: "#f1e7d6",
  floor: "#e3dace",
  timber: "#a0703f",
  timberLight: "#c09363",
  timberDark: "#4a2e1f",
  stone: "#e9e3d9",
  sofa: "#cfcac1",
  cushion: "#6d7a20",
  navy: "#2b3350",
  white: "#f7f5f0",
  line: "#6f5a45",
  glass: "#b5774a",
};

// Photo camera, measured from the photo (840 x 470 px)
const CAM = { x: 0.4, y: 1.02, z: 0, vfov: 46.5 };
// The photo's vanishing point is right of and below its centre: shift the view to match.
const PHOTO = { w: 840, h: 470, shiftX: -20, shiftY: -30 };

const WALL = { left: -1.78, right: 1.79, back: -5.07, height: 2.9 };

type Progress = React.MutableRefObject<number>;

const T = (name: string) => `/images/hero/${name}`;
const TEXTURES = {
  leftBlind: T("left-blind.jpg"),
  wallpaper: T("back-wallpaper.jpg"),
  blind: T("window-blind.jpg"),
  leftPaper: T("left-wallpaper.jpg"),
  printR: T("print-right.jpg"),
  rug: T("rug.jpg"),
  leaf: T("leaf.jpg"),
  screen: T("screen.jpg"),
};
type TexKey = keyof typeof TEXTURES;
const TEX_KEYS = Object.keys(TEXTURES) as TexKey[];
const TEX_URLS = TEX_KEYS.map((k) => TEXTURES[k]);

function useTextures() {
  const list = useTexture(TEX_URLS, (loaded) => {
    for (const t of loaded) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
    }
  });
  return useMemo(() => {
    const out = {} as Record<TexKey, THREE.Texture>;
    TEX_KEYS.forEach((k, i) => (out[k] = list[i]));
    return out;
  }, [list]);
}

type BoxProps = {
  size: [number, number, number];
  position: [number, number, number];
  color: string;
  rotation?: [number, number, number];
  edges?: boolean;
};

function Box({ size, position, color, rotation, edges = true }: BoxProps) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0} />
      {edges && <Edges color={C.line} threshold={15} />}
    </mesh>
  );
}

// A flat panel showing a crop of the photo, unlit so its colours match the photo exactly.
function Picture({
  map,
  size,
  position,
  rotation,
}: {
  map: THREE.Texture;
  size: [number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={map} toneMapped={false} />
    </mesh>
  );
}

// Build timeline: each stage drops into place over its own slice of the scroll progress.
const STAGES: [number, number][] = [
  [0.0, 0.16], // ceiling, lights, window, wall dressings
  [0.12, 0.3], // bench, right wall panel, screen
  [0.26, 0.44], // sofas and side table
  [0.4, 0.58], // coffee table, rug, cushions
];

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

function Stage({ i, progress, children }: { i: number; progress: Progress; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const [a, b] = STAGES[i];
    const t = ease(Math.min(1, Math.max(0, (progress.current - a) / (b - a))));
    g.visible = t > 0.001;
    g.position.y = (1 - t) * 1.2;
    g.scale.setScalar(0.7 + 0.3 * t);
  });
  return <group ref={ref}>{children}</group>;
}

function Shell() {
  const w = WALL.right - WALL.left;
  const cx = (WALL.right + WALL.left) / 2;
  const depth = -WALL.back + 0.6;
  const cz = WALL.back / 2 + 0.3;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0, cz]} receiveShadow>
        <planeGeometry args={[w, depth]} />
        <meshStandardMaterial color={C.floor} roughness={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[cx, WALL.height, cz]}>
        <planeGeometry args={[w, depth]} />
        <meshStandardMaterial color={C.ceiling} roughness={1} />
      </mesh>
      <mesh position={[cx, WALL.height / 2, WALL.back]} receiveShadow>
        <planeGeometry args={[w, WALL.height]} />
        <meshStandardMaterial color={C.wall} roughness={1} />
      </mesh>
      <mesh position={[WALL.left, WALL.height / 2, cz]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[depth, WALL.height]} />
        <meshStandardMaterial color={C.wall} roughness={1} />
      </mesh>
      <mesh position={[WALL.right, WALL.height / 2, cz]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[depth, WALL.height]} />
        <meshStandardMaterial color={C.wall} roughness={1} />
      </mesh>
    </group>
  );
}

function Fan() {
  return (
    <group position={[0.2, 2.76, -3.45]}>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.14, 8]} />
        <meshStandardMaterial color="#8d8a85" />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.09, 0.09, 0.06, 20]} />
        <meshStandardMaterial color="#9a958d" metalness={0.3} roughness={0.5} />
      </mesh>
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((a) => (
        <mesh key={a} rotation={[0, a, 0]} position={[Math.cos(a) * 0.42, 0, -Math.sin(a) * 0.42]}>
          <boxGeometry args={[0.7, 0.01, 0.11]} />
          <meshStandardMaterial color="#a9a399" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Pendant({ x, y, z }: { x: number; y: number; z: number }) {
  const cord = WALL.height - y;
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, cord / 2, 0]}>
        <cylinderGeometry args={[0.004, 0.004, cord, 4]} />
        <meshBasicMaterial color="#b08a4a" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.085, 20, 14]} />
        <meshStandardMaterial color={C.glass} transparent opacity={0.85} roughness={0.2} metalness={0.2} />
      </mesh>
    </group>
  );
}

function CeilingAndWalls({ tex }: { tex: Record<TexKey, THREE.Texture> }) {
  const back = WALL.back + 0.01;
  const left = WALL.left + 0.01;
  return (
    <group>
      {/* false ceiling recess with fan, and downlights */}
      <Box size={[2.05, 0.03, 1.85]} position={[0.17, WALL.height - 0.02, -3.4]} color={C.navy} edges={false} />
      <Box size={[2.25, 0.08, 0.1]} position={[0.17, WALL.height - 0.04, -2.45]} color={C.white} edges={false} />
      <Box size={[2.25, 0.08, 0.1]} position={[0.17, WALL.height - 0.04, -4.35]} color={C.white} edges={false} />
      <Fan />
      {[-1.26, 0.02, 1.34].map((x) => (
        <mesh key={x} position={[x, WALL.height - 0.005, -4.67]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.06, 24]} />
          <meshBasicMaterial color="#fffaf0" side={THREE.DoubleSide} />
        </mesh>
      ))}
      <Pendant x={-1.28} y={1.86} z={-4.0} />
      <Pendant x={-1.04} y={1.96} z={-4.0} />

      {/* AC unit */}
      <Box size={[0.93, 0.34, 0.22]} position={[0.2, 2.57, WALL.back + 0.11]} color={C.white} />

      {/* back wall: wallpaper panel, framed print, window with roman blind */}
      <Picture map={tex.wallpaper} size={[0.99, 1.47]} position={[-1.285, 1.52, back]} />
      <Box size={[0.53, 0.64, 0.03]} position={[-1.275, 1.53, back + 0.015]} color="#1f1b18" edges={false} />
      <Picture map={tex.printR} size={[0.47, 0.58]} position={[-1.275, 1.53, back + 0.035]} />
      <Box size={[1.96, 1.53, 0.05]} position={[0.19, 1.535, back + 0.02]} color={C.timber} />
      <Picture map={tex.blind} size={[1.8, 1.43]} position={[0.19, 1.535, back + 0.05]} />

      {/* left wall: wallpaper panel with a framed print near the corner, and the framed printed blind */}
      <Picture map={tex.leftPaper} size={[0.9, 1.5]} position={[left, 1.53, -4.63]} rotation={[0, Math.PI / 2, 0]} />
      <Box size={[0.05, 1.66, 1.06]} position={[left + 0.025, 1.43, -3.67]} color={C.timber} />
      <Picture map={tex.leftBlind} size={[0.92, 1.5]} position={[left + 0.055, 1.43, -3.67]} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
}

function Joinery({ tex }: { tex: Record<TexKey, THREE.Texture> }) {
  const right = WALL.right - 0.01;
  return (
    <group>
      {/* low storage bench along the left wall, with a stone top */}
      <Box size={[0.6, 0.43, 5.05]} position={[WALL.left + 0.3, 0.215, -2.07]} color={C.timberDark} />
      <Box size={[0.62, 0.04, 5.05]} position={[WALL.left + 0.31, 0.45, -2.07]} color={C.stone} />
      <Box size={[0.5, 0.55, 0.47]} position={[WALL.left + 0.25, 0.275, -4.83]} color={C.timberDark} />

      {/* right wall: timber-framed plaster panel, shelf and leaf sculpture */}
      <Box size={[0.06, 2.75, 2.0]} position={[right - 0.03, 1.375, -4.05]} color={C.timber} />
      <Box size={[0.02, 2.6, 1.85]} position={[right - 0.065, 1.38, -4.05]} color="#efe6d7" edges={false} />
      <Box size={[0.26, 0.04, 1.2]} position={[right - 0.2, 0.97, -4.1]} color={C.timber} />
      {/* leaf sculpture and hanging ring */}
      <Picture map={tex.leaf} size={[0.83, 1.23]} position={[right - 0.08, 1.59, -3.7]} rotation={[0, -Math.PI / 2, 0]} />

      {/* slatted timber screen with round printed medallions, in the right foreground. Parallel
          to the photo's image plane, so the photo's own view of it is used as its face. */}
      <group position={[0, 0, -1.6]}>
        <Picture map={tex.screen} size={[0.41, 1.375]} position={[1.365, 1.108, 0]} />
        <Box size={[0.41, 1.2, 0.05]} position={[1.365, 2.4, -0.01]} color={C.timber} edges={false} />
        <Box size={[0.41, 0.42, 0.05]} position={[1.365, 0.21, -0.01]} color={C.timber} edges={false} />
      </group>
    </group>
  );
}

function Sofa({ x0, x1 }: { x0: number; x1: number }) {
  const w = x1 - x0;
  return (
    <group position={[(x0 + x1) / 2, 0, -4.57]}>
      {/* timber frame and arms */}
      <Box size={[w, 0.08, 0.8]} position={[0, 0.16, 0]} color={C.timberLight} />
      <Box size={[0.07, 0.58, 0.8]} position={[-w / 2 + 0.035, 0.37, 0]} color={C.timberLight} />
      <Box size={[0.07, 0.58, 0.8]} position={[w / 2 - 0.035, 0.37, 0]} color={C.timberLight} />
      {[-w / 2 + 0.035, w / 2 - 0.035].map((x) =>
        [-0.36, 0.36].map((z) => (
          <Box key={`${x}${z}`} size={[0.06, 0.16, 0.06]} position={[x, 0.08, z]} color={C.timberLight} edges={false} />
        )),
      )}
      {/* seat and back cushions */}
      <Box size={[w - 0.16, 0.16, 0.7]} position={[0, 0.28, 0.03]} color={C.sofa} />
      <Box size={[w - 0.16, 0.44, 0.16]} position={[0, 0.56, -0.3]} color={C.sofa} />
      {/* olive scatter cushion */}
      <Box size={[0.4, 0.38, 0.12]} position={[0, 0.58, -0.16]} rotation={[-0.25, 0, 0.6]} color={C.cushion} />
    </group>
  );
}

function LooseFurniture({ tex }: { tex: Record<TexKey, THREE.Texture> }) {
  return (
    <group>
      {/* patterned rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.25, 0.006, -3.37]}>
        <planeGeometry args={[2.72, 1.53]} />
        <meshBasicMaterial map={tex.rug} toneMapped={false} />
      </mesh>
      {/* coffee table with a recessed top */}
      <Box size={[0.9, 0.35, 0.7]} position={[0.26, 0.175, -3.07]} color={C.timberLight} />
      <Box size={[0.4, 0.01, 0.28]} position={[0.26, 0.355, -3.12]} color={C.timber} edges={false} />
      {/* bench cushions */}
      <Box size={[0.1, 0.32, 0.32]} position={[-1.3, 0.63, -3.35]} rotation={[0, 0.6, -0.2]} color="#c79a3a" />
      <Box size={[0.1, 0.34, 0.34]} position={[-1.38, 0.64, -2.75]} rotation={[0, 0.6, -0.2]} color="#dfe3e6" />
      {/* vase on the corner cabinet */}
      <mesh position={[WALL.left + 0.3, 0.65, -4.83]}>
        <sphereGeometry args={[0.1, 20, 14]} />
        <meshStandardMaterial color="#2f6f73" roughness={0.3} />
      </mesh>
    </group>
  );
}

function Room({ progress, onReady }: { progress: Progress; onReady?: () => void }) {
  const tex = useTextures();
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return (
    <group>
      <Shell />
      <Stage i={0} progress={progress}>
        <CeilingAndWalls tex={tex} />
      </Stage>
      <Stage i={1} progress={progress}>
        <Joinery tex={tex} />
      </Stage>
      <Stage i={2} progress={progress}>
        <Sofa x0={-1.06} x1={-0.03} />
        <Sofa x0={0.32} x1={1.32} />
        <Box size={[0.36, 0.5, 0.6]} position={[0.145, 0.25, -4.7]} color={C.timberLight} />
      </Stage>
      <Stage i={3} progress={progress}>
        <LooseFurniture tex={tex} />
      </Stage>
    </group>
  );
}

// Holds the photo's viewpoint, with a small sideways drift that follows the pointer.
function Rig({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const { invalidate } = useThree();
  const cur = useRef({ x: 0, y: 0 });

  useFrame(({ camera }) => {
    cur.current.x += (pointer.current.x - cur.current.x) * 0.08;
    cur.current.y += (pointer.current.y - cur.current.y) * 0.08;
    const cam = camera as THREE.PerspectiveCamera;
    if (!cam.view || cam.view.offsetX !== PHOTO.shiftX) {
      cam.setViewOffset(PHOTO.w, PHOTO.h, PHOTO.shiftX, PHOTO.shiftY, PHOTO.w, PHOTO.h);
    }
    cam.position.set(CAM.x + cur.current.x * 0.12, CAM.y - cur.current.y * 0.06, CAM.z);
    cam.lookAt(cam.position.x, cam.position.y, cam.position.z - 1);
    if (
      Math.abs(pointer.current.x - cur.current.x) > 0.001 ||
      Math.abs(pointer.current.y - cur.current.y) > 0.001
    ) {
      invalidate();
    }
  });
  return null;
}

export default function HeroScene({
  onReady,
  onLost,
  progress,
}: {
  onReady?: () => void;
  onLost?: () => void;
  progress: Progress;
}) {
  const pointer = useRef({ x: 0, y: 0 });
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      window.dispatchEvent(new Event("renofix-hero-pointer"));
    };
    const onLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
      window.dispatchEvent(new Event("renofix-hero-pointer"));
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        frameloop="demand"
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, preserveDrawingBuffer: false }}
        camera={{ fov: CAM.vfov, near: 0.05, far: 40, position: [CAM.x, CAM.y, CAM.z] }}
        onCreated={({ gl, invalidate }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
          const redraw = () => invalidate();
          window.addEventListener("renofix-hero-pointer", redraw);
          // If the GPU drops the scene, fall back to the static render instead of a blank frame.
          gl.domElement.addEventListener(
            "webglcontextlost",
            () => {
              window.removeEventListener("renofix-hero-pointer", redraw);
              onLost?.();
            },
            { once: true },
          );
        }}
        aria-hidden="true"
      >
        <color attach="background" args={[C.wall]} />
        <hemisphereLight args={["#fff6e8", "#cdbfa8", 1.25]} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[1.5, 2.8, 0.5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-3}
          shadow-camera-right={3}
          shadow-camera-top={3}
          shadow-camera-bottom={-3}
          shadow-camera-far={10}
          shadow-bias={-0.0005}
        />
        <pointLight position={[0.2, 2.6, -3.4]} intensity={3} distance={6} color="#ffe2b8" />
        <Rig pointer={pointer} />
        <Suspense fallback={null}>
          <Room progress={progress} onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
