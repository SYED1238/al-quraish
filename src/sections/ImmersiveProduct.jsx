'use client';

import { useState } from 'react';
import SectionReveal from '../components/SectionReveal';
import styles from './ImmersiveProduct.module.css';

const hotspots = [
  { id: 'origin', label: 'Origin', detail: 'Wild-caught from pristine Atlantic waters', x: 20, y: 35, icon: '🌊' },
  { id: 'freshness', label: 'Freshness', detail: 'Processed within 4 hours of catch', x: 75, y: 25, icon: '❄️' },
  { id: 'processing', label: 'Processing', detail: 'Hand-selected by master fishmongers', x: 30, y: 70, icon: '✋' },
  { id: 'delivery', label: 'Delivery', detail: 'Cold-chain protected to your door', x: 80, y: 65, icon: '🚚' },
];

export default function ImmersiveProduct() {
  const [activeHotspot, setActiveHotspot] = useState(null);

  return (
    <section className={styles.section}>
      <div className={styles.bgGlow} />

      <div className={styles.container}>
        <SectionReveal>
          <div className={styles.labelRow}>
            <span className={styles.label}>Signature Showcase</span>
          </div>
        </SectionReveal>

        <div className={styles.showcase}>
          {/* Product visual */}
          <div className={styles.productFrame}>
            <div className={styles.productGlow} />
            <div className={styles.product}>
              <div className={styles.productInner}>
                {/* Stylized fish silhouette using CSS */}
                <div className={styles.fishVisual}>
                  <svg viewBox="0 0 400 200" className={styles.fishSvg}>
                    <defs>
                      <linearGradient id="fishGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1d7ca3" />
                        <stop offset="50%" stopColor="#48cae4" />
                        <stop offset="100%" stopColor="#006d77" />
                      </linearGradient>
                      <filter id="fishGlow">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <path
                      d="M50,100 Q100,30 200,50 Q280,20 350,60 Q380,80 350,100 Q380,120 350,140 Q280,180 200,150 Q100,170 50,100 Z"
                      fill="url(#fishGrad)"
                      filter="url(#fishGlow)"
                      opacity="0.8"
                    />
                    <circle cx="300" cy="85" r="8" fill="rgba(0,0,0,0.5)" />
                    <circle cx="302" cy="83" r="3" fill="rgba(255,255,255,0.6)" />
                    {/* Fin details */}
                    <path d="M180,55 Q200,20 220,50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    <path d="M150,60 Q165,30 180,55" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    {/* Tail */}
                    <path d="M50,100 Q20,70 30,50 Q40,80 50,100 Q40,120 30,150 Q20,130 50,100" fill="url(#fishGrad)" opacity="0.6" />
                    {/* Scale pattern */}
                    <pattern id="scales" width="15" height="15" patternUnits="userSpaceOnUse">
                      <circle cx="7.5" cy="7.5" r="6" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                    </pattern>
                    <path
                      d="M80,100 Q120,45 200,55 Q270,35 340,70 Q370,85 340,100 Q370,115 340,130 Q270,165 200,145 Q120,155 80,100 Z"
                      fill="url(#scales)"
                    />
                  </svg>
                </div>
                <div className={styles.reflection} />
              </div>
            </div>

            {/* Hotspots */}
            {hotspots.map((spot) => (
              <div
                key={spot.id}
                className={`${styles.hotspot} ${activeHotspot === spot.id ? styles.hotspotActive : ''}`}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                onMouseEnter={() => setActiveHotspot(spot.id)}
                onMouseLeave={() => setActiveHotspot(null)}
              >
                <div className={styles.hotspotPulse} />
                <div className={styles.hotspotDot} />
                <div className={styles.hotspotTooltip}>
                  <span className={styles.hotspotIcon}>{spot.icon}</span>
                  <span className={styles.hotspotLabel}>{spot.label}</span>
                  <span className={styles.hotspotDetail}>{spot.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
