'use client';

import AnimatedCounter from '../components/AnimatedCounter';
import SectionReveal from '../components/SectionReveal';
import GlassCard from '../components/GlassCard';
import styles from './StandardsSection.module.css';

const metrics = [
  { value: 100, suffix: '%', label: 'Halal Integrity', desc: 'Every product certified', accent: 'var(--gold)' },
  { value: 50000, suffix: '+', label: 'Families Served', desc: 'Across the region', accent: 'var(--ocean-light)' },
  { value: 4.9, suffix: '★', label: 'Customer Satisfaction', desc: 'Average rating', decimals: 1, accent: 'var(--gold-bright)' },
  { value: 24, suffix: '/7', label: 'Cold Chain Monitoring', desc: 'Never interrupted', accent: 'var(--cyan)' },
  { value: 98, suffix: '%', label: 'Freshness Rating', desc: 'Consistently maintained', accent: 'var(--emerald-glow)' },
];

export default function StandardsSection() {
  return (
    <section className={styles.section} id="standards">
      <div className={styles.bgLayers}>
        <div className={styles.glow1} />
        <div className={styles.glow2} />
        <div className={styles.glow3} />
      </div>

      <div className={styles.container}>
        <SectionReveal>
          <div className={styles.header}>
            <span className={styles.label}>Our Promise</span>
            <h2 className={styles.heading}>
              AL-QURAISH<br />
              <span className="text-gold-gradient">STANDARDS.</span>
            </h2>
          </div>
        </SectionReveal>

        <div className={styles.grid}>
          {metrics.map((metric, i) => (
            <SectionReveal key={metric.label} delay={i * 0.1}>
              <GlassCard accentColor={metric.accent} className={styles.metricCard}>
                <div className={styles.metric}>
                  <div className={styles.metricGlow} style={{ background: `radial-gradient(circle, ${metric.accent}, transparent)` }} />
                  <div className={styles.metricValue}>
                    <AnimatedCounter
                      end={metric.value}
                      suffix={metric.suffix}
                      decimals={metric.decimals || 0}
                      duration={2500}
                    />
                  </div>
                  <h3 className={styles.metricLabel}>{metric.label}</h3>
                  <p className={styles.metricDesc}>{metric.desc}</p>
                </div>
              </GlassCard>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
