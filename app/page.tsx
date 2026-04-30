import { HeroSection } from "@/components/landing/hero-section";
import { FeatureBlocks } from "@/components/landing/feature-blocks";
import { ContentCategories } from "@/components/landing/content-categories";
import { HeroesCarousel } from "@/components/landing/heroes-carousel";
import { CtaSection } from "@/components/landing/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeatureBlocks />
      <ContentCategories />
      <HeroesCarousel />
      <CtaSection />
    </>
  );
}
