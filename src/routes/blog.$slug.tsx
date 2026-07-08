import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, User } from "lucide-react";
import { formatDate } from "@/lib/format";
import { getPost, listPosts } from "@/lib/mock/blog";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Post not found — Ferron" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} — Ferron` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${post.slug}` },
        { property: "article:published_time", content: post.publishedAt },
        { property: "article:author", content: post.author },
      ],
      links: [{ rel: "canonical", href: `/blog/${post.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt,
            author: { "@type": "Person", name: post.author },
          }),
        },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const related = listPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <div className="container-page pt-10 pb-24 md:pt-16">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_260px]">
        <article>
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All posts
          </Link>
          <header className="mt-6">
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
              {post.category}
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-balance md:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-border py-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary">
                  <User className="h-4 w-4" />
                </span>
                <span>
                  <span className="font-medium text-foreground">{post.author}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {post.authorRole}
                  </span>
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {post.readingMinutes} min read
              </span>
              <span>{formatDate(post.publishedAt)}</span>
            </div>
          </header>
          <div className="mt-8 aspect-[16/8] w-full rounded-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-secondary/30" />
          <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
            {post.body.map((para: string, i: number) => (
              <p key={i} className="mt-6 text-base leading-relaxed text-foreground/90">
                {para}
              </p>
            ))}
          </div>
        </article>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              More reading
            </p>
            <ul className="mt-4 space-y-4">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: r.slug }}
                    className="block text-sm font-medium text-foreground hover:text-primary"
                  >
                    {r.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(r.publishedAt)} · {r.readingMinutes} min read
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
