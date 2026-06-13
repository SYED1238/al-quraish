'use client';

import { useRef, useState } from 'react';
import styles from './GlassCard.module.css';

export default function GlassCard({
  children,
  className = '',
  accentColor = 'var(--gold)',
  hoverGlow = false,
  expandOnHover = true,
  onClick,
}) {
  const cardRef = useRef(null);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!hoverGlow || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlowPos({ x, y });
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${expandOnHover ? styles.expandable : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      style={{
        '--glow-x': `${glowPos.x}%`,
        '--glow-y': `${glowPos.y}%`,
        '--accent': accentColor,
      }}
    >
      {hoverGlow && <div className={styles.glowOverlay} />}
      {hoverGlow && <div className={styles.borderGlow} />}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
