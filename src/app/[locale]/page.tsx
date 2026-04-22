import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import GovSchemes from "@/components/GovSchemes";
import ServicesSection from "@/components/ServicesSection";
import WhySevaSansaar from "@/components/WhySevaSansaar";
import Testimonials from "@/components/Testimonials";
import ListBusinessCTA from "@/components/ListBusinessCTA";
import SevaBotWidget from "@/components/SevaBotWidget";
import ScrollRevealSection from "@/components/ScrollRevealSection";

export default function Home() {
  return (
    <>
      <Hero />
      <ScrollRevealSection>
        <Stats />
      </ScrollRevealSection>
      <ScrollRevealSection>
        <GovSchemes />
      </ScrollRevealSection>

      <ServicesSection />

      <ScrollRevealSection>
        <WhySevaSansaar />
      </ScrollRevealSection>
      <ScrollRevealSection>
        <Testimonials />
      </ScrollRevealSection>
      <ScrollRevealSection>
        <ListBusinessCTA />
      </ScrollRevealSection>
      <SevaBotWidget />
    </>
  );
}
