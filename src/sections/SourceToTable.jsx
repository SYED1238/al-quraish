'use client';

import { useEffect, useRef, useState } from 'react';
import SectionReveal from '../components/SectionReveal';
import styles from './SourceToTable.module.css';

const stages = [
  {
    number: '01',
    title: 'Source',
    subtitle: 'Pristine Origins',
    description: 'Our journey begins at the finest waters and farms around the globe. Each source is personally vetted to meet our uncompromising standards of quality and halal integrity.',
    accent: 'var(--ocean-light)',
    icon: '🌊',
  },
  {
    number: '02',
    title: 'Inspect',
    subtitle: 'Quality Assurance',
    description: 'Every batch undergoes rigorous multi-point inspection by our team of certified experts. Only the top 5% makes it through our selection process.',
    accent: 'var(--emerald)',
    icon: '🔍',
  },
  {
    number: '03',
    title: 'Prepare',
    subtitle: 'Master Craftsmanship',
    description: 'Our master fishmongers and butchers prepare each cut with precision and care, honoring traditional techniques perfected over generations.',
    accent: 'var(--copper)',
    icon: '🔪',
  },
  {
    number: '04',
    title: 'Package',
    subtitle: 'Premium Preservation',
    description: 'State-of-the-art vacuum sealing and temperature-controlled packaging ensures maximum freshness from our facility to your kitchen.',
    accent: 'var(--gold)',
    icon: '📦',
  },
  {
    number: '05',
    title: 'Cold Chain',
    subtitle: '24/7 Monitoring',
    description: 'Our proprietary cold chain technology maintains perfect temperature throughout the entire journey, monitored by real-time IoT sensors.',
    accent: 'var(--cyan)',
    icon: '❄️',
  },
  {
    number: '06',
    title: 'Deliver',
    subtitle: 'To Your Table',
    description: 'Premium insulated packaging arrives at your door within guaranteed timeframes, ensuring the freshness you deserve with every delivery.',
    accent: 'var(--emerald-glow)',
    icon: '🏠',
  },
];

export default function SourceToTable() {
  const [activeStage, setActiveStage] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = rect.height;
      const viewportHeight = window.innerHeight;
      const scrolled = viewportHeight - rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / (sectionHeight + viewportHeight * 0.5)));
      const newStage = Math.min(stages.length - 1, Math.floor(progress * stages.length));
      setActiveStage(newStage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} id="source">
      <div className={styles.bgLayers}>
        <div className={styles.glow1} />
        <div className={styles.glow2} />
      </div>

      <div className={styles.container}>
        <SectionReveal>
          <div className={styles.header}>
            <span className={styles.label}>The Journey</span>
            <h2 className={styles.heading}>
              FROM SOURCE<br />
              <span className="text-gold-gradient">TO TABLE.</span>
            </h2>
            <p className={styles.subtitle}>
              Every step of our process is designed to preserve the integrity,
              freshness, and quality that defines the Al-Quraish experience.
            </p>
          </div>
        </SectionReveal>

        <div className={styles.timeline}>
          {/* Timeline line */}
          <div className={styles.timelineLine}>
            <div
              className={styles.timelineProgress}
              style={{ height: `${((activeStage + 1) / stages.length) * 100}%` }}
            />
          </div>

          {stages.map((stage, i) => (
            <SectionReveal key={stage.number} delay={i * 0.08}>
              <div
                className={`${styles.stage} ${i <= activeStage ? styles.stageActive : ''}`}
                style={{ '--accent': stage.accent }}
              >
                <div className={styles.stageMarker}>
                  <div className={styles.stageNumber}>{stage.number}</div>
                  <div className={styles.stageDot}>
                    <div className={styles.stageDotInner} />
                  </div>
                </div>

                <div className={styles.stageContent}>
                  <div className={styles.stageIcon}>{stage.icon}</div>
                  <div className={styles.stageText}>
                    <span className={styles.stageSubtitle}>{stage.subtitle}</span>
                    <h3 className={styles.stageTitle}>{stage.title}</h3>
                    <p className={styles.stageDesc}>{stage.description}</p>
                  </div>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
