import React from 'react';
import HeroSection from '../../components/marketing/HeroSection';
import FeatureGrid from '../../components/marketing/FeatureGrid';
import CTABanner from '../../components/marketing/CTABanner';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeatureGrid />
      <CTABanner />
    </>
  );
}
