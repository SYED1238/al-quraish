'use client';

import Link from 'next/link';
import { Phone, MessageCircle, MapPin, Mail } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.topLine} />

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <span>Q</span>
              </div>
              <div className={styles.logoTextContainer}>
                <span className={styles.logoTextMain}>Al Quresh</span>
                <span className={styles.logoTextSub}>FRESH</span>
              </div>
            </div>
            <p className={styles.tagline}>
              Premium halal-certified fresh chicken, mutton & fish — delivered same-day across Ramanagara.
            </p>
          </div>

          {/* Shop Column */}
          <div className={styles.linkGroup}>
            <h3 className={styles.linkTitle}>Shop</h3>
            <Link href="/premium-poultry?category=Chicken" className={styles.link}>Chicken</Link>
            <Link href="/premium-poultry?category=Mutton" className={styles.link}>Mutton</Link>
            <Link href="/premium-poultry?category=Fish" className={styles.link}>Fish</Link>
            <span className={styles.linkComingSoon}>Masala (coming soon)</span>
          </div>

          {/* Company Column */}
          <div className={styles.linkGroup}>
            <h3 className={styles.linkTitle}>Company</h3>
            <Link href="/#standards" className={styles.link}>About us</Link>
            <Link href="/#contact" className={styles.link}>Contact</Link>
            <Link href="/#faq" className={styles.link}>FAQ</Link>
            <Link href="/#delivery" className={styles.link}>Delivery areas</Link>
          </div>

          {/* Reach Us Column */}
          <div className={styles.linkGroup}>
            <h3 className={styles.linkTitle}>Reach us</h3>
            <div className={styles.contactItem}>
              <Phone size={14} className={styles.contactIcon} />
              <a href="tel:+919663065918" className={styles.contactLink}>+91 96630 65918</a>
            </div>
            <div className={styles.contactItem}>
              <MessageCircle size={14} className={styles.contactIcon} />
              <a href="https://wa.me/919663065918" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>WhatsApp orders</a>
            </div>
            <div className={styles.contactItem}>
              <MapPin size={14} className={styles.contactIcon} />
              <span className={styles.contactText}>Ramanagara, Karnataka 562159</span>
            </div>
            <div className={styles.contactItem}>
              <Mail size={14} className={styles.contactIcon} />
              <a href="mailto:orders@alqureshfresh.com" className={styles.contactLink}>orders@alqureshfresh.com</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottom}>
          <span className={styles.copy}>&copy; 2026 Al Quresh Fresh. All rights reserved.</span>
          <span className={styles.compliance}>100% Halal &bull; FSSAI compliant</span>
        </div>
      </div>
    </footer>
  );
}
