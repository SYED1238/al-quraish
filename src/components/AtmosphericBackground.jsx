'use client';

import { useEffect, useRef } from 'react';
import styles from './AtmosphericBackground.module.css';

export default function AtmosphericBackground() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;

    const initParticles = (w, h) => {
      const pArray = [];
      const particleCount = 70; // Luxury dust density
      for (let i = 0; i < particleCount; i++) {
        // Gold / emerald fireflies mix
        const isGold = Math.random() > 0.45;
        const color = isGold 
          ? 'rgba(212, 175, 55, 0.16)' // Signature gold dust
          : 'rgba(82, 183, 136, 0.12)'; // Soft forest green
        
        pArray.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.12, // Subconscious drifting
          vy: (Math.random() - 0.5) * 0.12,
          size: Math.random() * 2.2 + 0.6,
          color: color,
          opacity: Math.random() * 0.45 + 0.1,
          pulseSpeed: Math.random() * 0.012 + 0.004,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
      return pArray;
    };

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent?.clientWidth || window.innerWidth;
      height = parent?.clientHeight || window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      particlesRef.current = initParticles(width, height);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    canvas.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.008;

      particlesRef.current.forEach((p) => {
        // Update positions
        p.x += p.vx;
        p.y += p.vy;

        // Wrap boundaries
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Interactive mouse repulsion
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          p.x -= (dx / dist) * force * 0.7;
          p.y -= (dy / dist) * force * 0.7;
        }

        // Firefly breathing animation
        const pulse = Math.sin(time * 1.5 + p.pulsePhase) * 0.3 + 0.7;
        const opacity = p.opacity * pulse;

        // Draw particle Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        const drawColor = p.color.replace(/[\d.]+\)$/, `${opacity})`);
        ctx.fillStyle = drawColor;
        ctx.fill();

        // Radial glow wrapper
        if (p.size > 1.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(
            p.x, p.y, 0,
            p.x, p.y, p.size * 3.5
          );
          gradient.addColorStop(0, p.color.replace(/[\d.]+\)$/, `${opacity * 0.35})`));
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className={styles.backgroundContainer}>
      {/* Giant Blurred Emerald Orbs */}
      <div className={styles.orbsContainer}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
      </div>

      {/* Volumetric Green Light Beams */}
      <div className={styles.lightBeamsContainer}>
        <div className={`${styles.lightBeam} ${styles.beam1}`} />
        <div className={`${styles.lightBeam} ${styles.beam2}`} />
        <div className={`${styles.lightBeam} ${styles.beam3}`} />
      </div>

      {/* Forest Fog Effect */}
      <div className={styles.fogContainer}>
        <div className={styles.fogLayer} />
      </div>

      {/* Floating Dust Particles */}
      <div className={styles.canvasContainer}>
        <canvas ref={canvasRef} />
      </div>

      {/* Subtle Luxury Grain Texture */}
      <div 
        className={styles.textureOverlay}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Vignette Edge */}
      <div className={styles.vignette} />
    </div>
  );
}
