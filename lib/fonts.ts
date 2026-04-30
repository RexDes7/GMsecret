import localFont from "next/font/local";
import { Cinzel } from "next/font/google";

/**
 * Dudka — body font, custom local family delivered with the project.
 * See /public/fonts/.
 */
export const dudka = localFont({
  src: [
    { path: "../public/fonts/Dudka Thin.ttf", weight: "200", style: "normal" },
    {
      path: "../public/fonts/Dudka Thin Italic.ttf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../public/fonts/Dudka Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Dudka Regular Italic.ttf",
      weight: "400",
      style: "italic",
    },
    { path: "../public/fonts/Dudka Bold.ttf", weight: "700", style: "normal" },
    {
      path: "../public/fonts/Dudka Bold Italic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-dudka",
  display: "swap",
  preload: true,
});

/**
 * Cinzel — display font for headings (medieval-fantasy feel).
 */
export const cinzel = Cinzel({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-cinzel",
  display: "swap",
});
