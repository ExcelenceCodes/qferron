import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Twitter } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Newsletter } from "@/components/marketing/newsletter";

const COLS = [
  {
    heading: "Product",
    links: [
      { to: "/features", label: "Features" },
      { to: "/pricing", label: "Pricing" },
      { to: "/blog", label: "Blog" },
      { to: "/feedback", label: "Feedback" },
    ],
  },
  {
    heading: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/blog", label: "News" },
      { to: "/feedback", label: "Contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { to: "/terms", label: "Terms of Service" },
      { to: "/conditions", label: "Conditions of Use" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-sidebar/40">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            All your transactions in one place, with your professional personal
            accountant — quietly working while you live your life.
          </p>
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Join our mail list</p>
            <div className="mt-3">
              <Newsletter variant="footer" />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 text-muted-foreground">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="rounded-md p-2 hover:bg-accent hover:text-foreground">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="rounded-md p-2 hover:bg-accent hover:text-foreground">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="rounded-md p-2 hover:bg-accent hover:text-foreground">
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
        {COLS.map((col) => (
          <div key={col.heading}>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{col.heading}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-foreground/80 transition-colors hover:text-foreground">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Ferron. All rights reserved.</p>
          <p>Built for individuals, freelancers, and small groups worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
