import { HeroSection } from "@/components/landing/hero-section";
import { FeatureBlocks } from "@/components/landing/feature-blocks";
import { ContentCategories } from "@/components/landing/content-categories";
import { DndMarquee } from "@/components/landing/dnd-marquee";
import { HeroesCarousel } from "@/components/landing/heroes-carousel";
import { ItemsStrip } from "@/components/landing/items-strip";
import { CtaSection } from "@/components/landing/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeatureBlocks />
      <ContentCategories />
      <DndMarquee />
      <HeroesCarousel />
      <ItemsStrip />
      <CtaSection />
    </>
  );
}
