import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/sign-in", search: { redirect: location.href } });
    }
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "Dashboard — Ferron" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Outlet />,
});
