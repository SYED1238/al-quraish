'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './SectionReveal.module.css';

export default function SectionReveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  stagger = 0.1,
  threshold = 0.15,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${styles[direction]} ${visible ? styles.visible : ''} ${className}`}
      style={{
        '--delay': `${delay}s`,
        '--stagger': `${stagger}s`,
      }}
    >
      {children}
    </div>
  );
}
