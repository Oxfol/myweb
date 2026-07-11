import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/" }, sitemap: "https://flowerzc.com/sitemap.xml", host: "https://flowerzc.com" }; }
