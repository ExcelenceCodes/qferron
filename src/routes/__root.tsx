import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { GuestChatWidget } from "@/components/marketing/guest-chat-widget";
import { WallpaperProvider } from "@/components/wallpaper-provider";
import { BaseCurrencyProvider } from "@/lib/base-currency";
import { AuthProvider } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-destructive">
          Error 500
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Something went wrong on our end. You can try again or head home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ferron — All your transactions in 1 place" },
      {
        name: "description",
        content:
          "Ferron is a global AI-powered personal accountant for individuals and groups. Track every account, automate rules, share safely, and get clear reports.",
      },
      { name: "theme-color", content: "#F97316" },
      { name: "author", content: "Ferron" },
      { property: "og:site_name", content: "Ferron" },
      { property: "og:title", content: "Ferron — Your AI personal accountant" },
      {
        property: "og:description",
        content:
          "All your transactions in one place, with your professional personal accountant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ferron" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/webp", href: "/assets/brand/favicon.webp" },
      { rel: "apple-touch-icon", href: "/assets/brand/favicon.webp" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Ferron",
          url: "/",
          logo: "/assets/brand/favicon.webp",
          slogan:
            "All your transactions in 1 place, with your professional personal accountant.",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AppChrome() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Later phases: hide marketing chrome inside authed / admin shells
  const isMarketing = !pathname.startsWith("/dashboard") && !pathname.startsWith("/admin");
  return (
    <>
      {isMarketing && <SiteHeader />}
      <main className="min-h-[60vh]">
        <Outlet />
      </main>
      {isMarketing && <SiteFooter />}
      {isMarketing && <GuestChatWidget />}
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WallpaperProvider>
          <BaseCurrencyProvider>
            <AppChrome />
          </BaseCurrencyProvider>
        </WallpaperProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
