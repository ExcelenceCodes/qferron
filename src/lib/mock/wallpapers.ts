// NOTE: TODO backend phase — seed these wallpapers into the Supabase `wallpapers`
// table (bucket: brand-assets). For now they are shipped as CDN assets so the
// picker works end-to-end during the UI phase.
const aurora = { url: "/media/wallpapers/aurora.jpg" };
const dusk = { url: "/media/wallpapers/dusk.jpg" };
const canyon = { url: "/media/wallpapers/canyon.jpg" };

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
