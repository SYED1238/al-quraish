'use client';

import Link from 'next/link';
import styles from './ShopByCategory.module.css';

const categories = [
  {
    title: 'Chicken',
    subtitle: 'Farm fresh, halal cut',
    image: '/images/categories/chicken.png',
    href: '/premium-poultry?category=Chicken'
  },
  {
    title: 'Mutton',
    subtitle: 'Tender, hand-trimmed',
    image: '/images/categories/mutton.png',
    href: '/premium-poultry?category=Mutton'
  },
  {
    title: 'Fish',
    subtitle: 'Daily catch, cleaned',
    image: '/images/categories/fish.png',
    href: '/premium-poultry?category=Fish'
  },
  {
    title: 'Eggs',
    subtitle: 'Farm & country',
    image: '/images/categories/eggs.png',
    href: '/premium-poultry?category=Eggs'
  },
  {
    title: 'Add-ons',
    subtitle: 'Masalas & essentials',
    image: '/images/categories/addons.png',
    href: '/premium-poultry?category=Add-ons'
  }
];

export default function ShopByCategory() {
  return (
    <section className={styles.section} id="categories">
      <div className={styles.container}>
        {/* Header Block */}
        <div className={styles.header}>
          <span className={styles.label}>Featured</span>
          <h2 className={styles.title}>Shop by category</h2>
          <p className={styles.subtitle}>Premium cuts for every kitchen</p>
        </div>

        {/* Categories Grid */}
        <div className={styles.grid}>
          {categories.map((cat) => (
            <Link key={cat.title} href={cat.href} className={styles.card}>
              <div className={styles.imageWrapper}>
                <img 
                  src={cat.image} 
                  alt={cat.title} 
                  className={styles.image}
                />
                <div className={styles.overlay} />
              </div>
              <div className={styles.content}>
                <h3 className={styles.cardTitle}>{cat.title}</h3>
                <p className={styles.cardSubtitle}>{cat.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
