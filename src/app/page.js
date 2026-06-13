'use client';

import { useEffect } from 'react';
import Navigation from '../components/Navigation';
import HeroSection from '../sections/HeroSection';
import ImmersiveProduct from '../sections/ImmersiveProduct';
import CollectionSection from '../sections/CollectionSection';
import SignatureCatches from '../sections/SignatureCatches';
import SourceToTable from '../sections/SourceToTable';
import StandardsSection from '../sections/StandardsSection';
import ExperienceSection from '../sections/ExperienceSection';
import ProductUniverse from '../sections/ProductUniverse';
import MembershipSection from '../sections/MembershipSection';
import TestimonialsSection from '../sections/TestimonialsSection';
import WhySection from '../sections/WhySection';
import FinalCTA from '../sections/FinalCTA';
import Footer from '../sections/Footer';

export default function Home() {
  useEffect(() => {
    // Initialize Lenis smooth scrolling
    let lenis;
    const initLenis = async () => {
      try {
        const Lenis = (await import('lenis')).default;
        lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          direction: 'vertical',
          gestureDirection: 'vertical',
          smooth: true,
          smoothTouch: false,
          touchMultiplier: 2,
        });

        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      } catch (e) {
        console.log('Lenis not available, using native scroll');
      }
    };

    initLenis();

    return () => {
      if (lenis) lenis.destroy();
    };
  }, []);

  return (
    <main>
      <Navigation />
      <HeroSection />
      <ImmersiveProduct />
      <CollectionSection />
      <SignatureCatches />
      <SourceToTable />
      <StandardsSection />
      <ExperienceSection />
      <ProductUniverse />
      <MembershipSection />
      <TestimonialsSection />
      <WhySection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
