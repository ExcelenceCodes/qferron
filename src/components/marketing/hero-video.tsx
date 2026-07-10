import * as React from "react";
import heroVideoAsset from "@/assets/video/hero-bg.mp4.asset.json";
import { cn } from "@/lib/utils";

interface HeroVideoProps {
  /** Optional custom source; defaults to the branded hero mp4. */
  src?: string;
  /** Theme-matched overlay class. Defaults to a 50% opacity gradient. */
  overlayClassName?: string;
  className?: string;
  children: React.ReactNode;
  poster?: string;
}

/**
 * Full-bleed hero video background with a semi-transparent, theme-matching layer.
 * The overlay uses primary/secondary tokens so it adapts to light/dark themes.
 */
export function HeroVideo({
  src,
  overlayClassName,
  className,
  children,
  poster,
}: HeroVideoProps) {
  return (
    <section className={cn("relative isolate overflow-hidden", className)}>
      <video
        aria-hidden="true"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={poster}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      >
        <source src={src ?? heroVideoAsset.url} type="video/mp4" />
      </video>
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 -z-10",
          "bg-gradient-to-br from-background/85 via-background/70 to-secondary/60",
          "dark:from-background/85 dark:via-background/75 dark:to-secondary/40",
          overlayClassName,
        )}
      />
      {children}
    </section>
  );
}

interface SubHeroImageProps {
  src: string;
  alt?: string;
  overlayClassName?: string;
  className?: string;
  children: React.ReactNode;
}

export function SubHero({
  src,
  alt = "",
  overlayClassName,
  className,
  children,
}: SubHeroImageProps) {
  return (
    <section className={cn("relative isolate overflow-hidden", className)}>
      <img
        aria-hidden={!alt}
        alt={alt}
        src={src}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 -z-10",
          "bg-gradient-to-tr from-background/85 via-background/70 to-primary/40",
          "dark:from-background/85 dark:via-background/75 dark:to-primary/30",
          overlayClassName,
        )}
      />
      {children}
    </section>
  );
}
