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
};

export const areas: Area[] = [
  {
    slug: "interior-design-mumbai",
    name: "Mumbai",
    headline: "Interior design and renovation in Mumbai",
    lead: "Renofix designs and renovates homes and commercial spaces in Mumbai, from a single modular kitchen to a complete home interior.",
    description:
      "Interior design and renovation in Mumbai by Renofix: modular kitchens, ceiling designs, bathroom renovations and complete home interiors. Book a free consultation.",
  },
  {
    slug: "interior-design-thane",
    name: "Thane",
    headline: "Interior design and renovation in Thane",
    lead: "Renofix designs and renovates homes and commercial spaces in Thane, from a single modular kitchen to a complete home interior.",
    description:
      "Interior design and renovation in Thane by Renofix: modular kitchens, ceiling designs, bathroom renovations and complete home interiors. Book a free consultation.",
  },
  {
    slug: "interior-design-navi-mumbai",
    name: "Navi Mumbai",
    headline: "Interior design and renovation in Navi Mumbai",
    lead: "Renofix designs and renovates homes and commercial spaces in Navi Mumbai, from a single modular kitchen to a complete home interior.",
    description:
      "Interior design and renovation in Navi Mumbai by Renofix: modular kitchens, ceiling designs, bathroom renovations and complete home interiors. Book a free consultation.",
  },
];

export const areaBySlug = (slug: string) => areas.find((a) => a.slug === slug)!;
