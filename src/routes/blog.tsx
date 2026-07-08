import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Search, User } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDate } from "@/lib/format";
import { listPosts } from "@/lib/mock/blog";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Ferron" },
      {
        name: "description",
        content:
          "Ideas, product news, and money-mindset writing from the Ferron team.",
      },
      { property: "og:title", content: "Blog — Ferron" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  const posts = useMemo(() => listPosts(), []);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const categories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.category))),
    [posts],
  );
  const filtered = posts.filter((p) => {
    const q = query.trim().toLowerCase();
    return (
      (!q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)) &&
      (!category || p.category === category)
    );
  });

  return (
    <div className="container-page pt-14 pb-24 md:pt-20">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Ferron blog
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Notes on money, quietly done.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Product updates, research and the occasional strong opinion.
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts…"
              className="w-full rounded-full border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <nav className="mt-6" aria-label="Categories">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Categories
            </p>
            <ul className="mt-3 space-y-1">
              <li>
                <button
                  onClick={() => setCategory(null)}
                  className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                    !category
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  All posts ({posts.length})
                </button>
              </li>
              {categories.map((c) => {
                const count = posts.filter((p) => p.category === c).length;
                return (
                  <li key={c}>
                    <button
                      onClick={() => setCategory(c)}
                      className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                        category === c
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      {c} ({count})
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <div className="space-y-6">
          {filtered.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No posts match your search.
            </p>
          )}
          {filtered.map((p) => (
            <article
              key={p.slug}
              className="group grid gap-6 rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md md:grid-cols-[220px_1fr]"
            >
              <Link
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-primary/30 via-primary/10 to-secondary/30"
                aria-label={p.title}
              >
                <div className="absolute inset-0 grid place-items-center font-display text-6xl font-bold text-foreground/10">
                  {p.title.charAt(0)}
                </div>
              </Link>
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                    {p.category}
                  </span>
                  <span>·</span>
                  <span>{formatDate(p.publishedAt)}</span>
                </div>
                <h2 className="mt-3 text-xl font-bold tracking-tight md:text-2xl">
                  <Link
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="hover:text-primary"
                  >
                    {p.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {p.author}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {p.readingMinutes} min read
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
