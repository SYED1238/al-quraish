'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  ShieldCheck,
  Clock,
  X,
  Plus,
  Minus,
  Heart,
  Search,
  Truck,
  Leaf
} from 'lucide-react';

import Navigation from '../../components/Navigation';
import Footer from '../../sections/Footer';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { useAuth } from '../../context/AuthContext';
import { productsService } from '../../services/products';
import styles from './page.module.css';

export default function PremiumPoultryPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [productList, setProductList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
    isInWishlist
  } = useCartWishlist();

  const [activeProduct, setActiveProduct] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState('');
  const [drawerQty, setDrawerQty] = useState(1);

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      const data = await productsService.getAllProducts();
      setProductList(data);
      setLoadingProducts(false);
    };
    loadProducts();
  }, []);

  // Sync category param from URL if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('category');
      if (catParam) {
        const matched = ['Chicken', 'Mutton', 'Fish', 'Eggs', 'Add-ons'].find(
          c => c.toLowerCase() === catParam.toLowerCase()
        );
        if (matched) setSelectedCategory(matched);
      }
    }
  }, []);

  // Filter products by category and search query
  const filteredProducts = productList.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getPriceMultiplier = (weight) => {
    if (!weight) return 1;
    if (weight.includes('kg')) {
      const val = parseFloat(weight);
      return val * 2; // base price is for 500g
    }
    if (weight.includes('g') && !weight.includes('pieces')) {
      const val = parseFloat(weight);
      return val / 500; // base price is for 500g
    }
    if (weight.includes('pieces')) {
      const val = parseInt(weight);
      return val / 6; // base price is for 6 pieces
    }
    if (weight.includes('ml')) {
      const val = parseFloat(weight);
      return val / 200; // base price is for 200ml
    }
    if (weight.includes('L')) {
      const val = parseFloat(weight);
      return val * 5; // base price is for 200ml
    }
    return 1;
  };

  const formatPrice = (basePrice, weight) => {
    const mult = getPriceMultiplier(weight);
    return `₹${Math.round(basePrice * mult).toLocaleString('en-IN')}`;
  };

  const getPricePerKgText = (product) => {
    if (product.category === 'Eggs') {
      const perUnit = Math.round(product.basePrice / 6);
      return `₹${perUnit}/egg`;
    }
    if (product.id === 'pure-ghee') {
      return `₹900/L`;
    }
    if (product.category === 'Add-ons') {
      const perKg = product.basePrice * 10;
      return `₹${perKg}/kg`;
    }
    const perKg = product.basePrice * 2;
    return `₹${perKg}/kg`;
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
    const defaultWeight = ['Chicken', 'Mutton', 'Fish'].includes(product.category) && product.weightVariants.includes('500g')
      ? '500g'
      : product.weightVariants[0];
    setSelectedWeight(defaultWeight);
    setDrawerQty(1);
  };

  return (
    <div className={styles.pageContainer}>
      <title>Shop Fresh — Al Quresh FRESH</title>

      <Navigation />

      {/* Floating Shopping Cart Trigger */}
      {getTotalCartItems() > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={styles.cartTrigger}
          onClick={() => setCartOpen(true)}
        >
          <ShoppingBag size={18} />
          <span className={styles.cartCount}>{getTotalCartItems()}</span>
        </motion.button>
      )}

      {/* Main Storefront Area */}
      <section className={styles.storefront}>
        <div className={styles.container}>
          
          {/* Header row */}
          <div className={styles.storefrontHeader}>
            <div className={styles.headerText}>
              <h1 className={styles.storefrontTitle}>Shop fresh</h1>
              <p className={styles.storefrontSubtitle}>Hand-cut today • Delivered same day</p>
            </div>
            
            {/* Search Bar */}
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search chicken, mutton, fish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {/* Category Filter Bar */}
          <div className={styles.filterBar}>
            {['All', 'Chicken', 'Mutton', 'Fish', 'Eggs', 'Add-ons'].map(cat => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${selectedCategory === cat ? styles.activeFilterBtn : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading spinner */}
          {loadingProducts ? (
            <div className={styles.loadingWrapper}>
              <div className={styles.spinner} />
              <p>Sourcing fresh items...</p>
            </div>
          ) : (
            <>
              {/* Product Info Count */}
              <div className={styles.metaRow}>
                <span className={styles.productCount}>{filteredProducts.length} products</span>
                <div className={styles.sortContainer}>
                  <select className={styles.sortSelect} defaultValue="Popular">
                    <option value="Popular">Popular</option>
                    <option value="PriceLowHigh">Price: Low to High</option>
                    <option value="PriceHighLow">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Product Grid */}
              <div className={styles.grid}>
                {filteredProducts.map((product) => {
                  const defaultWeight = ['Chicken', 'Mutton', 'Fish'].includes(product.category) && product.weightVariants.includes('500g')
                    ? '500g'
                    : product.weightVariants[0];
                  const hasBestSeller = product.tags.includes('BEST SELLER');

                  return (
                    <div key={product.id} className={styles.productCard} onClick={() => openQuickView(product)}>
                      {/* Top Visual container */}
                      <div className={styles.cardVisual}>
                        <img
                          src={product.heroImage}
                          alt={product.name}
                          className={styles.cardImage}
                        />
                        <div className={styles.cardVisualOverlay} />

                        {/* Badges */}
                        <div className={styles.badgeContainer}>
                          <span className={styles.halalBadge}>HALAL</span>
                          {hasBestSeller && (
                            <span className={styles.bestSellerBadge}>BEST SELLER</span>
                          )}
                        </div>
                      </div>

                      {/* Content block */}
                      <div className={styles.cardInfo}>
                        <div className={styles.cardHeader}>
                          <h3 className={styles.cardName}>{product.name}</h3>
                          <span className={styles.cardWeight}>From {defaultWeight}</span>
                        </div>

                        {/* Footer details */}
                        <div className={styles.cardFooter}>
                          <div className={styles.priceContainer}>
                            <span className={styles.cardPrice}>₹{product.basePrice}</span>
                            <span className={styles.cardUnit}>{getPricePerKgText(product)}</span>
                          </div>

                          <button
                            className={styles.circlePlusBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product, defaultWeight, 1);
                            }}
                            aria-label="Add to cart"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

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
              transition={{ duration: 0.3 }}
              className={styles.drawerOverlay}
              onClick={() => setActiveProduct(null)}
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 160 }}
              className={styles.drawer}
            >
              <button
                className={styles.drawerClose}
                onClick={() => setActiveProduct(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className={styles.drawerLayout}>
                {/* Visuals Sidebar (Left) */}
                <div className={styles.drawerVisualSide}>
                  <div className={styles.drawerHeroFrame}>
                    <img
                      src={activeProduct.heroImage}
                      alt={activeProduct.name}
                      className={styles.drawerHeroImage}
                    />
                  </div>
                </div>

                {/* Information (Right) */}
                <div className={styles.drawerInfoSide}>
                  {/* Breadcrumbs */}
                  <div className={styles.breadcrumbs}>
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <span onClick={() => setActiveProduct(null)} className={styles.breadcrumbLink}>Shop</span>
                    <span>/</span>
                    <span className={styles.breadcrumbActive}>{activeProduct.name}</span>
                  </div>

                  {/* Header labels */}
                  <div className={styles.drawerLabelsRow}>
                    <span className={styles.detailHalalBadge}>HALAL</span>
                    <span className={styles.detailFreshBadge}>FRESH TODAY</span>
                  </div>

                  <h2 className={styles.drawerName}>{activeProduct.name}</h2>
                  <p className={styles.drawerSubtitle}>{activeProduct.description}</p>

                  {/* Price info */}
                  <div className={styles.drawerPriceRow}>
                    <span className={styles.drawerPrice}>
                      {formatPrice(activeProduct.basePrice, selectedWeight)}
                    </span>
                    <span className={styles.drawerUnit}>
                      ({getPricePerKgText(activeProduct)})
                    </span>
                  </div>

                  {/* Weight variants */}
                  <div className={styles.weightSection}>
                    <span className={styles.weightTitle}>WEIGHT</span>
                    <div className={styles.weightPillGrid}>
                      {activeProduct.weightVariants.map((weight) => (
                        <button
                          key={weight}
                          className={`${styles.weightPill} ${selectedWeight === weight ? styles.weightPillActive : ''}`}
                          onClick={() => setSelectedWeight(weight)}
                        >
                          {weight}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Purchase row */}
                  <div className={styles.purchaseActionRow}>
                    {/* Quantity Selector */}
                    <div className={styles.qtySelector}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => setDrawerQty(prev => Math.max(1, prev - 1))}
                      >
                        −
                      </button>
                      <span className={styles.qtyValue}>{drawerQty}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => setDrawerQty(prev => prev + 1)}
                      >
                        +
                      </button>
                    </div>

                    {/* Add to Cart button */}
                    <button
                      className={styles.btnAddToCartLarge}
                      onClick={() => {
                        addToCart(activeProduct, selectedWeight, drawerQty);
                        setActiveProduct(null);
                        setCartOpen(true);
                      }}
                    >
                      <ShoppingBag size={18} style={{ marginRight: '8px' }} />
                      <span>Add to cart</span>
                    </button>

                    {/* Wishlist Button */}
                    <button
                      type="button" 
                      onClick={() => {
                        if (isInWishlist(activeProduct.id)) {
                          removeFromWishlist(activeProduct.id);
                        } else {
                          addToWishlist(activeProduct);
                        }
                      }}
                      className={styles.btnWishlist}
                      title={isInWishlist(activeProduct.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <Heart size={20} fill={isInWishlist(activeProduct.id) ? '#ef4444' : 'none'} color={isInWishlist(activeProduct.id) ? '#ef4444' : '#6b7280'} />
                    </button>
                  </div>

                  {/* Trust Features box */}
                  <div className={styles.trustBox}>
                    <div className={styles.trustRow}>
                      <Truck size={18} />
                      <span>Same-day delivery before 6 PM</span>
                    </div>
                    <div className={styles.trustRow}>
                      <ShieldCheck size={18} />
                      <span>100% Halal, FSSAI certified</span>
                    </div>
                    <div className={styles.trustRow}>
                      <Leaf size={18} />
                      <span>Antibiotic & hormone free</span>
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
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
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
                    <span className={styles.summaryValue} style={{ color: '#0c5132', fontWeight: 600 }}>Complimentary</span>
                  </div>
                  <div className={styles.summaryRow} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
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

      <Footer />
    </div>
  );
}
