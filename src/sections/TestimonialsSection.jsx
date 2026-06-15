'use client';

import styles from './TestimonialsSection.module.css';

const testimonials = [
  {
    quote: 'Best mutton in the city. Came perfectly trimmed and reached in just over an hour. Will reorder for sure.',
    name: 'Asma F.',
    title: 'Verified Buyer',
    rating: 5
  },
  {
    quote: 'Beautiful packaging and the chicken was unbelievably fresh. Honestly better than the local shop near my house.',
    name: 'Rahul N.',
    title: 'Verified Buyer',
    rating: 5
  },
  {
    quote: 'I order eggs and curry leaves every week. So convenient and the quality is consistently top-notch.',
    name: 'Priya S.',
    title: 'Verified Buyer',
    rating: 5
  }
];

export default function TestimonialsSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>Reviews</span>
          <h2 className={styles.heading}>Loved by Ramanagara</h2>
        </div>

        <div className={styles.grid}>
          {testimonials.map((t, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.stars}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} className={styles.star}>★</span>
                ))}
              </div>
              <blockquote className={styles.quote}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className={styles.author}>
                <span className={styles.authorName}>— {t.name}, {t.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
