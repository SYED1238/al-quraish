'use client';

import { ShieldCheck, Truck, Leaf, Clock } from 'lucide-react';
import styles from './WhySection.module.css';

const reasons = [
  {
    icon: ShieldCheck,
    title: '100% Halal certified',
    desc: 'Hand-cut by trained halal butchers, every cut traceable.'
  },
  {
    icon: Truck,
    title: 'Same-day delivery',
    desc: 'Order before 6 PM, receive in 90 minutes across Ramanagara.'
  },
  {
    icon: Leaf,
    title: 'Antibiotic-free',
    desc: 'Sourced from trusted farms with zero growth hormones.'
  },
  {
    icon: Clock,
    title: 'Cleaned & cut to order',
    desc: 'Choose your cut, weight and style — we do the rest.'
  }
];

export default function WhySection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>Why Al Quresh Fresh</span>
          <h2 className={styles.heading}>Premium, every single time</h2>
        </div>

        <div className={styles.grid}>
          {reasons.map((reason, i) => {
            const IconComponent = reason.icon;
            return (
              <div key={i} className={styles.card}>
                <div className={styles.iconCircle}>
                  <IconComponent size={24} className={styles.icon} />
                </div>
                <h3 className={styles.cardTitle}>{reason.title}</h3>
                <p className={styles.cardDesc}>{reason.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
