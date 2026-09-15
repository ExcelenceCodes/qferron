# Modern dashboard and advanced SEO/GEO

## Dashboard UI
- Rework the shared dashboard shell into the selected Floating Glass direction while retaining Ferron’s orange/navy identity and every existing action.
- Detach the desktop side menu from all viewport edges, add a compact floating top bar, and preserve the mobile drawer behavior.
- Standardize buttons, icon controls, inputs, panels, menus, cards, badges, and dialogs around a strict 4px maximum corner radius.
- Add restrained glass, border, shadow, hover, and focus effects through semantic design tokens, with matching dark mode and reduced-motion behavior.
- Tighten spacing and typography for clearer financial scanning without reducing information density.

## SEO and GEO
- Use the published Ferron domain for every public canonical URL, Open Graph URL, sitemap entry, and organization reference.
- Complete unique per-page title, description, Open Graph, Twitter card, type, and URL metadata across all public content routes.
- Add useful structured data: Organization/WebSite/SoftwareApplication on the homepage, BreadcrumbList on deeper public pages, and Article data on blog posts.
- Add `/llms.txt` containing only safe public pages for AI assistants; exclude accounts, authentication, administration, and APIs.
- Repair crawler discovery by adding the sitemap directive to robots.txt and emitting absolute sitemap URLs.
- Preserve noindex protection for account, authentication, onboarding, and administration pages.

## Validation
- Check the dashboard at desktop and mobile sizes, including navigation, controls, content overflow, light/dark contrast, and the 4px radius limit.
- Verify the live sitemap, robots, llms.txt, route metadata, structured data, build output, and refreshed SEO findings.

## Technical details
- Shared visual changes will be centered in `src/styles.css`, the Button design component, and the dashboard shell rather than duplicated page-by-page.
- The 4px cap will be enforced by global radius tokens and targeted cleanup of explicit larger-radius utilities in dashboard-facing UI.
- Search metadata will remain in TanStack route `head()` definitions, with canonical links only on leaf routes.
