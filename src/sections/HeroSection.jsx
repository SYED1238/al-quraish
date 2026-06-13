'use client';

import { useEffect, useRef } from 'react';
import ParticleField from '../components/ParticleField';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const heroRef = useRef(null);
  const headlineRef = useRef(null);

  useEffect(() => {
    const words = headlineRef.current?.querySelectorAll(`.${styles.word}`);
    if (words) {
      words.forEach((word, i) => {
        word.style.animationDelay = `${0.3 + i * 0.15}s`;
      });
    }
  }, []);

  return (
    <section ref={heroRef} className={styles.hero} id="hero">
      {/* Volumetric background */}
      <div className={styles.bgLayers}>
        <div className={styles.oceanDarkness} />
        <div className={styles.lightRay1} />
        <div className={styles.lightRay2} />
        <div className={styles.lightRay3} />
        <div className={styles.ambientGlow1} />
        <div className={styles.ambientGlow2} />
        <div className={styles.fogLayer} />
      </div>

      {/* Particles */}
      <ParticleField
        particleCount={50}
        color="rgba(201, 169, 110, 0.35)"
        speed={0.2}
        maxSize={2}
      />

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.labelContainer}>
          <span className={styles.label}>Premium Halal Excellence</span>
        </div>

        <h1 ref={headlineRef} className={styles.headline}>
          <span className={styles.word}>CRAFTED</span>
          <span className={styles.word}>FOR</span>
          <br />
          <span className={styles.word}>THE</span>
          <span className={styles.word}>FINEST</span>
          <br />
          <span className={`${styles.word} ${styles.goldWord}`}>TABLES.</span>
        </h1>

        <p className={styles.subheadline}>
          Premium halal meats, seafood, poultry and chef-selected cuts{' '}
          <br className={styles.brDesktop} />
          sourced with integrity and delivered with precision.
        </p>

        <div className={styles.actions}>
          <a href="#collection" className={styles.btnPrimary}>
            <span>Explore Collection</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <button className={styles.btnGlass}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            <span>Watch Our Journey</span>
          </button>
        </div>

        <div className={styles.indicators}>
          <div className={styles.indicator}>
            <span className={styles.indicatorDot} />
            <span>100% Halal Certified</span>
          </div>
          <div className={styles.indicatorSep} />
          <div className={styles.indicator}>
            <span className={styles.indicatorDot} style={{ background: 'var(--cyan)' }} />
            <span>Cold Chain Protected</span>
          </div>
          <div className={styles.indicatorSep} />
          <div className={styles.indicator}>
            <span className={styles.indicatorDot} style={{ background: 'var(--emerald)' }} />
            <span>Delivered Fresh Daily</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollLine} />
        <span className={styles.scrollText}>Scroll to explore</span>
      </div>
    </section>
  );
}
