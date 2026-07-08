import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function FerronMark({ className }: { className?: string }) {
  return (
    <img
      src="/assets/brand/favicon.webp"
      alt=""
      aria-hidden="true"
      width={36}
      height={36}
      className={cn("h-8 w-8 shrink-0", className)}
      loading="eager"
      decoding="async"
    />
  );
}

export function Logo({
  showWordmark = true,
  className,
}: {
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <Link
      to="/"
      className={cn(
        "group inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground",
        className,
      )}
      aria-label="Ferron home"
    >
      <FerronMark />
      {showWordmark && <span className="text-xl">Ferron</span>}
    </Link>
  );
}
