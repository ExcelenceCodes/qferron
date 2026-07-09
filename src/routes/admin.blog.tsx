import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AppShell, SectionCard } from "@/components/app/app-shell";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listPosts } from "@/lib/mock/blog";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/blog")({
  head: () => ({ meta: [{ title: "Blog — Ferron admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminBlogPage,
});

function AdminBlogPage() {
  const posts = listPosts();
  return (
    <AppShell
      nav={ADMIN_NAV}
      title="Blog"
      subtitle="Draft, publish and manage posts."
      headerRight={
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> New post
        </Button>
      }
    >
      <SectionCard title="All posts">
        <ul className="divide-y divide-border">
          {posts.map((p) => (
            <li key={p.slug} className="flex items-center justify-between py-3">
              <div>
                <Link to="/blog/$slug" params={{ slug: p.slug }} className="text-sm font-medium text-foreground hover:text-primary">
                  {p.title}
                </Link>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDate(p.publishedAt)} · {p.readingMinutes} min read
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Published</Badge>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </AppShell>
  );
}
