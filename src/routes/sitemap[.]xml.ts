import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://qferron.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/features", changefreq: "monthly", priority: "0.9" },
          { path: "/pricing", changefreq: "monthly", priority: "0.9" },
          { path: "/about", changefreq: "monthly", priority: "0.7" },
          { path: "/blog", changefreq: "weekly", priority: "0.8" },
          { path: "/feedback", changefreq: "monthly", priority: "0.5" },
          { path: "/terms", changefreq: "yearly", priority: "0.3" },
          { path: "/conditions", changefreq: "yearly", priority: "0.3" },
        ];

        // Blog posts (mock source; swap to DB fetch in backend phase)
        const { listPosts } = await import("@/lib/mock/blog");
        for (const p of listPosts()) {
          entries.push({
            path: `/blog/${p.slug}`,
            changefreq: "monthly",
            priority: "0.6",
          });
        }

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...entries.map((e) =>
            [
              "  <url>",
              `    <loc>${BASE_URL}${e.path}</loc>`,
              e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : "",
              e.priority ? `    <priority>${e.priority}</priority>` : "",
              "  </url>",
            ]
              .filter(Boolean)
              .join("\n"),
          ),
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
