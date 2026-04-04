"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { InfrastructureSection } from "@/components/landing/infrastructure-section";
import { MetricsSection } from "@/components/landing/metrics-section";
import { IntegrationsSection } from "@/components/landing/integrations-section";
import { SecuritySection } from "@/components/landing/security-section";
import { DevelopersSection } from "@/components/landing/developers-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CtaSection } from "@/components/landing/cta-section";
import { FooterSection } from "@/components/landing/footer-section";

const LANDING_THEME_KEY = "landing-theme";

export default function Home() {
  const [isColorMode, setIsColorMode] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(LANDING_THEME_KEY);
    setIsColorMode(savedTheme === "color");
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LANDING_THEME_KEY, isColorMode ? "color" : "dark");
  }, [isColorMode]);

  return (
    <main
      className={`${isColorMode ? "landing-dark" : "landing-dark grayscale"} min-h-screen overflow-x-hidden bg-background text-foreground`}
    >
      <Navigation
        isColorMode={isColorMode}
        onToggleTheme={() => setIsColorMode((prev) => !prev)}
      />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <InfrastructureSection />
      <MetricsSection />
      <IntegrationsSection />
      <SecuritySection />
      <DevelopersSection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
