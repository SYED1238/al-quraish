'use client';

import { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import SectionReveal from '../components/SectionReveal';
import { useCartWishlist } from '../context/CartWishlistContext';
import { productsService } from '../services/products';
import styles from './ProductUniverse.module.css';

export default function ProductUniverse() {
  const { cart, addToCart, updateCartQty } = useCartWishlist();
  const [universeList, setUniverseList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniverse = async () => {
      setLoading(true);
      const data = await productsService.getAllProducts();
      const idsToShow = [
        'norwegian_salmon_fillet',
        'wagyu_lamb_rack',
        'king_prawns_xl',
        'organic_chicken_breast_universe',
        'ribeye_steak_premium',
        'wild_sea_bass'
      ];
      const filtered = data.filter(p => idsToShow.includes(p.id));
      if (filtered.length > 0) {
        setUniverseList(filtered);
      } else {
        // Fallback: get items that aren't premium- poultry cuts
        setUniverseList(data.filter(p => p.category !== 'Chicken' || p.id === 'organic_chicken_breast_universe'));
      }
      setLoading(false);
    };
    fetchUniverse();
  }, []);

  const categoryGradients = {
    'Seafood': 'linear-gradient(135deg, #cd7f32, #daa06d)',
    'Meat': 'linear-gradient(135deg, #8b2500, #cd5c5c)',
    'Poultry': 'linear-gradient(135deg, #2d6a4f, #52b788)',
    'Gourmet': 'linear-gradient(135deg, #c9a96e, #8b6914)'
  };

  return (
    <section className={styles.section}>
      <div className={styles.bgLayers}>
        <div className={styles.glow1} />
        <div className={styles.glow2} />
      </div>

      <div className={styles.container}>
        <SectionReveal>
          <div className={styles.header}>
            <span className={styles.label}>Premium Selection</span>
            <h2 className={styles.heading}>
              PRODUCT<br />
              <span className="text-gold-gradient">UNIVERSE.</span>
            </h2>
          </div>
        </SectionReveal>

        <div className={styles.grid}>
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: 'var(--gold-light)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
              CONNECTING TO THE PREMIUM CATALOG...
            </div>
          ) : (
            universeList.map((product, i) => {
              const defaultWeight = product.weightVariants?.[0] || '500g';
              const cartItem = cart.find(item => item.id === product.id && item.weight === defaultWeight);
              const qty = cartItem?.quantity || 0;
              const gradient = categoryGradients[product.category] || categoryGradients['Gourmet'];

              return (
                <SectionReveal key={product.id} delay={i * 0.08}>
                  <GlassCard className={styles.productCard}>
                    <div className={styles.productContent}>
                      {/* Visual */}
                      <div className={styles.productVisual} style={{ background: gradient }}>
                        <div className={styles.productShine} />
                        <span className={styles.productInitial}>{product.name.charAt(0)}</span>
                        <div className={styles.productReflection} />
                      </div>

                      {/* Info */}
                      <div className={styles.productInfo}>
                        <span className={styles.productCategory}>{product.category}</span>
                        <h3 className={styles.productName}>{product.name}</h3>

                        {/* Freshness ring */}
                        <div className={styles.freshnessRow}>
                          <div className={styles.freshnessRing}>
                            <svg viewBox="0 0 36 36" className={styles.freshnessSvg}>
                              <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                              <circle
                                cx="18" cy="18" r="15.5" fill="none"
                                stroke="var(--emerald-glow)" strokeWidth="2"
                                strokeDasharray={`${product.freshnessScore} ${100 - product.freshnessScore}`}
                                strokeDashoffset="25"
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className={styles.freshnessValue}>{product.freshnessScore}</span>
                          </div>
                          <div className={styles.freshnessText}>
                            <span className={styles.freshnessLabel}>Freshness</span>
                            <span className={styles.freshnessScore}>Score</span>
                          </div>
                        </div>

                        <div className={styles.productMeta}>
                          <div className={styles.metaRow}>
                            <span className={styles.metaKey}>Origin</span>
                            <span className={styles.metaVal}>{product.origin}</span>
                          </div>
                          <div className={styles.metaRow}>
                            <span className={styles.metaKey}>Processed</span>
                            <span className={styles.metaVal}>{product.processDate}</span>
                          </div>
                          <div className={styles.metaRow}>
                            <span className={styles.metaKey}>Delivery</span>
                            <span className={styles.metaVal}>{product.delivery}</span>
                          </div>
                        </div>

                        <div className={styles.productFooter}>
                          <span className={styles.productPrice}>₹{product.price.toLocaleString('en-IN')}</span>
                          <div className={styles.qtyControl}>
                            {qty > 0 ? (
                              <>
                                <button className={styles.qtyBtn} onClick={() => updateCartQty(product.id, defaultWeight, -1)}>−</button>
                                <span className={styles.qtyValue}>{qty}</span>
                                <button className={styles.qtyBtn} onClick={() => updateCartQty(product.id, defaultWeight, 1)}>+</button>
                              </>
                            ) : (
                              <button className={styles.addBtn} onClick={() => addToCart(product, defaultWeight, 1)}>
                                Add to Cart
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </SectionReveal>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
