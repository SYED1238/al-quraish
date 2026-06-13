'use client';

import ParticleField from '../components/ParticleField';
import SectionReveal from '../components/SectionReveal';
import styles from './FinalCTA.module.css';

export default function FinalCTA() {
  return (
    <section className={styles.section}>
      <div className={styles.bgLayers}>
        <div className={styles.glow1} />
        <div className={styles.glow2} />
        <div className={styles.glow3} />
      </div>

      <ParticleField
        particleCount={40}
        color="rgba(201, 169, 110, 0.3)"
        speed={0.15}
        maxSize={2}
        interactive={true}
      />

      <div className={styles.container}>
        <SectionReveal direction="scale">
          <div className={styles.content}>
            <span className={styles.label}>Begin Your Journey</span>
            <h2 className={styles.heading}>
              FROM OUR SOURCE<br />
              <span className={styles.goldText}>TO YOUR TABLE.</span>
            </h2>
            <p className={styles.subtitle}>
              Experience the art of premium halal. Every cut, every catch,
              every delivery — crafted with unwavering dedication to excellence.
            </p>
            <a href="#collection" className={styles.cta}>
              <span>Explore Collection</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
