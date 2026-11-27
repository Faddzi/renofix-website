"use client";

// Render-style 3D model of the finished Renofix living room shown in
// /images/living-room-feature-wall-01.jpg. Proportions and layout follow the photo so the
// scroll crossfade lands on the real room. Plain geometry, no external models or HDRs.

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const C = {
  wall: "#efe9df",
  ceiling: "#f6f2ec",
  floor: "#e4ddd1",
  timber: "#b98a5e",
  timberDark: "#7f5536",
  sofa: "#c9c6c0",
  cushion: "#7b8b3a",
  blind: "#a7ad95",
  print: "#d9d6ce",
  rug: "#c9c3b7",
  stone: "#ddd6c9",
  line: "#6f655a",
  disc: "#8fa7b8",
};

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

function Sofa({ x }: { x: number }) {
  const z = -1.75;
  return (
    <group position={[x, 0, z]}>
      {/* timber frame */}
      <Box size={[1.2, 0.08, 0.8]} position={[0, 0.22, 0]} color={C.timber} />
      <Box size={[0.06, 0.5, 0.8]} position={[-0.6, 0.35, 0]} color={C.timber} />
      <Box size={[0.06, 0.5, 0.8]} position={[0.6, 0.35, 0]} color={C.timber} />
      {/* seat and back */}
      <Box size={[1.12, 0.16, 0.74]} position={[0, 0.34, 0.02]} color={C.sofa} />
      <Box size={[1.12, 0.5, 0.18]} position={[0, 0.62, -0.3]} color={C.sofa} />
      {/* cushion */}
      <Box size={[0.42, 0.36, 0.12]} position={[0, 0.6, -0.16]} rotation={[-0.2, 0, 0.08]} color={C.cushion} />
    </group>
  );
}

function Screen() {
  // slatted timber screen on the right, with round inlays
  const slats = useMemo(() => Array.from({ length: 9 }, (_, i) => -2.3 + i * 0.32), []);
  const discs: [number, number][] = [
    [2.15, -1.9],
    [1.55, -1.3],
    [0.95, -1.55],
    [0.45, -0.75],
  ];
  return (
    <group position={[2.55, 0, 0]}>
      {slats.map((z) => (
        <Box key={z} size={[0.07, 2.9, 0.06]} position={[0, 1.45, z]} color={C.timber} />
      ))}
      <Box size={[0.1, 0.08, 2.7]} position={[0, 2.86, -1.02]} color={C.timberDark} />
      {discs.map(([y, z]) => (
        <group key={`${y}${z}`} position={[-0.05, y, z]} rotation={[0, Math.PI / 2, 0]}>
          <mesh castShadow>
            <torusGeometry args={[0.27, 0.035, 8, 40]} />
            <meshStandardMaterial color={C.timberDark} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, -0.01]}>
            <circleGeometry args={[0.25, 40]} />
            <meshStandardMaterial color={C.disc} roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Room() {
  return (
    <group>
      {/* shell */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7, 7]} />
        <meshStandardMaterial color={C.floor} roughness={0.6} />
      </mesh>
      <mesh position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 7]} />
        <meshStandardMaterial color={C.ceiling} roughness={1} />
      </mesh>
      <mesh position={[0, 1.5, -2.6]} receiveShadow>
        <planeGeometry args={[7, 3]} />
        <meshStandardMaterial color={C.wall} roughness={1} />
      </mesh>
      <mesh position={[-2.7, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[7, 3]} />
        <meshStandardMaterial color={C.wall} roughness={1} />
      </mesh>
      <mesh position={[2.8, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[7, 3]} />
        <meshStandardMaterial color={C.stone} roughness={1} />
      </mesh>

      {/* false ceiling recess and downlights */}
      <Box size={[2.2, 0.05, 1.2]} position={[0, 2.97, -0.8]} color="#4b5263" edges={false} />
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, 2.98, -1.6]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.07, 24]} />
          <meshBasicMaterial color="#fffaf0" side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* window with blind, timber frame */}
      <Box size={[2.3, 1.75, 0.08]} position={[0.3, 1.7, -2.56]} color={C.timber} />
      <Box size={[2.1, 1.55, 0.04]} position={[0.3, 1.7, -2.5]} color={C.blind} />
      <Box size={[0.32, 1.55, 0.05]} position={[0.42, 1.7, -2.48]} color={C.print} />
      {[-0.08, 0.92].map((x) => (
        <Box key={x} size={[0.05, 1.55, 0.05]} position={[x, 1.7, -2.47]} color="#a8423a" edges={false} />
      ))}

      {/* printed blind panels on the left */}
      <Box size={[0.06, 1.7, 1.2]} position={[-2.64, 1.75, -1.6]} color={C.timber} />
      <Box size={[0.04, 1.55, 1.05]} position={[-2.6, 1.75, -1.6]} color={C.print} />
      <Box size={[1.3, 1.5, 0.05]} position={[-1.4, 1.8, -2.55]} color={C.print} />

      {/* AC unit */}
      <Box size={[0.9, 0.28, 0.2]} position={[0.1, 2.68, -2.48]} color="#f8f8f6" />

      {/* sofas, side table, coffee table, rug */}
      <Sofa x={-0.6} />
      <Sofa x={0.9} />
      <Box size={[0.36, 0.42, 0.5]} position={[0.15, 0.21, -1.95]} color={C.timberDark} />
      <Box size={[1.1, 0.34, 0.8]} position={[0.1, 0.17, -0.55]} color={C.timber} />
      <Box size={[2.6, 0.01, 1.8]} position={[0.1, 0.005, -0.7]} color={C.rug} edges={false} />

      {/* low storage bench on the left */}
      <Box size={[0.75, 0.42, 2.6]} position={[-2.25, 0.21, -0.6]} color={C.timberDark} />
      <Box size={[0.8, 0.05, 2.65]} position={[-2.23, 0.445, -0.6]} color={C.stone} />

      <Screen />
    </group>
  );
}

function Rig({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const { camera, invalidate } = useThree();
  const base = useMemo(() => new THREE.Vector3(0, 1.55, 4.1), []);
  const target = useMemo(() => new THREE.Vector3(0.15, 1.35, -1.2), []);
  const cur = useRef({ x: 0, y: 0 });

  useFrame(() => {
    // ease toward the pointer: a slight orbit of a few degrees at most
    cur.current.x += (pointer.current.x - cur.current.x) * 0.08;
    cur.current.y += (pointer.current.y - cur.current.y) * 0.08;
    const yaw = cur.current.x * 0.12;
    const pitch = cur.current.y * 0.05;
    const r = base.distanceTo(target);
    camera.position.set(
      target.x + Math.sin(yaw) * r,
      base.y + pitch * r,
      target.z + Math.cos(yaw) * r,
    );
    camera.lookAt(target);
    if (
      Math.abs(pointer.current.x - cur.current.x) > 0.001 ||
      Math.abs(pointer.current.y - cur.current.y) > 0.001
    ) {
      invalidate();
    }
  });
  return null;
}

export default function HeroScene({ onReady }: { onReady?: () => void }) {
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
        dpr={[1, 1.75]}
        gl={{ antialias: true, preserveDrawingBuffer: false }}
        camera={{ fov: 42, near: 0.1, far: 40, position: [0, 1.55, 4.1] }}
        onCreated={({ gl, invalidate }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          window.addEventListener("renofix-hero-pointer", () => invalidate());
          onReady?.();
        }}
        aria-hidden="true"
      >
        <color attach="background" args={["#efe9df"]} />
        <hemisphereLight args={["#fffaf2", "#cbbfae", 1.1]} />
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[2.5, 5, 3.5]}
          intensity={1.6}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
          shadow-bias={-0.0005}
        />
        <pointLight position={[0, 2.6, -0.8]} intensity={4} distance={6} color="#ffe2b8" />
        <Rig pointer={pointer} />
        <Room />
      </Canvas>
    </div>
  );
}
