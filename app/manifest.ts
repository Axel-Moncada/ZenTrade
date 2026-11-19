import type { MetadataRoute } from "next";
import icon from "@/data/assets/Favicon-2.png";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zentrade — Trading Journal for Prop Firm Traders",
    short_name: "Zentrade",
    description: "AI trading journal for futures traders passing prop firm evaluations.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#070d07",
    theme_color: "#00c17c",
    icons: [{ src: icon.src, sizes: `${icon.width}x${icon.height}`, type: "image/png" }],
  };
}
