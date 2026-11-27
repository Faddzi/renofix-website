// Projects from the client's Google Drive (inventory 2026-11-27).
// The Drive has no project notes, so there are no descriptions and no areas.
// Brochure images are small (250 to 840 px wide); they are shown at sizes that suit them.

export type Category = "kitchens" | "ceilings" | "bathrooms" | "full-homes" | "commercial";

export const categoryLabels: Record<Category, string> = {
  kitchens: "Kitchens",
  ceilings: "Ceilings",
  bathrooms: "Bathrooms",
  "full-homes": "Full homes",
  commercial: "Commercial",
};

export type Photo = { src: string; alt: string; width: number; height: number };

export type Project = {
  slug: string;
  title: string;
  category: Category;
  cover: Photo;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "living-room-timber-screen",
    title: "Living room with timber screen",
    category: "full-homes",
    featured: true,
    cover: {
      src: "/images/living-room-feature-wall-01.jpg",
      alt: "Living room with two grey sofas, a timber coffee table, printed blinds and a slatted timber screen with round inlays",
      width: 840,
      height: 470,
    },
  },
  {
    slug: "living-room-floral-panel",
    title: "Living room with backlit floral panel",
    category: "full-homes",
    featured: true,
    cover: {
      src: "/images/living-room-floral-panel-01.jpg",
      alt: "Living room with an L-shaped sofa, a backlit floral wall panel, a TV wall and a false ceiling with cove lighting",
      width: 615,
      height: 410,
    },
  },
  {
    slug: "bathroom-floral-border",
    title: "Bathroom with floral border tiles",
    category: "bathrooms",
    featured: true,
    cover: {
      src: "/images/bathroom-floral-border-01.jpg",
      alt: "Bathroom with beige marble-look floor and wall tiles and a grey floral border tile band",
      width: 1500,
      height: 2000,
    },
  },
  {
    slug: "modular-kitchen-granite",
    title: "Modular kitchen with granite counter",
    category: "kitchens",
    featured: true,
    cover: {
      src: "/images/modular-kitchen-granite-01.jpg",
      alt: "Modular kitchen with grey shutters and a speckled white granite counter and backsplash, shutters still in protective film",
      width: 1125,
      height: 2000,
    },
  },
  {
    slug: "dining-room-swing",
    title: "Dining room with swing",
    category: "full-homes",
    featured: true,
    cover: {
      src: "/images/dining-room-swing-01.jpg",
      alt: "Dining area with a timber dining table and a wooden swing on green chains beside the living room",
      width: 470,
      height: 282,
    },
  },
  {
    slug: "commercial-gym",
    title: "Gym fit-out",
    category: "commercial",
    featured: true,
    cover: {
      src: "/images/commercial-gym-01.jpg",
      alt: "Gym floor with graffiti murals, hexagonal ceiling lights and rows of training machines",
      width: 259,
      height: 194,
    },
  },
  {
    slug: "ceiling-cove-lighting",
    title: "False ceiling with cove lighting",
    category: "ceilings",
    cover: {
      src: "/images/ceiling-cove-lighting-01.jpg",
      alt: "Tiered false ceiling with warm cove lighting, timber trim and linear lights",
      width: 250,
      height: 188,
    },
  },
  {
    slug: "modular-kitchen-mint",
    title: "Modular kitchen in mint",
    category: "kitchens",
    cover: {
      src: "/images/modular-kitchen-mint-01.jpg",
      alt: "U-shaped modular kitchen with mint and white shutters and a black granite counter",
      width: 268,
      height: 268,
    },
  },
];
