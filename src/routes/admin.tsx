import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Ferron" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Outlet />,
});
