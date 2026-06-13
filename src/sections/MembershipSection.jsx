'use client';

import SectionReveal from '../components/SectionReveal';
import ParticleField from '../components/ParticleField';
import styles from './MembershipSection.module.css';

const benefits = [
  { icon: '🚀', title: 'Priority Delivery', desc: 'Skip the queue with guaranteed same-day delivery slots' },
  { icon: '🐟', title: 'Exclusive Seasonal Cuts', desc: 'First access to rare, limited-edition seasonal selections' },
  { icon: '💎', title: 'Premium Discounts', desc: 'Up to 20% off on all collections, every order' },
  { icon: '👨‍🍳', title: 'Chef Recommendations', desc: 'Personalized weekly selections from our culinary team' },
  { icon: '🏆', title: 'VIP Collection Access', desc: 'Unlock members-only rare finds and chef specials' },
];

export default function MembershipSection() {
  return (
    <section className={styles.section} id="membership">
      <div className={styles.bgLayers}>
        <div className={styles.goldGlow} />
        <div className={styles.topGlow} />
      </div>

      <ParticleField
        particleCount={30}
        color="rgba(212, 175, 55, 0.3)"
        speed={0.15}
        maxSize={1.5}
        interactive={false}
      />

      <div className={styles.container}>
        <SectionReveal>
          <div className={styles.header}>
            <span className={styles.label}>Exclusive Access</span>
            <h2 className={styles.heading}>
              AL-QURAISH<br />
              <span className={styles.goldText}>PRIME.</span>
            </h2>
            <p className={styles.subtitle}>
              Join the inner circle of discerning food connoisseurs
              who demand nothing less than excellence.
            </p>
          </div>
        </SectionReveal>

        <div className={styles.card}>
          <div className={styles.cardGlow} />
          <div className={styles.cardBorder} />

          <div className={styles.cardContent}>
            <div className={styles.priceSection}>
              <span className={styles.priceLabel}>Annual Membership</span>
              <div className={styles.price}>
                <span className={styles.currency}>₹</span>
                <span className={styles.amount}>16,500</span>
                <span className={styles.period}>/year</span>
              </div>
              <p className={styles.priceNote}>Cancel anytime. No commitments.</p>
            </div>

            <div className={styles.benefitsGrid}>
              {benefits.map((benefit, i) => (
                <SectionReveal key={benefit.title} delay={i * 0.08}>
                  <div className={styles.benefit}>
                    <span className={styles.benefitIcon}>{benefit.icon}</span>
                    <div>
                      <h4 className={styles.benefitTitle}>{benefit.title}</h4>
                      <p className={styles.benefitDesc}>{benefit.desc}</p>
                    </div>
                  </div>
                </SectionReveal>
              ))}
            </div>

            <button className={styles.joinBtn}>
              <span>Become a Member</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
