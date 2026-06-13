'use client';

import Image from 'next/image';
import Link from 'next/link';
import SectionReveal from '../components/SectionReveal';
import styles from './CollectionSection.module.css';

const collections = [
  {
    title: 'Ocean Selection',
    count: '24 Items',
    image: '/images/ocean_selection.png',
    desc: 'Premium wild-caught seafood from the world\'s finest waters',
    href: '#collection',
  },
  {
    title: 'Butcher\'s Reserve',
    count: '18 Items',
    image: '/images/butchers_reserve.png',
    desc: 'Hand-selected cuts aged to perfection by master butchers',
    href: '#collection',
  },
  {
    title: 'Premium Poultry',
    count: '22 Items',
    image: '/images/premium_poultry.png',
    desc: 'Free-range, ethically raised poultry of the highest grade',
    href: '/premium-poultry',
  },
  {
    title: 'Ready To Cook',
    count: '12 Items',
    image: '/images/ready_to_cook.png',
    desc: 'Chef-prepared marinades and seasoned selections',
    href: '#collection',
  },
  {
    title: 'Chef\'s Collection',
    count: '10 Items',
    image: '/images/chefs_collection.png',
    desc: 'Exclusive cuts curated by Michelin-star chefs',
    href: '#collection',
  },
  {
    title: 'Seasonal Specials',
    count: '8 Items',
    image: '/images/seasonal_specials.png',
    desc: 'Limited-edition selections available for a short time',
    href: '#collection',
  },
];

export default function CollectionSection() {
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <section className={styles.section} id="collection">
      <div className={styles.bgLayers}>
        <div className={styles.glow1} />
        <div className={styles.glow2} />
      </div>

      <div className={styles.container}>
        <SectionReveal>
          <div className={styles.header}>
            <span className={styles.label}>Curated Excellence</span>
            <h2 className={styles.heading}>
              <span className={styles.thin}>THE</span>
              <br />
              <span className="text-gold-gradient">COLLECTION.</span>
            </h2>
            <p className={styles.subtitle}>
              Six meticulously curated categories, each representing
              the pinnacle of halal quality and culinary craftsmanship.
            </p>
          </div>
        </SectionReveal>

        <div className={styles.grid}>
          {collections.map((item, i) => (
            <SectionReveal key={item.title} delay={i * 0.1}>
              <Link
                href={item.href}
                className={styles.card}
                onMouseMove={handleMouseMove}
              >
                {/* Visual Highlights */}
                <div className={styles.glow} />
                <div className={styles.sweep} />

                {/* Top 55%: Image Section */}
                <div className={styles.imageContainer}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    quality={100}
                    priority={i < 2}
                    className={styles.image}
                  />
                  <div className={styles.imageOverlay} />
                </div>

                {/* Bottom 45%: Content Section */}
                <div className={styles.content}>
                  <div className={styles.contentDetails}>
                    <span className={styles.cardCount}>{item.count}</span>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <p className={styles.cardDesc}>{item.desc}</p>
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardCTA}>Explore Collection</span>
                    <span className={styles.cardArrow}>→</span>
                  </div>
                </div>
              </Link>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
