import * as React from "react";
import { WALLPAPERS, type Wallpaper } from "@/lib/mock/wallpapers";

interface WallpaperContextValue {
  wallpaper: Wallpaper;
  setWallpaperId: (id: string) => void;
  wallpapers: Wallpaper[];
}

const WallpaperContext = React.createContext<WallpaperContextValue | null>(null);

const STORAGE_KEY = "ferron.wallpaper";

export function WallpaperProvider({ children }: { children: React.ReactNode }) {
  const [id, setId] = React.useState<string>("solid");

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setId(stored);
    } catch {
      /* noop */
    }
  }, []);

  const setWallpaperId = React.useCallback((next: string) => {
    setId(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* noop */
    }
  }, []);

  const wallpaper = WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];

  return (
    <WallpaperContext.Provider value={{ wallpaper, setWallpaperId, wallpapers: WALLPAPERS }}>
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
    <div className="pointer-events-none fixed inset-0 -z-10">
      <img src={wallpaper.url} alt="" className="h-full w-full object-cover opacity-30 dark:opacity-20" />
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
    </div>
  );
}
