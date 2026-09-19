import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export interface Wallpaper {
  id: string;
  name: string;
  kind: "solid" | "image";
  url?: string;
}

/** Fallback set, used before the database responds (and if it is empty). */
const FALLBACK: Wallpaper[] = [
  { id: "solid", name: "Solid (default)", kind: "solid" },
  { id: "aurora", name: "Aurora", kind: "image", url: "/media/wallpapers/aurora.jpg" },
  { id: "dusk", name: "Dusk", kind: "image", url: "/media/wallpapers/dusk.jpg" },
  { id: "canyon", name: "Canyon", kind: "image", url: "/media/wallpapers/canyon.jpg" },
];

interface WallpaperContextValue {
  wallpaper: Wallpaper;
  setWallpaperId: (id: string) => void;
  wallpapers: Wallpaper[];
  isLoading: boolean;
}

const WallpaperContext = React.createContext<WallpaperContextValue | null>(null);

const STORAGE_KEY = "ferron.wallpaper";

export function WallpaperProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [id, setId] = React.useState<string>("solid");

  const { data: wallpapers, isLoading } = useQuery({
    queryKey: ["wallpapers"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Wallpaper[]> => {
      const { data, error } = await supabase
        .from("wallpapers")
        .select("key,name,image_path,category")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (error || !data?.length) return FALLBACK;
      return data.map((w) => ({
        id: w.key,
        name: w.name,
        kind: w.image_path ? "image" : "solid",
        url: w.image_path ?? undefined,
      }));
    },
  });

  // Restore last choice from this browser immediately…
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setId(stored);
    } catch {
      /* noop */
    }
  }, []);

  // …then let the saved profile preference win once it loads.
  React.useEffect(() => {
    if (profile?.wallpaper) setId(profile.wallpaper);
  }, [profile?.wallpaper]);

  const setWallpaperId = React.useCallback((next: string) => {
    setId(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* noop */
    }
  }, []);

  const list = wallpapers ?? FALLBACK;
  const wallpaper = list.find((w) => w.id === id) ?? list[0]!;

  return (
    <WallpaperContext.Provider value={{ wallpaper, setWallpaperId, wallpapers: list, isLoading }}>
      {children}
    </WallpaperContext.Provider>
  );
}

export function useWallpaper() {
  const ctx = React.useContext(WallpaperContext);
  if (!ctx) throw new Error("useWallpaper must be used inside WallpaperProvider");
  return ctx;
}

export function WallpaperBackdrop() {
  const { wallpaper } = useWallpaper();
  if (wallpaper.kind === "solid" || !wallpaper.url) return null;
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${wallpaper.url})` }}
      />
      <div className="absolute inset-0 bg-background/55 dark:bg-background/70" />
    </div>
  );
}
