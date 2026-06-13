'use client';

import SectionReveal from '../components/SectionReveal';
import styles from './SignatureCatches.module.css';

const products = [
  {
    name: 'King Fish',
    origin: 'Arabian Gulf',
    freshness: 98,
    eta: 'Next Day',
    preparations: ['Whole', 'Fillet', 'Steaks'],
    gradient: 'linear-gradient(135deg, #0d3b66, #1d7ca3)',
    price: 'From ₹3,700',
  },
  {
    name: 'Red Snapper',
    origin: 'Indian Ocean',
    freshness: 96,
    eta: 'Next Day',
    preparations: ['Whole', 'Fillet', 'Cleaned'],
    gradient: 'linear-gradient(135deg, #8b2500, #cd5c5c)',
    price: 'From ₹3,150',
  },
  {
    name: 'Atlantic Salmon',
    origin: 'Norwegian Fjords',
    freshness: 99,
    eta: 'Same Day',
    preparations: ['Fillet', 'Steaks', 'Smoked'],
    gradient: 'linear-gradient(135deg, #cd7f32, #daa06d)',
    price: 'From ₹4,300',
  },
  {
    name: 'Premium Lamb',
    origin: 'New Zealand',
    freshness: 97,
    eta: 'Next Day',
    preparations: ['Rack', 'Leg', 'Chops', 'Ground'],
    gradient: 'linear-gradient(135deg, #8b6914, #c9a96e)',
    price: 'From ₹5,400',
  },
  {
    name: 'Chicken Supreme',
    origin: 'Free Range Farms',
    freshness: 99,
    eta: 'Same Day',
    preparations: ['Whole', 'Breast', 'Thighs', 'Wings'],
    gradient: 'linear-gradient(135deg, #2d6a4f, #52b788)',
    price: 'From ₹2,300',
  },
];

export default function SignatureCatches() {
  return (
    <section className={styles.section}>
      <div className={styles.bgGlow} />

      <div className={styles.headerContainer}>
        <SectionReveal>
          <span className={styles.label}>Handpicked Selection</span>
          <h2 className={styles.heading}>
            SIGNATURE<br />
            <span className="text-gold-gradient">CATCHES.</span>
          </h2>
        </SectionReveal>
      </div>

      <div className={styles.gallery}>
        <div className={styles.track}>
          {products.map((product, i) => (
            <div key={product.name} className={styles.card}>
              <div className={styles.cardVisual} style={{ background: product.gradient }}>
                <div className={styles.cardShine} />
                <span className={styles.visualText}>{product.name.charAt(0)}</span>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{product.name}</h3>
                  <span className={styles.cardPrice}>{product.price}</span>
                </div>

                <div className={styles.freshBar}>
                  <div className={styles.freshLabel}>
                    <span>Freshness Index</span>
                    <span className={styles.freshValue}>{product.freshness}%</span>
                  </div>
                  <div className={styles.freshTrack}>
                    <div
                      className={styles.freshFill}
                      style={{ width: `${product.freshness}%` }}
                    />
                  </div>
                </div>

                <div className={styles.meta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Origin</span>
                    <span className={styles.metaValue}>{product.origin}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Delivery</span>
                    <span className={styles.metaValue}>{product.eta}</span>
                  </div>
                </div>

                <div className={styles.preps}>
                  {product.preparations.map((prep) => (
                    <span key={prep} className={styles.prepTag}>{prep}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
