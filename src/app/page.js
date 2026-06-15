'use client';

import { useEffect } from 'react';
import Navigation from '../components/Navigation';
import HeroSection from '../sections/HeroSection';
import ShopByCategory from '../sections/ShopByCategory';
import WhySection from '../sections/WhySection';
import TestimonialsSection from '../sections/TestimonialsSection';
import DeliveryBanner from '../sections/DeliveryBanner';
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
    <main style={{ background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <HeroSection />
      <ShopByCategory />
      <WhySection />
      <TestimonialsSection />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', padding: '80px 0', background: '#ffffff', width: '100%' }}>
        <DeliveryBanner />
      </div>

      <Footer />
    </main>
  );
}
