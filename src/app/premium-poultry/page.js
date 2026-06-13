'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Clock,
  Utensils,
  Flame,
  X,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Check,
  ChevronRight,
  Info,
  Heart
} from 'lucide-react';

import Navigation from '../../components/Navigation';
import Footer from '../../sections/Footer';
import GlassCard from '../../components/GlassCard';
import ParticleField from '../../components/ParticleField';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { useAuth } from '../../context/AuthContext';
import { productsService } from '../../services/products';
import { dbService } from '../../services/db';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default function PremiumPoultryPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [poultryList, setPoultryList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Global Context Providers
  const { user, setAuthModalOpen } = useAuth();
  const { 
    cart, 
    cartOpen, 
    setCartOpen, 
    addToCart, 
    updateCartQty, 
    removeFromCart, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist,
    clearCart
  } = useCartWishlist();

  const [activeProduct, setActiveProduct] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState('');
  const [drawerQty, setDrawerQty] = useState(1);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [standardsOpen, setStandardsOpen] = useState(false);
  // Checkout is handled in the dedicated /checkout route now

  // Load products from DB on mount
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      const data = await productsService.getProductsByCategory('Poultry');
      setPoultryList(data);
      setLoadingProducts(false);
    };
    loadProducts();
  }, []);

  // Scroll parallax effect for hero
  useEffect(() => {
    const handleScroll = () => {
      setScrollOffset(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    let lenis;
    const initLenis = async () => {
      try {
        const Lenis = (await import('lenis')).default;
        lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smooth: true,
        });
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      } catch (e) {
        console.log('Lenis error:', e);
      }
    };
    initLenis();
    return () => {
      if (lenis) lenis.destroy();
    };
  }, []);

  // Filter products
  const filteredProducts = poultryList.filter(product => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Boneless') return product.tags.includes('Boneless');
    if (selectedCategory === 'Gourmet Cuts') return product.tags.includes('Gourmet Cuts');
    return product.category === selectedCategory;
  });

  const getPriceMultiplier = (weight) => {
    if (!weight) return 1;
    if (weight.includes('kg')) {
      const val = parseFloat(weight);
      return val;
    }
    if (weight.includes('g') && !weight.includes('pieces')) {
      const val = parseFloat(weight) / 1000;
      return val;
    }
    return 1;
  };

  const formatPrice = (basePrice, weight) => {
    const mult = getPriceMultiplier(weight);
    return `₹${Math.round(basePrice * mult).toLocaleString('en-IN')}`;
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.basePrice * item.priceMultiplier * item.quantity);
    }, 0);
  };

  // Drawer Handler
  const openQuickView = (product) => {
    setActiveProduct(product);
    setSelectedWeight(product.weightVariants[0]);
    setDrawerQty(1);
    setActiveGalleryIndex(0);
  };

  return (
    <div className={styles.pageContainer}>
      <title>Premium Poultry Storefront — AL-QURAISH</title>

      {/* Volumetric background lights */}
      <div className={styles.bgLayers}>
        <div className={styles.ambientGlow1} />
        <div className={styles.ambientGlow2} />
      </div>

      <ParticleField
        particleCount={40}
        color="rgba(201, 169, 110, 0.2)"
        speed={0.15}
        maxSize={1.5}
      />

      <Navigation />

      {/* Floating Shopping Cart Trigger */}
      {getTotalCartItems() > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={styles.cartTrigger}
          onClick={() => setCartOpen(true)}
        >
          <ShoppingBag size={18} className="text-gold" />
          <span className={styles.cartCount}>{getTotalCartItems()}</span>
        </motion.button>
      )}

      {/* Hero Section */}
      <section className={styles.hero}>
        <div
          className={styles.heroBg}
          style={{ transform: `translateY(${scrollOffset * 0.4}px)` }}
        >
          <div className={styles.heroImageContainer}>
            <Image
              src="/images/poultry/poultry-banner.png"
              alt="Premium Poultry Banner"
              fill
              priority
              quality={100}
              className="object-cover"
            />
            <div className={styles.heroOverlay} />
          </div>
        </div>

        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.heroLabel}
          >
            <Sparkles size={14} />
            <span>Michelin-Grade Selection</span>
          </motion.div>

          <h1 className={styles.heroHeadline}>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className={styles.heroHeadlineThin}
            >
              PREMIUM
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className={styles.heroHeadlineGold}
            >
              POULTRY.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className={styles.heroSubheadline}
          >
            Hand-selected halal poultry sourced from pristine, ethical local pastures. Crafted for exceptional tenderness, perfect yield, and culinary excellence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className={styles.heroActions}
          >
            <button
              onClick={() => {
                document.getElementById('storefront').scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary"
            >
              <span>Explore Collection</span>
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setStandardsOpen(true)}
              className="btn-glass"
            >
              <span>View Standards</span>
            </button>
          </motion.div>
        </div>

        <div className={styles.scrollIndicator}>
          <div className={styles.scrollLine} />
        </div>
      </section>

      {/* Main Storefront Area */}
      <section id="storefront" className={styles.storefront}>
        <div className="container">

          {/* Category Filter Bar */}
          <div className={styles.filterBar}>
            {['All', 'Chicken', 'Duck', 'Turkey', 'Boneless', 'Gourmet Cuts'].map(cat => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${selectedCategory === cat ? styles.activeFilterBtn : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <motion.div
            layout
            className={styles.grid}
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const defaultWeight = product.weightVariants[0];
                const cartItem = cart.find(item => item.id === product.id && item.weight === defaultWeight);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    key={product.id}
                  >
                    <GlassCard
                      className={styles.productCard}
                      hoverGlow={false}
                      expandOnHover={true}
                    >
                      {/* Top Visual */}
                      <div className={styles.cardVisual} onClick={() => openQuickView(product)}>
                        <Image
                          src={product.heroImage}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className={styles.cardImage}
                        />
                        <div className={styles.cardVisualOverlay} />

                        {/* Badges */}
                        <div className={styles.badgeContainer}>
                          <span className={styles.halalBadge}>حلال HALAL</span>
                          <span className={`${styles.availBadge} ${product.availability.includes('Limited') ? styles.availBadgeLimited : ''}`}>
                            {product.availability}
                          </span>
                        </div>
                      </div>

                      {/* Info & Purchase */}
                      <div className={styles.cardInfo}>
                        <div className={styles.cardHeader}>
                          <span className={styles.cardCategory}>{product.category}</span>
                          <h3 className={styles.cardName} onClick={() => openQuickView(product)}>
                            {product.name}
                          </h3>
                        </div>

                        {/* Middle Meta Row */}
                        <div className={styles.cardDetailsRow}>
                          <div className={styles.cardOrigin}>
                            <span className={styles.detailLabel}>Origin</span>
                            <span className={styles.detailValue}>{product.origin.split(',')[0]}</span>
                          </div>

                          <div className={styles.cardFreshness}>
                            <div className={styles.freshnessRingSmall}>
                              <svg viewBox="0 0 36 36" className={styles.freshnessSvgSmall}>
                                <circle cx="18" cy="18" r="16.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
                                <circle
                                  cx="18" cy="18" r="16.5" fill="none"
                                  stroke="var(--emerald-glow)" strokeWidth="2.2"
                                  strokeDasharray={`${product.freshnessScore} ${100 - product.freshnessScore}`}
                                  strokeDashoffset="25"
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className={styles.freshnessScoreSmall}>{product.freshnessScore}%</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span className={styles.detailLabel} style={{ color: 'var(--emerald-glow)' }}>Freshness</span>
                              <span className={styles.detailLabel} style={{ fontSize: '0.5rem' }}>Index</span>
                            </div>
                          </div>
                        </div>

                        {/* Footer Controls */}
                        <div className={styles.cardFooter}>
                          <span className={styles.cardPrice}>
                            {typeof product.price === 'number'
                              ? `₹${product.price.toLocaleString('en-IN')}`
                              : product.price}
                          </span>

                          <div className={styles.cardActions}>
                            <button
                              className={styles.btnQuickView}
                              onClick={() => openQuickView(product)}
                            >
                              Details
                            </button>

                            {cartItem ? (
                              <div className={styles.qtyControlSmall}>
                                <button
                                  className={styles.qtyBtnSmall}
                                  onClick={() => updateCartQty(product.id, defaultWeight, -1)}
                                >
                                  −
                                </button>
                                <span className={styles.qtyValSmall}>{cartItem.quantity}</span>
                                <button
                                  className={styles.qtyBtnSmall}
                                  onClick={() => updateCartQty(product.id, defaultWeight, 1)}
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                className={styles.btnAddToCart}
                                onClick={() => addToCart(product, defaultWeight, 1)}
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

        </div>
      </section>

      {/* Immersive Product Detail Drawer */}
      <AnimatePresence>
        {activeProduct && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={styles.drawerOverlay}
              onClick={() => setActiveProduct(null)}
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 150 }}
              className={styles.drawer}
            >
              <button
                className={styles.drawerClose}
                onClick={() => setActiveProduct(null)}
              >
                <X size={20} />
              </button>

              <div className={styles.drawerLayout}>
                {/* Visuals Sidebar (Left) */}
                <div className={styles.drawerVisualSide}>
                  <div>
                    {/* Immersive active gallery image */}
                    <div className={styles.drawerHeroFrame}>
                      <Image
                        src={activeGalleryIndex === 0 ? activeProduct.heroImage : activeProduct.gallery[activeGalleryIndex - 1]}
                        alt={activeProduct.name}
                        fill
                        priority
                        className={styles.drawerHeroImage}
                      />
                    </div>

                    {/* Image Gallery Selection */}
                    <div className={styles.gallerySlider}>
                      <div
                        className={`${styles.galleryThumb} ${activeGalleryIndex === 0 ? styles.galleryThumbActive : ''}`}
                        onClick={() => setActiveGalleryIndex(0)}
                      >
                        <Image
                          src={activeProduct.heroImage}
                          alt="Thumbnail Hero"
                          fill
                          className={styles.drawerThumbImg}
                        />
                      </div>
                      {activeProduct.gallery.map((img, idx) => (
                        <div
                          key={idx}
                          className={`${styles.galleryThumb} ${activeGalleryIndex === idx + 1 ? styles.galleryThumbActive : ''}`}
                          onClick={() => setActiveGalleryIndex(idx + 1)}
                        >
                          <Image
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            className={styles.drawerThumbImg}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Packaging Details Badge */}
                  <div className={styles.packagingSection}>
                    <div className={styles.packagingBadge}>
                      <span className={styles.packagingIcon}>⚜️</span>
                      <div className={styles.packagingText}>
                        <span className={styles.packagingTitle}>Premium Packaging</span>
                        <span className={styles.packagingDesc}>{activeProduct.packaging}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Information (Right) */}
                <div className={styles.drawerInfoSide}>
                  <div className={styles.drawerHeader}>
                    <div className={styles.drawerCategoryRow}>
                      <span className={styles.drawerCategory}>{activeProduct.category} Selection</span>
                      <div className={styles.drawerCertifications}>
                        <span className={styles.certBadge}>حلال Halal</span>
                        <span className={styles.certBadge} style={{ borderColor: 'rgba(201,169,110,0.3)', color: 'var(--gold)' }}>100% Traceable</span>
                      </div>
                    </div>
                    <h2 className={styles.drawerName}>{activeProduct.name}</h2>
                  </div>

                  <p className={styles.drawerStory}>{activeProduct.description}</p>

                  {/* Metrics Dashboard */}
                  <div className={styles.drawerMetrics}>
                    <div className={styles.metricItem}>
                      <div className={styles.metricCircleFrame}>
                        <svg viewBox="0 0 36 36" className={styles.freshnessSvgLarge}>
                          <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
                          <circle
                            cx="18" cy="18" r="16" fill="none"
                            stroke="var(--emerald-glow)" strokeWidth="2.5"
                            strokeDasharray={`${activeProduct.freshnessScore} ${100 - activeProduct.freshnessScore}`}
                            strokeDashoffset="25"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className={styles.metricCircleValue}>{activeProduct.freshnessScore}%</span>
                      </div>
                      <div className={styles.metricText}>
                        <span className={styles.metricLabel}>Freshness Score</span>
                        <span className={styles.metricValue}>Peak Quality</span>
                      </div>
                    </div>

                    <div className={styles.metricItem}>
                      <span className={styles.originIcon}>🌐</span>
                      <div className={styles.metricText}>
                        <span className={styles.metricLabel}>Heritage Origin</span>
                        <span className={styles.metricValue}>{activeProduct.origin}</span>
                      </div>
                    </div>
                  </div>

                  {/* Weight variants */}
                  <div className={styles.weightSection}>
                    <span className={styles.sectionTitle}>Select Weight Variant</span>
                    <div className={styles.weightGrid}>
                      {activeProduct.weightVariants.map((weight) => (
                        <button
                          key={weight}
                          className={`${styles.weightOption} ${selectedWeight === weight ? styles.weightOptionActive : ''}`}
                          onClick={() => setSelectedWeight(weight)}
                        >
                          {weight} ({formatPrice(activeProduct.basePrice, weight)})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nutritional Facts */}
                  <div className={styles.nutritionSection}>
                    <span className={styles.sectionTitle}>Nutritional Highlights (Per 100g)</span>
                    <div className={styles.nutritionGrid}>
                      <div className={styles.nutritionItem}>
                        <span className={styles.nutVal}>{activeProduct.nutrition.protein}</span>
                        <span className={styles.nutLabel}>Protein</span>
                      </div>
                      <div className={styles.nutritionItem}>
                        <span className={styles.nutVal}>{activeProduct.nutrition.fat}</span>
                        <span className={styles.nutLabel}>Fat</span>
                      </div>
                      <div className={styles.nutritionItem}>
                        <span className={styles.nutVal}>{activeProduct.nutrition.energy}</span>
                        <span className={styles.nutLabel}>Energy</span>
                      </div>
                      <div className={styles.nutritionItem}>
                        <span className={styles.nutVal}>{activeProduct.nutrition.carbs}</span>
                        <span className={styles.nutLabel}>Carbs</span>
                      </div>
                    </div>
                  </div>

                  {/* Preparation Guidelines */}
                  <div className={styles.cookingSection}>
                    <span className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Utensils size={14} className="text-gold" />
                      <span>Michelin Preparation Suggestion</span>
                    </span>
                    <p className={styles.detailP}>{activeProduct.preparation}</p>
                  </div>

                  {/* Delivery Schedule */}
                  <div className={styles.deliverySection}>
                    <span className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} className="text-gold" />
                      <span>Cold-Chain Protection Schedule</span>
                    </span>
                    <p className={styles.detailP}>{activeProduct.eta} protected by refrigerated express logistics.</p>
                  </div>

                  {/* Purchase row */}
                  <div className={styles.drawerPurchaseRow}>
                    <div className={styles.priceCol}>
                      <span className={styles.priceLabel}>Price</span>
                      <span className={styles.drawerPrice}>
                        {formatPrice(activeProduct.basePrice, selectedWeight)}
                      </span>
                    </div>

                    <div className={styles.actionCol}>
                      <div className={styles.qtyControlLarge}>
                        <button
                          className={styles.qtyBtnLarge}
                          onClick={() => setDrawerQty(prev => Math.max(1, prev - 1))}
                        >
                          −
                        </button>
                        <span className={styles.qtyValLarge}>{drawerQty}</span>
                        <button
                          className={styles.qtyBtnLarge}
                          onClick={() => setDrawerQty(prev => prev + 1)}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className={styles.btnLargeCart}
                        onClick={() => {
                          addToCart(activeProduct, selectedWeight, drawerQty);
                          setActiveProduct(null);
                          setCartOpen(true);
                        }}
                      >
                        Add to Cart
                      </button>

                      <button
                        type="button" 
                        onClick={() => {
                          if (isInWishlist(activeProduct.id)) {
                            removeFromWishlist(activeProduct.id);
                          } else {
                            addToWishlist(activeProduct);
                          }
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(212, 175, 55, 0.15)',
                          borderRadius: '12px',
                          minWidth: '56px',
                          height: '56px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: isInWishlist(activeProduct.id) ? '#d4af37' : '#fff',
                          transition: 'all 0.3s'
                        }}
                        title={isInWishlist(activeProduct.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        <Heart size={20} fill={isInWishlist(activeProduct.id) ? '#d4af37' : 'none'} style={{ stroke: '#d4af37' }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Luxury Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.cartOverlay}
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 180 }}
              className={styles.cartDrawer}
            >
              <div className={styles.cartHeader}>
                <h2 className={styles.cartTitle}>Your Cart</h2>
                <button
                  className={styles.btnCloseCart}
                  onClick={() => setCartOpen(false)}
                >
                  Close <X size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                </button>
              </div>

              <div className={styles.cartItemsList}>
                {cart.length === 0 ? (
                  <div className={styles.cartEmpty}>
                    <ShoppingBag className={styles.cartEmptyIcon} size={48} />
                    <p>Your cart is currently empty.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={`${item.id}-${item.weight}`} className={styles.cartItem}>
                      <div className={styles.cartItemImage}>
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className={styles.cartItemDetail}>
                        <span className={styles.cartItemName}>{item.name}</span>
                        <span className={styles.cartItemWeight}>Weight: {item.weight}</span>
                        <span className={styles.cartItemPrice}>
                          {formatPrice(item.basePrice, item.weight)}
                        </span>
                      </div>
                      <div className={styles.cartItemActions}>
                        <div className={styles.qtyControlSmall}>
                          <button
                            className={styles.qtyBtnSmall}
                            onClick={() => updateCartQty(item.id, item.weight, -1)}
                          >
                            −
                          </button>
                          <span className={styles.qtyValSmall}>{item.quantity}</span>
                          <button
                            className={styles.qtyBtnSmall}
                            onClick={() => updateCartQty(item.id, item.weight, 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className={styles.cartItemRemove}
                          onClick={() => removeFromCart(item.id, item.weight)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className={styles.cartSummary}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Subtotal</span>
                    <span className={styles.summaryValue}>₹{Math.round(getCartSubtotal()).toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Delivery (Cold-Chain)</span>
                    <span className={styles.summaryValue} style={{ color: 'var(--emerald-glow)' }}>Complimentary</span>
                  </div>
                  <div className={styles.summaryRow} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className={styles.totalLabel}>Order Total</span>
                    <span className={styles.totalValue}>₹{Math.round(getCartSubtotal()).toLocaleString('en-IN')}</span>
                  </div>

                  <button
                    className={styles.btnCheckout}
                    onClick={() => {
                      setCartOpen(false);
                      if (!user) {
                        setAuthModalOpen(true);
                        return;
                      }
                      router.push('/checkout');
                    }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Luxury Standards Modal Alert */}
      <AnimatePresence>
        {standardsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.cartOverlay}
              onClick={() => setStandardsOpen(false)}
              style={{ zIndex: 300 }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 310,
                width: '550px',
                maxWidth: '90vw',
                padding: '40px',
                borderColor: 'var(--gold)'
              }}
            >
              <h3 className="heading-md text-gold-gradient" style={{ marginBottom: '20px', fontFamily: 'var(--font-serif)' }}>AL-QURAISH STANDARDS</h3>
              <p className="text-body" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                All premium poultry selections represented under the Al-Quraish emblem comply with strict organic, free-range, and zero-hormone standards.
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <li style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                  <ShieldCheck size={16} className="text-gold" />
                  <span>100% Certified Halal from source-plucking through packaging.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                  <ShieldCheck size={16} className="text-gold" />
                  <span>Cold chain protected at a continuous 0-4°C to seal cell moisture.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                  <ShieldCheck size={16} className="text-gold" />
                  <span>Ethically raised on certified vegetarian feed with ample space to roam.</span>
                </li>
              </ul>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStandardsOpen(false)}>
                Acknowledge Standards
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
