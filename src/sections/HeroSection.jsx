'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, ShieldCheck, Leaf, Star, ArrowRight } from 'lucide-react';
import ParticleField from '../components/ParticleField';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero} id="hero">
      {/* Ambient backgrounds for luxury feel */}
      <div className={styles.bgLayers}>
        <div className={styles.ambientGlow1} />
        <div className={styles.ambientGlow2} />
      </div>

      {/* Particles */}
      <ParticleField
        particleCount={40}
        color="rgba(212, 175, 55, 0.2)"
        speed={0.15}
        maxSize={2}
      />

      <div className={styles.container}>
        {/* Left Column: Content */}
        <div className={styles.contentCol}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            <span>100% Halal • Hand-cut daily</span>
          </div>

          <h1 className={styles.headline}>
            The freshest meat, <br />
            <span className={styles.highlightText}>delivered to your door.</span>
          </h1>

          <p className={styles.subheadline}>
            Premium chicken, mutton, fish and farm-fresh eggs sourced with integrity and delivered fresh daily to your kitchen in Ramanagara.
          </p>

          <div className={styles.actions}>
            <Link href="/premium-poultry" className={styles.btnGold}>
              <span>Shop fresh now</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/premium-poultry" className={styles.btnOutline}>
              <span>Browse categories</span>
            </Link>
          </div>

          <div className={styles.trustIndicators}>
            <div className={styles.trustItem}>
              <div className={styles.trustIconWrapper}>
                <Clock size={16} />
              </div>
              <div className={styles.trustText}>
                <span className={styles.trustTitle}>90-Min Delivery</span>
                <span className={styles.trustDesc}>Superfast shipping</span>
              </div>
            </div>
            <div className={styles.trustDivider} />
            <div className={styles.trustItem}>
              <div className={styles.trustIconWrapper}>
                <ShieldCheck size={16} />
              </div>
              <div className={styles.trustText}>
                <span className={styles.trustTitle}>FSSAI Certified</span>
                <span className={styles.trustDesc}>Safe & hygienic</span>
              </div>
            </div>
            <div className={styles.trustDivider} />
            <div className={styles.trustItem}>
              <div className={styles.trustIconWrapper}>
                <Leaf size={16} />
              </div>
              <div className={styles.trustText}>
                <span className={styles.trustTitle}>Antibiotic-Free</span>
                <span className={styles.trustDesc}>100% natural feed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Presentation */}
        <div className={styles.visualCol}>
          <div className={styles.imageCardContainer}>
            <div className={styles.imageWrapper}>
              <img 
                src="/images/fresh_meats_hero.png" 
                alt="Al Quresh Premium Fresh Meats" 
                className={styles.heroImage}
              />
            </div>
            
            {/* Overlay Rating Card */}
            <div className={styles.ratingCard}>
              <div className={styles.starsRow}>
                <Star size={14} fill="#d4af37" color="#d4af37" />
                <Star size={14} fill="#d4af37" color="#d4af37" />
                <Star size={14} fill="#d4af37" color="#d4af37" />
                <Star size={14} fill="#d4af37" color="#d4af37" />
                <Star size={14} fill="#d4af37" color="#d4af37" />
              </div>
              <span className={styles.ratingStats}>4.9 from 2,400+ orders</span>
              <span className={styles.ratingLabel}>Rated by Ramanagara families</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
