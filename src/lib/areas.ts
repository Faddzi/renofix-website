// Service-area landing pages, linked from the footer. The client confirmed the service area
// as Mumbai, Thane and Navi Mumbai (2026-11-27). Page bodies reuse the approved copy; only the
// headline, the one-line lead and the meta description below are new, and need approval.

export type Area = {
  slug: string;
  name: string;
  // NEW COPY, to be approved
  headline: string;
  lead: string;
  description: string;
  // Arrival scene at the top of the page: Mumbai dives from the skyline into one lit window,
  // Thane watches an apartment rise from its floor plan, Navi Mumbai watches a modular kitchen
  // assemble itself from an exploded drawing (client's choice: one scene per page).
  arrival: "skyline" | "apartment" | "kitchen";
  // City-centre coordinates, shown as a small label over the scene
  coords: string;
  // Skyline only: the real Renofix room seen through the window the camera flies into
  photo?: { src: string; alt: string };
};

export const areas: Area[] = [
  {
    slug: "interior-design-mumbai",
    name: "Mumbai",
    headline: "Interior design and renovation in Mumbai",
    lead: "Renofix designs and renovates homes and commercial spaces in Mumbai, from a single modular kitchen to a complete home interior.",
    description:
      "Interior design and renovation in Mumbai by Renofix: modular kitchens, ceiling designs, bathroom renovations and complete home interiors. Book a free consultation.",
    arrival: "skyline",
    coords: "19.0760° N, 72.8777° E",
    photo: { src: "/images/living-room-feature-wall-01.jpg", alt: "Living room with two grey sofas, a timber coffee table, printed blinds and a slatted timber screen with round inlays" },
  },
  {
    slug: "interior-design-thane",
    name: "Thane",
    headline: "Interior design and renovation in Thane",
    lead: "Renofix designs and renovates homes and commercial spaces in Thane, from a single modular kitchen to a complete home interior.",
    description:
      "Interior design and renovation in Thane by Renofix: modular kitchens, ceiling designs, bathroom renovations and complete home interiors. Book a free consultation.",
    arrival: "apartment",
    coords: "19.2183° N, 72.9781° E",
  },
  {
    slug: "interior-design-navi-mumbai",
    name: "Navi Mumbai",
    headline: "Interior design and renovation in Navi Mumbai",
    lead: "Renofix designs and renovates homes and commercial spaces in Navi Mumbai, from a single modular kitchen to a complete home interior.",
    description:
      "Interior design and renovation in Navi Mumbai by Renofix: modular kitchens, ceiling designs, bathroom renovations and complete home interiors. Book a free consultation.",
    arrival: "kitchen",
    coords: "19.0330° N, 73.0297° E",
  },
];

export const areaBySlug = (slug: string) => areas.find((a) => a.slug === slug)!;
