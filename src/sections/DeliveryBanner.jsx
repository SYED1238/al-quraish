'use client';

import styles from './DeliveryBanner.module.css';

export default function DeliveryBanner() {
  return (
    <div className="container" style={{ paddingLeft: '24px', paddingRight: '24px', width: '100%' }}>
      <div className={styles.bannerContainer}>
        <div className={styles.contentLeft}>
          <span className={styles.label}>Delivery</span>
          <h2 className={styles.title}>We deliver across Ramanagara</h2>
          <p className={styles.subtext}>
            Pin code 562159 and surrounding areas. Same-day delivery for orders placed before 6 PM.
          </p>
        </div>
        <div className={styles.actionRight}>
          <a href="tel:+919663065918" className={styles.callButton}>
            <span>Call to order</span>
          </a>
        </div>
      </div>
    </div>
  );
}
