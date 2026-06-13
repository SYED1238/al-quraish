'use client';

import GlassCard from '../components/GlassCard';
import SectionReveal from '../components/SectionReveal';
import styles from './ExperienceSection.module.css';

const experiences = [
  { title: 'Family Feast', desc: 'Curated selections for memorable family gatherings', icon: '👨‍👩‍👧‍👦', items: '15+ items', gradient: 'linear-gradient(135deg, #c9a96e, #8b6914)' },
  { title: 'Weekend Grill', desc: 'Premium cuts perfect for outdoor grilling sessions', icon: '🔥', items: '12+ items', gradient: 'linear-gradient(135deg, #cd5c5c, #8b2500)' },
  { title: 'Luxury Dining', desc: 'Restaurant-grade selections for elevated home dining', icon: '🍽️', items: '10+ items', gradient: 'linear-gradient(135deg, #d4af37, #c9a96e)' },
  { title: 'Traditional Recipes', desc: 'Heritage cuts for time-honored family recipes', icon: '📜', items: '18+ items', gradient: 'linear-gradient(135deg, #b87333, #cd7f32)' },
  { title: 'Fitness Protein', desc: 'Lean, high-protein selections for active lifestyles', icon: '💪', items: '14+ items', gradient: 'linear-gradient(135deg, #2d6a4f, #52b788)' },
  { title: 'Chef\'s Selection', desc: 'Exclusive picks by our culinary advisory board', icon: '⭐', items: '8+ items', gradient: 'linear-gradient(135deg, #1d7ca3, #48cae4)' },
];

export default function ExperienceSection() {
  return (
    <section className={styles.section} id="experience">
      <div className={styles.bgGlow} />

      <div className={styles.container}>
        <SectionReveal>
          <div className={styles.header}>
            <span className={styles.label}>Curated For You</span>
            <h2 className={styles.heading}>
              SHOP BY<br />
              <span className="text-gold-gradient">EXPERIENCE.</span>
            </h2>
            <p className={styles.subtitle}>
              Not just categories. Curated experiences designed around how you live, cook, and celebrate.
            </p>
          </div>
        </SectionReveal>

        <div className={styles.grid}>
          {experiences.map((exp, i) => (
            <SectionReveal key={exp.title} delay={i * 0.08}>
              <GlassCard className={styles.expCard}>
                <div className={styles.expContent}>
                  <div className={styles.expGradient} style={{ background: exp.gradient }} />
                  <div className={styles.expIcon}>{exp.icon}</div>
                  <h3 className={styles.expTitle}>{exp.title}</h3>
                  <p className={styles.expDesc}>{exp.desc}</p>
                  <div className={styles.expFooter}>
                    <span className={styles.expItems}>{exp.items}</span>
                    <span className={styles.expArrow}>Explore →</span>
                  </div>
                </div>
              </GlassCard>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
