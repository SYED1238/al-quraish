'use client';

import SectionReveal from '../components/SectionReveal';
import styles from './TestimonialsSection.module.css';

const testimonials = [
  {
    quote: "Al-Quraish has completely transformed how we think about halal food. The quality is truly unmatched — it's like having a Michelin-star kitchen deliver to your home.",
    name: 'Sarah Al-Rashid',
    title: 'Food Enthusiast & Home Chef',
    rating: 5,
  },
  {
    quote: "As a professional chef, I've sourced from hundreds of suppliers. Al-Quraish stands alone in their commitment to freshness, quality, and integrity.",
    name: 'Chef Ahmad Mansour',
    title: 'Executive Chef, The Grand Table',
    rating: 5,
  },
  {
    quote: "The difference is in every bite. Our family gatherings have been elevated to an entirely new level since we discovered Al-Quraish Prime.",
    name: 'Fatima Hassan',
    title: 'Al-Quraish Prime Member',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className={styles.section}>
      <div className={styles.bgGlow} />

      <div className={styles.container}>
        <SectionReveal>
          <div className={styles.header}>
            <span className={styles.label}>Stories of Excellence</span>
            <h2 className={styles.heading}>
              WHAT OUR<br />
              <span className="text-gold-gradient">CONNOISSEURS SAY.</span>
            </h2>
          </div>
        </SectionReveal>

        <div className={styles.grid}>
          {testimonials.map((t, i) => (
            <SectionReveal key={t.name} delay={i * 0.15}>
              <div className={styles.card}>
                <div className={styles.cardGlow} />
                <div className={styles.stars}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className={styles.star}>★</span>
                  ))}
                </div>
                <blockquote className={styles.quote}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className={styles.author}>
                  <div className={styles.avatar}>
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <span className={styles.authorName}>{t.name}</span>
                    <span className={styles.authorTitle}>{t.title}</span>
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
