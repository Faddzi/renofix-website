"use client";

// Thane and Navi Mumbai arrival: an apartment rises from its floor plan. It opens as a
// blueprint seen from straight above (wall outlines, door swings, window lines, drafting
// grid). As the visitor scrolls, the camera tilts into a three-quarter view, the walls rise,
// floor finishes replace the blueprint, every room furnishes itself, and the lights come on
// while the blueprint background deepens so the lit rooms glow. Thane is a 2 BHK, Navi
// Mumbai a 3 BHK. Plain geometry only. Units are metres; the plan sits on x/z with y up.

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Progress = React.MutableRefObject<number>;
export type PlanKind = "2bhk" | "3bhk";

const H = 2.7; // wall height
const LOW = 0.95; // cut-away walls on the camera side
const T = 0.14; // wall thickness

const BLUEPRINT = new THREE.Color("#1f3550");
const BLUEPRINT_END = new THREE.Color("#172a42");
const PLAN_FILL = new THREE.Color("#2a4566");

const C = {
  wall: "#f3ede3",
  living: "#dccbb0",
  bed: "#b58254",
  kitchen: "#d2cbbf",
  bath: "#c3d3d6",
  sofa: "#8c917c",
  sofaLight: "#d8d1c4",
  cushion: "#c8401a",
  timber: "#8a5a35",
  timberLight: "#b98a5e",
  linen: "#f6f1e8",
  throw: "#c8401a",
  kitchenFront: "#5f6b4e",
  top: "#ece6dc",
  dark: "#2b2a28",
  steel: "#a3a39e",
  rug: "#b9a07c",
  rugDark: "#7c6a55",
  leaf: "#4f6b3a",
  pot: "#c9b9a3",
  glass: "#bcd6e0",
  tv: "#1b1c1f",
};

// ---------------------------------------------------------------------------------------
// Plans

type Gap = { a: number; b: number; kind: "door" | "window" | "open"; swing?: 1 | -1 };
type Wall = { x1: number; z1: number; x2: number; z2: number; gaps?: Gap[]; low?: boolean };
type RoomKind = "living" | "bed" | "kitchen" | "bath";
type Room = { kind: RoomKind; x0: number; z0: number; x1: number; z1: number; head?: "n" | "e" | "s" | "w" };
type Plan = { w: number; d: number; walls: Wall[]; rooms: Room[]; focus: [number, number] };

const PLANS: Record<PlanKind, Plan> = {
  "2bhk": {
    w: 11,
    d: 8,
    focus: [3.6, 6],
    walls: [
      { x1: 0, z1: 0, x2: 11, z2: 0, gaps: [{ a: 6.0, b: 7.6, kind: "window" }, { a: 0.9, b: 2.2, kind: "window" }] },
      { x1: 11, z1: 0, x2: 11, z2: 8, gaps: [{ a: 1.2, b: 1.9, kind: "window" }, { a: 5.0, b: 7.0, kind: "window" }] },
      { x1: 0, z1: 8, x2: 11, z2: 8, low: true, gaps: [{ a: 1.0, b: 4.6, kind: "window" }, { a: 7.6, b: 10.0, kind: "window" }] },
      { x1: 0, z1: 0, x2: 0, z2: 8, low: true, gaps: [{ a: 5.4, b: 6.4, kind: "door", swing: 1 }] },
      {
        x1: 0, z1: 4, x2: 11, z2: 4,
        gaps: [
          { a: 0.5, b: 2.5, kind: "open" },
          { a: 3.4, b: 4.2, kind: "door", swing: -1 },
          { a: 5.5, b: 6.3, kind: "door", swing: -1 },
          { a: 9.1, b: 9.9, kind: "door", swing: -1 },
        ],
      },
      { x1: 3, z1: 0, x2: 3, z2: 4 },
      { x1: 5, z1: 0, x2: 5, z2: 4 },
      { x1: 8.5, z1: 0, x2: 8.5, z2: 4 },
      { x1: 6.5, z1: 4, x2: 6.5, z2: 8, gaps: [{ a: 0.3, b: 1.2, kind: "door", swing: 1 }] },
    ],
    rooms: [
      { kind: "living", x0: 0, z0: 4, x1: 6.5, z1: 8 },
      { kind: "bed", x0: 6.5, z0: 4, x1: 11, z1: 8, head: "e" },
      { kind: "kitchen", x0: 0, z0: 0, x1: 3, z1: 4 },
      { kind: "bath", x0: 3, z0: 0, x1: 5, z1: 4 },
      { kind: "bed", x0: 5, z0: 0, x1: 8.5, z1: 4, head: "n" },
      { kind: "bath", x0: 8.5, z0: 0, x1: 11, z1: 4 },
    ],
  },
  "3bhk": {
    w: 14,
    d: 9,
    focus: [4.2, 6.8],
    walls: [
      {
        x1: 0, z1: 0, x2: 14, z2: 0,
        gaps: [{ a: 0.9, b: 2.3, kind: "window" }, { a: 5.8, b: 7.6, kind: "window" }, { a: 10.0, b: 12.4, kind: "window" }],
      },
      { x1: 14, z1: 0, x2: 14, z2: 9, gaps: [{ a: 5.4, b: 7.6, kind: "window" }] },
      { x1: 0, z1: 9, x2: 14, z2: 9, low: true, gaps: [{ a: 1.0, b: 6.6, kind: "window" }, { a: 9.4, b: 12.4, kind: "window" }] },
      { x1: 0, z1: 0, x2: 0, z2: 9, low: true, gaps: [{ a: 6.0, b: 7.0, kind: "door", swing: 1 }] },
      {
        x1: 0, z1: 4.5, x2: 14, z2: 4.5,
        gaps: [
          { a: 0.5, b: 2.6, kind: "open" },
          { a: 3.4, b: 4.2, kind: "door", swing: -1 },
          { a: 5.4, b: 6.2, kind: "door", swing: -1 },
          { a: 9.0, b: 9.8, kind: "door", swing: -1 },
        ],
      },
      { x1: 3, z1: 0, x2: 3, z2: 4.5 },
      { x1: 5, z1: 0, x2: 5, z2: 4.5 },
      { x1: 8.7, z1: 0, x2: 8.7, z2: 4.5 },
      { x1: 8.7, z1: 4.5, x2: 8.7, z2: 9, gaps: [{ a: 0.3, b: 1.2, kind: "door", swing: 1 }] },
      { x1: 12.2, z1: 0, x2: 12.2, z2: 2.4, gaps: [] },
      { x1: 12.2, z1: 2.4, x2: 14, z2: 2.4, gaps: [] },
    ],
    rooms: [
      { kind: "living", x0: 0, z0: 4.5, x1: 8.7, z1: 9 },
      { kind: "bed", x0: 8.7, z0: 4.5, x1: 14, z1: 9, head: "e" },
      { kind: "kitchen", x0: 0, z0: 0, x1: 3, z1: 4.5 },
      { kind: "bath", x0: 3, z0: 0, x1: 5, z1: 4.5 },
      { kind: "bed", x0: 5, z0: 0, x1: 8.7, z1: 4.5, head: "n" },
      { kind: "bed", x0: 8.7, z0: 0, x1: 12.2, z1: 4.5, head: "n" },
      { kind: "bath", x0: 12.2, z0: 0, x1: 14, z1: 2.4 },
    ],
  },
};

// ---------------------------------------------------------------------------------------
// Helpers

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOutBack = (t: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

type Piece = { pos: [number, number, number]; size: [number, number, number]; rotY: number; glass?: boolean; cap?: boolean };

// Splits each wall into solid pieces around its doors and windows.
function wallPieces(walls: Wall[]) {
  const pieces: Piece[] = [];
  for (const w of walls) {
    const dx = w.x2 - w.x1;
    const dz = w.z2 - w.z1;
    const len = Math.hypot(dx, dz);
    const rotY = -Math.atan2(dz, dx);
    const at = (s: number) => [w.x1 + (dx * s) / len, w.z1 + (dz * s) / len] as const;
    const top = w.low ? LOW : H;
    const add = (s0: number, s1: number, y0: number, y1: number, glass = false) => {
      if (s1 - s0 < 0.01 || y1 - y0 < 0.01) return;
      const [cx, cz] = at((s0 + s1) / 2);
      pieces.push({
        pos: [cx, y0, cz],
        size: [s1 - s0 + (glass ? 0 : T), y1 - y0, glass ? 0.02 : T],
        rotY,
        glass,
        cap: !glass && y1 === top,
      });
    };
    const gaps = [...(w.gaps ?? [])].sort((a, b) => a.a - b.a);
    let s = 0;
    for (const g of gaps) {
      add(s, g.a, 0, top);
      if (g.kind === "window") {
        add(g.a, g.b, 0, Math.min(0.9, top));
        if (!w.low) {
          add(g.a, g.b, 2.1, top);
          add(g.a, g.b, 0.9, 2.1, true);
        }
      } else if (g.kind === "door" && !w.low) {
        add(g.a, g.b, 2.1, top);
      }
      s = g.b;
    }
    add(s, len, 0, top);
  }
  return pieces;
}

// Blueprint linework: wall outlines, door swings and window lines at floor level.
function planLines(walls: Wall[]) {
  const pts: number[] = [];
  const seg = (x1: number, z1: number, x2: number, z2: number) => pts.push(x1, 0.02, z1, x2, 0.02, z2);
  for (const w of walls) {
    const dx = w.x2 - w.x1;
    const dz = w.z2 - w.z1;
    const len = Math.hypot(dx, dz);
    const ux = dx / len;
    const uz = dz / len;
    const nx = -uz * (T / 2);
    const nz = ux * (T / 2);
    const at = (s: number) => [w.x1 + ux * s, w.z1 + uz * s] as const;
    const gaps = [...(w.gaps ?? [])].sort((a, b) => a.a - b.a);
    let s = 0;
    const solid = (s0: number, s1: number) => {
      const [ax, az] = at(s0);
      const [bx, bz] = at(s1);
      seg(ax + nx, az + nz, bx + nx, bz + nz);
      seg(ax - nx, az - nz, bx - nx, bz - nz);
      seg(ax + nx, az + nz, ax - nx, az - nz);
      seg(bx + nx, bz + nz, bx - nx, bz - nz);
    };
    for (const g of gaps) {
      solid(s, g.a);
      const [ax, az] = at(g.a);
      const [bx, bz] = at(g.b);
      if (g.kind === "window") {
        seg(ax + nx, az + nz, bx + nx, bz + nz);
        seg(ax - nx, az - nz, bx - nx, bz - nz);
        seg(ax, az, bx, bz);
      } else if (g.kind === "door") {
        // the leaf, open at 90 degrees, and its swing arc
        const r = g.b - g.a;
        const sgn = g.swing ?? 1;
        const px = -uz * sgn;
        const pz = ux * sgn;
        seg(ax, az, ax + px * r, az + pz * r);
        const steps = 14;
        for (let i = 0; i < steps; i++) {
          const a0 = (i / steps) * (Math.PI / 2);
          const a1 = ((i + 1) / steps) * (Math.PI / 2);
          const p0 = [ax + (ux * Math.cos(a0) + px * Math.sin(a0)) * r, az + (uz * Math.cos(a0) + pz * Math.sin(a0)) * r];
          const p1 = [ax + (ux * Math.cos(a1) + px * Math.sin(a1)) * r, az + (uz * Math.cos(a1) + pz * Math.sin(a1)) * r];
          seg(p0[0], p0[1], p1[0], p1[1]);
        }
      }
      s = g.b;
    }
    solid(s, len);
  }
  return new Float32Array(pts);
}

// ---------------------------------------------------------------------------------------
// Furniture: each item is a list of boxes (or cylinders) in the item's local space.

type Part = { s: [number, number, number]; p: [number, number, number]; c: string; cyl?: boolean; emissive?: boolean };
type Item = { x: number; z: number; rot: number; parts: Part[]; order: number };

const sofa = (len: number): Part[] => [
  { s: [len, 0.42, 0.9], p: [0, 0.21, 0], c: C.sofa },
  { s: [len, 0.42, 0.22], p: [0, 0.63, -0.34], c: C.sofa },
  { s: [0.2, 0.25, 0.9], p: [-len / 2 + 0.1, 0.55, 0], c: C.sofa },
  { s: [0.2, 0.25, 0.9], p: [len / 2 - 0.1, 0.55, 0], c: C.sofa },
  { s: [0.42, 0.36, 0.12], p: [-len / 2 + 0.45, 0.6, -0.18], c: C.cushion },
  { s: [0.42, 0.36, 0.12], p: [len / 2 - 0.45, 0.6, -0.18], c: C.sofaLight },
];
const coffeeTable: Part[] = [
  { s: [1.1, 0.06, 0.6], p: [0, 0.38, 0], c: C.timber },
  { s: [1.0, 0.32, 0.5], p: [0, 0.18, 0], c: C.dark },
];
const rug = (w: number, d: number): Part[] => [
  { s: [w, 0.015, d], p: [0, 0.008, 0], c: C.rug },
  { s: [w - 0.3, 0.017, d - 0.3], p: [0, 0.009, 0], c: C.rugDark },
  { s: [w - 0.4, 0.019, d - 0.4], p: [0, 0.01, 0], c: C.rug },
];
const tvUnit = (len: number): Part[] => [
  { s: [len, 0.42, 0.42], p: [0, 0.32, 0], c: C.timberLight },
  { s: [len + 0.6, 1.6, 0.04], p: [0, 1.3, -0.24], c: C.timber },
  { s: [1.3, 0.75, 0.04], p: [0, 1.3, -0.2], c: C.tv },
];
const dining = (): Part[] => {
  const parts: Part[] = [
    { s: [1.5, 0.05, 0.85], p: [0, 0.75, 0], c: C.timber },
    { s: [0.08, 0.72, 0.08], p: [-0.65, 0.36, -0.33], c: C.dark },
    { s: [0.08, 0.72, 0.08], p: [0.65, 0.36, -0.33], c: C.dark },
    { s: [0.08, 0.72, 0.08], p: [-0.65, 0.36, 0.33], c: C.dark },
    { s: [0.08, 0.72, 0.08], p: [0.65, 0.36, 0.33], c: C.dark },
    // pendant
    { s: [0.36, 0.2, 0.36], p: [0, 1.9, 0], c: "#ffd9a0", cyl: true, emissive: true },
  ];
  for (const sx of [-0.4, 0.4]) {
    for (const sz of [-1, 1]) {
      parts.push({ s: [0.44, 0.08, 0.44], p: [sx, 0.46, sz * 0.62], c: C.sofaLight });
      parts.push({ s: [0.44, 0.42, 0.05], p: [sx, 0.7, sz * 0.84], c: C.sofaLight });
      for (const lx of [-0.18, 0.18]) {
        for (const lz of [-0.18, 0.18]) parts.push({ s: [0.03, 0.42, 0.03], p: [sx + lx, 0.21, sz * 0.62 + lz], c: C.dark });
      }
    }
  }
  return parts;
};
const plant: Part[] = [
  { s: [0.36, 0.45, 0.36], p: [0, 0.22, 0], c: C.pot, cyl: true },
  { s: [0.6, 0.8, 0.6], p: [0, 0.9, 0], c: C.leaf, cyl: true },
];
const bed = (w: number): Part[] => [
  { s: [w, 0.32, 2.05], p: [0, 0.16, 0], c: C.timber },
  { s: [w - 0.08, 0.2, 1.95], p: [0, 0.42, 0.02], c: C.linen },
  { s: [w + 0.1, 1.05, 0.08], p: [0, 0.52, -1.04], c: C.timberLight },
  { s: [0.6, 0.12, 0.35], p: [-w / 4, 0.58, -0.75], c: C.linen },
  { s: [0.6, 0.12, 0.35], p: [w / 4, 0.58, -0.75], c: C.linen },
  { s: [w - 0.06, 0.04, 0.7], p: [0, 0.54, 0.55], c: C.throw },
  // bedside tables with lamps
  { s: [0.45, 0.45, 0.4], p: [-w / 2 - 0.35, 0.22, -0.8], c: C.timberLight },
  { s: [0.45, 0.45, 0.4], p: [w / 2 + 0.35, 0.22, -0.8], c: C.timberLight },
  { s: [0.2, 0.26, 0.2], p: [-w / 2 - 0.35, 0.58, -0.8], c: "#ffd9a0", cyl: true, emissive: true },
  { s: [0.2, 0.26, 0.2], p: [w / 2 + 0.35, 0.58, -0.8], c: "#ffd9a0", cyl: true, emissive: true },
];
const wardrobe = (len: number): Part[] => {
  const parts: Part[] = [{ s: [len, 2.3, 0.6], p: [0, 1.15, 0], c: C.timberLight }];
  const n = Math.max(2, Math.round(len / 0.55));
  for (let i = 1; i < n; i++) parts.push({ s: [0.015, 2.2, 0.02], p: [-len / 2 + (len * i) / n, 1.15, 0.31], c: C.timber });
  return parts;
};
const counter = (len: number, uppers: boolean): Part[] => {
  const parts: Part[] = [
    { s: [len, 0.82, 0.6], p: [0, 0.45, 0], c: C.kitchenFront },
    { s: [len + 0.02, 0.04, 0.64], p: [0, 0.88, 0.02], c: C.top },
    { s: [len, 0.1, 0.56], p: [0, 0.05, -0.02], c: C.dark },
  ];
  if (uppers) parts.push({ s: [len, 0.7, 0.35], p: [0, 1.85, -0.12], c: C.timberLight });
  return parts;
};
const fridge: Part[] = [
  { s: [0.7, 1.9, 0.65], p: [0, 0.95, 0], c: C.steel },
  { s: [0.03, 0.5, 0.03], p: [0.28, 1.2, 0.34], c: C.dark },
];
const vanity: Part[] = [
  { s: [0.9, 0.5, 0.48], p: [0, 0.6, 0], c: C.timberLight },
  { s: [0.5, 0.1, 0.36], p: [0, 0.9, 0.02], c: C.linen },
  { s: [0.7, 0.8, 0.03], p: [0, 1.5, -0.23], c: C.glass },
];
const wc: Part[] = [
  { s: [0.38, 0.4, 0.55], p: [0, 0.2, 0.05], c: C.linen },
  { s: [0.38, 0.35, 0.16], p: [0, 0.55, -0.2], c: C.linen },
];
const shower = (w: number): Part[] => [
  { s: [w, 0.04, w], p: [0, 0.02, 0], c: C.steel },
  { s: [w, 1.9, 0.02], p: [0, 0.97, w / 2], c: C.glass },
];

function furnish(rooms: Room[]) {
  const items: Item[] = [];
  let order = 0;
  const put = (x: number, z: number, rot: number, parts: Part[]) => items.push({ x, z, rot, parts, order: order++ });

  for (const r of rooms) {
    const w = r.x1 - r.x0;
    const d = r.z1 - r.z0;
    const cx = (r.x0 + r.x1) / 2;
    const cz = (r.z0 + r.z1) / 2;
    if (r.kind === "living") {
      const sz = r.z0 + d * 0.66;
      const sofaX = r.x0 + w * 0.5;
      put(sofaX + 1.15, sz, 0, rug(2.6, 2.2));
      put(sofaX, sz, Math.PI / 2, sofa(Math.min(2.4, d * 0.55)));
      put(sofaX + 1.25, sz, 0, coffeeTable);
      put(r.x1 - 0.3, sz, -Math.PI / 2, tvUnit(1.8));
      put(r.x0 + 1.5, r.z0 + 1.25, 0, dining());
      put(r.x0 + 0.45, r.z1 - 0.45, 0, plant);
      put(r.x1 - 0.5, r.z1 - 0.45, 0, plant);
    } else if (r.kind === "bed") {
      const bw = w > 4 ? 1.8 : 1.6;
      if (r.head === "e") {
        put(r.x1 - 1.15, cz + 0.2, -Math.PI / 2, bed(bw));
        put(r.x0 + w * 0.42, r.z0 + 0.45, 0, wardrobe(Math.min(2.2, w * 0.45)));
        put(r.x1 - 2.9, cz + 0.2, 0, rug(1.4, 2.2));
      } else {
        put(cx, r.z0 + 1.15, 0, bed(bw));
        put(r.x1 - 0.45, r.z0 + d * 0.5, -Math.PI / 2, wardrobe(Math.min(1.8, d * 0.4)));
      }
    } else if (r.kind === "kitchen") {
      put(r.x0 + 0.38, r.z0 + d * 0.42, Math.PI / 2, counter(d * 0.72, true));
      put(r.x0 + w * 0.55, r.z0 + 0.38, 0, counter(w * 0.7, true));
      put(r.x1 - 0.45, r.z0 + 0.45, 0, fridge);
    } else {
      put(r.x0 + 0.35, r.z0 + 0.75, Math.PI / 2, vanity);
      put(r.x0 + w * 0.55, r.z0 + 0.38, 0, wc);
      put(r.x1 - 0.55, r.z1 - 0.6, 0, shower(0.95));
    }
  }
  return items;
}

// ---------------------------------------------------------------------------------------
// Scene

const box = new THREE.BoxGeometry(1, 1, 1);
const cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 24);
// wall pieces grow from their base
const wallBox = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);


function Apartment({ plan, progress, onReady }: { plan: Plan; progress: Progress; onReady?: () => void }) {
  const { invalidate } = useThree();
  const pieces = useMemo(() => wallPieces(plan.walls), [plan]);
  const lines = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(planLines(plan.walls), 3));
    return g;
  }, [plan]);
  const items = useMemo(() => furnish(plan.rooms), [plan]);

  const wallRefs = useRef<(THREE.Object3D | null)[]>([]);
  const itemRefs = useRef<(THREE.Object3D | null)[]>([]);
  const floorMats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const lineMat = useRef<THREE.LineBasicMaterial>(null);
  const grid = useRef<THREE.GridHelper>(null);
  const roomLights = useRef<(THREE.PointLight | null)[]>([]);
  const glowMats = useRef<THREE.MeshStandardMaterial[]>([]);
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: C.wall, roughness: 0.9 }), []);
  const capMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#2b2a28" }), []);
  const glassMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: C.glass, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.45 }),
    [],
  );
  const finished = useMemo(() => plan.rooms.map((r) => new THREE.Color(C[r.kind])), [plan]);

  useEffect(() => {
    onReady?.();
    invalidate();
  }, [onReady, invalidate]);

  useFrame(({ scene }) => {
    const p = progress.current;
    // walls rise one after another, then each piece of furniture drops into place
    const walls = wallRefs.current;
    walls.forEach((o, i) => {
      if (!o) return;
      const t0 = 0.14 + (i / walls.length) * 0.18;
      const t = clamp01((p - t0) / 0.08);
      o.scale.y = Math.max(0.0001, t);
      o.visible = t > 0;
    });
    const things = itemRefs.current;
    things.forEach((o, i) => {
      if (!o) return;
      const t0 = 0.46 + (i / things.length) * 0.3;
      const t = clamp01((p - t0) / 0.07);
      o.visible = t > 0;
      o.position.y = (1 - t) * 1.6;
      o.scale.setScalar(Math.max(0.0001, 0.6 + 0.4 * easeOutBack(t)));
    });
    // blueprint fades as the finishes arrive; the background deepens so the lit rooms glow
    const fin = smooth(0.32, 0.5, p);
    floorMats.current.forEach((m, i) => m && m.color.copy(PLAN_FILL).lerp(finished[i], fin));
    if (lineMat.current) lineMat.current.opacity = 1 - smooth(0.4, 0.56, p);
    if (grid.current) {
      const gm = grid.current.material as THREE.Material;
      gm.opacity = 0.5 * (1 - smooth(0.3, 0.5, p));
    }
    const lit = smooth(0.76, 0.95, p);
    roomLights.current.forEach((l) => l && (l.intensity = lit * 3));
    glowMats.current.forEach((m) => (m.emissiveIntensity = 0.2 + lit * 1.6));
    const bg = scene.background as THREE.Color | null;
    if (bg) bg.copy(BLUEPRINT).lerp(BLUEPRINT_END, smooth(0.6, 0.95, p));
  });

  const cx = plan.w / 2;
  const cz = plan.d / 2;
  return (
    <group position={[-cx, 0, -cz]}>
      {/* drafting grid and the plan's linework */}
      <gridHelper
        ref={grid}
        args={[40, 80, "#4f6d91", "#3b5677"]}
        position={[cx, -0.005, cz]}
        onUpdate={(g) => {
          const m = g.material as THREE.Material;
          m.transparent = true;
          m.depthWrite = false;
        }}
      />
      <lineSegments geometry={lines} renderOrder={2}>
        <lineBasicMaterial ref={lineMat} color="#dbe6f2" transparent depthTest={false} />
      </lineSegments>

      {/* floors */}
      {plan.rooms.map((r, i) => (
        <mesh
          key={`f${i}`}
          position={[(r.x0 + r.x1) / 2, 0.005, (r.z0 + r.z1) / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[r.x1 - r.x0, r.z1 - r.z0]} />
          <meshStandardMaterial ref={(m) => void (floorMats.current[i] = m)} color={PLAN_FILL} roughness={0.85} />
        </mesh>
      ))}

      {/* walls */}
      {pieces.map((pc, i) => (
        <group key={`w${i}`} ref={(o) => void (wallRefs.current[i] = o)} position={pc.pos} rotation={[0, pc.rotY, 0]}>
          <mesh
            geometry={wallBox}
            material={pc.glass ? glassMat : wallMat}
            scale={pc.size}
            castShadow={!pc.glass}
            receiveShadow
          />
          {/* dark section cut on top of the wall, like an architect's model */}
          {pc.cap && (
            <mesh geometry={box} material={capMat} position={[0, pc.size[1] + 0.005, 0]} scale={[pc.size[0], 0.01, pc.size[2] + 0.002]} />
          )}
        </group>
      ))}

      {/* furniture */}
      {items.map((it, i) => (
        <group key={`i${i}`} ref={(o) => void (itemRefs.current[i] = o)} position={[it.x, 0, it.z]} rotation={[0, it.rot, 0]} visible={false}>
          {it.parts.map((pt, j) => (
            <mesh
              key={j}
              geometry={pt.cyl ? cyl : box}
              position={pt.p}
              scale={pt.s}
              castShadow={!pt.emissive}
              receiveShadow
            >
              {pt.emissive ? (
                <meshStandardMaterial
                  ref={(m) => {
                    if (m && !glowMats.current.includes(m)) glowMats.current.push(m);
                  }}
                  color={pt.c}
                  emissive={pt.c}
                  emissiveIntensity={0.2}
                />
              ) : (
                <meshStandardMaterial color={pt.c} roughness={0.75} metalness={pt.c === C.steel ? 0.5 : 0} />
              )}
            </mesh>
          ))}
        </group>
      ))}

      {/* warm room lights that come on at the end */}
      {plan.rooms.map((r, i) => (
        <pointLight
          key={`l${i}`}
          ref={(l) => void (roomLights.current[i] = l)}
          position={[(r.x0 + r.x1) / 2, 2.2, (r.z0 + r.z1) / 2]}
          color="#ffc985"
          intensity={0}
          distance={r.kind === "living" ? 8 : 5}
          decay={1.6}
        />
      ))}
    </group>
  );
}

// Camera: straight down over the plan, then a sweeping tilt into a close three-quarter view
// of the living room. Wide screens keep the apartment to the right of the headline.
function Rig({ plan, progress, pointer }: { plan: Plan; progress: Progress; pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const { invalidate, size } = useThree();
  const cur = useRef({ x: 0, y: 0, p: 0 });
  const scratch = useRef({
    pos: new THREE.Vector3(),
    look: new THREE.Vector3(),
    a: new THREE.Vector3(),
    b: new THREE.Vector3(),
    right: new THREE.Vector3(),
    up: new THREE.Vector3(),
  });

  useFrame(({ camera }) => {
    const tmp = scratch.current;
    const c = cur.current;
    c.x += (pointer.current.x - c.x) * 0.08;
    c.y += (pointer.current.y - c.y) * 0.08;
    c.p += (progress.current - c.p) * 0.14;
    const p = c.p;
    const aspect = size.width / Math.max(1, size.height);
    const wide = aspect >= 1.15;
    const k = wide ? 1 : Math.min(2.1, 0.97 / aspect);
    const span = Math.max(plan.w, plan.d * 1.3);

    // orbit parameters
    const tilt = smooth(0.05, 0.55, p); // 0 = top-down, 1 = three-quarter
    const push = smooth(0.55, 1, p); // move in towards the living room
    const yaw = THREE.MathUtils.lerp(0, -0.55, tilt) + THREE.MathUtils.lerp(0, -0.1, push) + c.x * 0.08 * (1 - push * 0.5);
    const elev = THREE.MathUtils.lerp(Math.PI / 2 - 0.001, 1.0, tilt) + THREE.MathUtils.lerp(0, -0.12, push) - c.y * 0.04;
    const dist = THREE.MathUtils.lerp(span * 2.0, span * 2.25, tilt) * THREE.MathUtils.lerp(1, 0.86, push) * k;

    const fx = THREE.MathUtils.lerp(0, (plan.focus[0] - plan.w / 2) * 0.45, push);
    const fz = THREE.MathUtils.lerp(0, (plan.focus[1] - plan.d / 2) * 0.45, push);
    tmp.look.set(fx, THREE.MathUtils.lerp(0, 0.6, push), fz);
    tmp.pos.set(
      tmp.look.x + Math.sin(yaw) * Math.cos(elev) * dist,
      tmp.look.y + Math.sin(elev) * dist,
      tmp.look.z + Math.cos(yaw) * Math.cos(elev) * dist,
    );

    // shift the view so the model sits right of the headline (wide) or above it (tall)
    const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov);
    const visH = 2 * Math.tan(fov / 2) * dist;
    tmp.a.subVectors(tmp.look, tmp.pos).normalize();
    tmp.right.crossVectors(tmp.a, camera.up).normalize();
    tmp.up.crossVectors(tmp.right, tmp.a).normalize();
    const shiftX = wide ? -0.15 * visH * aspect : 0;
    // tall screens: keep the model in the top half, clear of the headline
    const shiftY = wide ? 0 : -0.26 * visH;
    tmp.b.copy(tmp.right).multiplyScalar(shiftX).addScaledVector(tmp.up, shiftY);
    camera.position.copy(tmp.pos).add(tmp.b);
    // top-down: keep "north" (the back wall) at the top of the screen
    if (tilt < 0.001) camera.up.set(0, 0, -1);
    else camera.up.set(0, 1, 0);
    camera.lookAt(tmp.look.add(tmp.b));

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

export default function ApartmentScene({
  plan,
  progress,
  onReady,
  onLost,
}: {
  plan: PlanKind;
  progress: Progress;
  onReady?: () => void;
  onLost?: () => void;
}) {
  const pointer = useRef({ x: 0, y: 0 });
  const wrap = useRef<HTMLDivElement>(null);
  const data = PLANS[plan];

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
        camera={{ fov: 32, near: 0.1, far: 200, position: [0, 30, 0.01] }}
        onCreated={({ gl, scene, invalidate }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          scene.background = BLUEPRINT.clone();
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
        <hemisphereLight args={["#fff7ea", "#c9bba6", 1.6]} />
        <ambientLight intensity={0.25} />
        <directionalLight
          position={[-8, 14, 9]}
          intensity={1.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-camera-far={40}
          shadow-bias={-0.0004}
        />
        <Rig plan={data} progress={progress} pointer={pointer} />
        <Apartment plan={data} progress={progress} onReady={onReady} />
      </Canvas>
    </div>
  );
}
