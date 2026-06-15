'use client';

import Link from 'next/link';
import styles from './FlashDealBanner.module.css';

export default function FlashDealBanner() {
  return (
    <div className="container" style={{ paddingLeft: '24px', paddingRight: '24px', width: '100%' }}>
      <div className={styles.bannerContainer}>
        <div className={styles.contentLeft}>
          <span className={styles.label}>Flash Deal</span>
          <h2 className={styles.title}>Free delivery on orders over ₹599</h2>
          <p className={styles.subtext}>
            Plus get 10% off your first order with code <strong className={styles.code}>FRESH10</strong>.
          </p>
        </div>
        <div className={styles.actionRight}>
          <Link href="/premium-poultry" className={styles.orderButton}>
            <span>Order now</span>
            <span className={styles.arrow}>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
