// NOTE: TODO backend phase — seed these wallpapers into the Supabase `wallpapers`
// table (bucket: brand-assets). For now they are shipped as CDN assets so the
// picker works end-to-end during the UI phase.
import aurora from "@/assets/wallpapers/aurora.jpg.asset.json";
import dusk from "@/assets/wallpapers/dusk.jpg.asset.json";
import canyon from "@/assets/wallpapers/canyon.jpg.asset.json";

export interface Wallpaper {
  id: string;
  name: string;
  kind: "solid" | "image";
  url?: string;
}

export const WALLPAPERS: Wallpaper[] = [
  { id: "solid", name: "Solid (default)", kind: "solid" },
  { id: "aurora", name: "Aurora", kind: "image", url: aurora.url },
  { id: "dusk", name: "Dusk", kind: "image", url: dusk.url },
  { id: "canyon", name: "Canyon", kind: "image", url: canyon.url },
];
