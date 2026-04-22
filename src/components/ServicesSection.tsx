"use client";

import { useState } from "react";
import Categories from "./Categories";
import FeaturedBusinesses from "./FeaturedBusinesses";
import ScrollRevealSection from "./ScrollRevealSection";

export default function ServicesSection() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  return (
    <>
      <ScrollRevealSection>
        <Categories activeCategory={activeCategory} onSelect={setActiveCategory} />
      </ScrollRevealSection>
      <ScrollRevealSection>
        <FeaturedBusinesses activeCategory={activeCategory} />
      </ScrollRevealSection>
    </>
  );
}
