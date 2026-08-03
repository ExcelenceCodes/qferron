import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/sign-in", search: { redirect: location.href } });
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin");
    if (!roles || roles.length === 0) {
      throw redirect({ to: "/dashboard" });
    }
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "Admin — Ferron" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Outlet />,
});
