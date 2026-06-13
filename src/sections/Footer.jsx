'use client';

import { useState } from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.topLine} />

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <h2 className={styles.logo}>AL-QURAISH</h2>
            <p className={styles.tagline}>
              Crafted for the finest tables.<br />
              Premium halal excellence since 2018.
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4l11.7 16h4.3L8.3 4H4z" />
                  <path d="M4 20l6.8-8M13.2 12L20 4" />
                </svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="4" width="20" height="16" rx="4" />
                  <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className={styles.linkGroup}>
            <h3 className={styles.linkTitle}>Collection</h3>
            <a href="#" className={styles.link}>Ocean Selection</a>
            <a href="#" className={styles.link}>Butcher&apos;s Reserve</a>
            <a href="#" className={styles.link}>Premium Poultry</a>
            <a href="#" className={styles.link}>Chef&apos;s Collection</a>
          </div>

          <div className={styles.linkGroup}>
            <h3 className={styles.linkTitle}>Company</h3>
            <a href="#" className={styles.link}>Our Story</a>
            <a href="#" className={styles.link}>Standards</a>
            <a href="#" className={styles.link}>Sustainability</a>
            <a href="#" className={styles.link}>Careers</a>
          </div>

          {/* Newsletter */}
          <div className={styles.newsletter}>
            <h3 className={styles.linkTitle}>Stay Connected</h3>
            <p className={styles.newsletterDesc}>
              Receive exclusive offers, seasonal selections, and culinary inspiration.
            </p>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                id="newsletter-email"
                aria-label="Email for newsletter"
                required
              />
              <button type="submit" className={styles.submitBtn}>→</button>
            </form>
          </div>
        </div>

        <div className={styles.bottom}>
          <span className={styles.copy}>&copy; 2024 Al-Quraish. All rights reserved.</span>
          <div className={styles.bottomLinks}>
            <a href="#" className={styles.bottomLink}>Privacy</a>
            <a href="#" className={styles.bottomLink}>Terms</a>
            <a href="#" className={styles.bottomLink}>Halal Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
