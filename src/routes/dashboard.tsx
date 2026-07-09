import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Ferron" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Outlet />,
});
