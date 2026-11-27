import type { MetadataRoute } from "next";
import { areas } from "@/lib/areas";

const BASE = "https://renofix.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/portfolio", "/contact", ...areas.map((a) => `/${a.slug}`)];
  return pages.map((p) => ({ url: `${BASE}${p}` }));
}
