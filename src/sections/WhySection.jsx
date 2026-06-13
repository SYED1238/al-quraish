'use client';

import SectionReveal from '../components/SectionReveal';
import styles from './WhySection.module.css';

const reasons = [
  { title: 'Uncompromising Sourcing', desc: 'We personally vet every source, visiting farms and waters to ensure the absolute highest quality and ethical standards.', number: '01' },
  { title: 'Halal Integrity', desc: 'Every product carries verified halal certification. Our entire supply chain is monitored for full compliance.', number: '02' },
  { title: 'Artisan Processing', desc: 'Master butchers and fishmongers with decades of experience handle every cut with precision and care.', number: '03' },
  { title: 'Cold Chain Excellence', desc: 'From source to your door, temperature is monitored 24/7 with our proprietary IoT tracking system.', number: '04' },
];

export default function WhySection() {
  return (
    <section className={styles.section}>
      <div className={styles.bgLayers}>
        <div className={styles.glow1} />
        <div className={styles.glow2} />
      </div>

      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.left}>
            <SectionReveal>
              <span className={styles.label}>The Difference</span>
              <h2 className={styles.heading}>
                FRESHNESS<br />
                WITHOUT<br />
                <span className="text-gold-gradient">COMPROMISE.</span>
              </h2>
              <p className={styles.desc}>
                At Al-Quraish, freshness is not a feature — it&apos;s the foundation
                of everything we do. Every decision we make, from sourcing to
                delivery, is guided by one principle: absolute, uncompromising quality.
              </p>
            </SectionReveal>
          </div>

          <div className={styles.right}>
            {reasons.map((reason, i) => (
              <SectionReveal key={reason.number} delay={i * 0.12} direction="left">
                <div className={styles.reasonCard}>
                  <span className={styles.reasonNumber}>{reason.number}</span>
                  <div>
                    <h3 className={styles.reasonTitle}>{reason.title}</h3>
                    <p className={styles.reasonDesc}>{reason.desc}</p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
