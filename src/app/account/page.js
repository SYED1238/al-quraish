'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  LogOut,
  Plus,
  Trash2,
  ChevronLeft,
  Check,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { dbService } from '../../services/db';
import Navigation from '../../components/Navigation';
import Footer from '../../sections/Footer';
import ParticleField from '../../components/ParticleField';
import GlassCard from '../../components/GlassCard';
import styles from './page.module.css';

const getPhoneFromEmail = (email) => {
  if (!email) return '';
  if (email.endsWith('@equraishi.com')) {
    return email.split('@')[0];
  }
  return email;
};

function AccountDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'profile';

  const { user, profile, loading, signOut, updateProfileName } = useAuth();
  const { cart, wishlist, addToCart, removeFromWishlist, clearCart } = useCartWishlist();

  // Tab State
  const [activeTab, setActiveTab] = useState(activeTabParam);

  // Profile Forms
  const [fullName, setFullName] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    email: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false,
    latitude: null,
    longitude: null
  });
  const [addressError, setAddressError] = useState('');
  const [fetchingLocation, setFetchingLocation] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Sync state param changes
  useEffect(() => {
    if (activeTabParam) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam]);

  // Protected route redirect
  useEffect(() => {
    if (!loading && !user) {
      alert('Please sign in to view your account dashboard.');
      router.push('/');
    }
  }, [user, loading, router]);

  // Load Profile Fields
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  // Load Addresses & Orders when tabs change
  useEffect(() => {
    if (!user) return;

    if (activeTab === 'addresses') {
      const getAddresses = async () => {
        setLoadingAddresses(true);
        try {
          const list = await dbService.fetchAddresses(user.id);
          setAddresses(list);
        } catch (e) {
          console.error(e);
        }
        setLoadingAddresses(false);
      };
      getAddresses();
    }

    if (activeTab === 'orders') {
      const getOrders = async () => {
        setLoadingOrders(true);
        try {
          const list = await dbService.fetchOrders(user.id);
          setOrders(list);
        } catch (e) {
          console.error(e);
        }
        setLoadingOrders(false);
      };
      getOrders();
    }
  }, [activeTab, user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    try {
      await updateProfileName(fullName);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError('Failed to update profile name. Please try again.');
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setAddressError('Geolocation is not supported by your browser.');
      return;
    }

    setFetchingLocation(true);
    setAddressError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Save coordinates in state
        setNewAddress(prev => ({
          ...prev,
          latitude,
          longitude
        }));

        try {
          // Reverse geocode via Nominatim API (OpenStreetMap)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          
          if (!response.ok) throw new Error('Failed to resolve coordinates');
          
          const data = await response.json();
          const addr = data.address || {};
          
          const city = addr.city || addr.town || addr.village || addr.suburb || '';
          const state = addr.state || '';
          const pincode = addr.postcode || '';
          
          const line1 = [
            addr.house_number || '',
            addr.road || addr.pedestrian || ''
          ].filter(Boolean).join(', ') || addr.suburb || addr.neighbourhood || '';
          
          const line2 = [
            addr.neighbourhood || addr.suburb || '',
            addr.county || ''
          ].filter(Boolean).join(', ') || '';

          setNewAddress(prev => ({
            ...prev,
            address_line_1: line1 || prev.address_line_1,
            address_line_2: line2 || prev.address_line_2,
            city: city || prev.city,
            state: state || prev.state,
            pincode: pincode || prev.pincode
          }));
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          setAddressError('GPS coordinates acquired successfully! Address details could not be auto-resolved; please type them manually.');
        } finally {
          setFetchingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMsg = 'Failed to acquire location. Please grant permission or type address manually.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location access denied. Please enable location permissions in your browser.';
        }
        setAddressError(errorMsg);
        setFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressError('');
    if (!newAddress.latitude || !newAddress.longitude) {
      setAddressError('GPS coordinates are compulsory. Please click "Use Current Location" to capture your location before saving.');
      return;
    }
    if (
      !newAddress.full_name ||
      !newAddress.phone ||
      !newAddress.email ||
      !newAddress.address_line_1 ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.pincode
    ) {
      setAddressError('Please fill in all required fields.');
      return;
    }
    try {
      const added = await dbService.addAddress(user.id, newAddress);
      setAddresses(prev => [added, ...prev.map(addr => added.is_default ? { ...addr, is_default: false } : addr)]);
      setNewAddress({
        full_name: '',
        phone: '',
        email: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false,
        latitude: null,
        longitude: null
      });
      setShowAddressForm(false);
    } catch (err) {
      setAddressError('Failed to save address. Please verify your fields.');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await dbService.deleteAddress(id);
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    } catch (e) {
      alert('Failed to delete address.');
    }
  };

  const handleMoveToCart = async (product) => {
    try {
      // Defaulting weight variant for moving wishlist item to cart
      const defaultWeight = product.weightVariants?.[0] || '500g';
      await addToCart(product, defaultWeight, 1);
      await removeFromWishlist(product.id);
    } catch (e) {
      alert('Failed to move item to cart.');
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to exit the Al-Quraish inner circle?')) {
      await signOut();
      router.push('/');
    }
  };

  if (loading || !user) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}>
          <div className={styles.doubleSpinner1}></div>
          <div className={styles.doubleSpinner2}></div>
        </div>
        <p className={styles.loadingText}>RESOLVING SESSION...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <title>Your Account — AL-QURAISH</title>

      {/* Background Volumetrics removed in favor of global AtmosphericBackground */}

      <ParticleField
        particleCount={30}
        color="rgba(212, 175, 55, 0.15)"
        speed={0.1}
        maxSize={1.2}
      />

      <Navigation />

      <main className="container" style={{ paddingTop: '140px', paddingBottom: '80px', minHeight: '80vh' }}>

        {/* Back Link */}
        <Link href="/" className={styles.backLink}>
          <ChevronLeft size={16} />
          <span>Back to Collection</span>
        </Link>

        <h1 className={styles.pageTitle}>
          MEMBER<br />
          <span className="text-gold-gradient">PORTAL.</span>
        </h1>

        <div className={styles.dashboardGrid}>

          {/* Left Column: Profile Card & Navigation Tabs */}
          <div className={styles.sidebarCol}>
            <GlassCard className={styles.profileSummaryCard} hoverGlow={false}>
              <div className={styles.avatarLarge}>
                {profile?.full_name?.substring(0, 2).toUpperCase() || 'GU'}
              </div>
              <h2 className={styles.memberName}>{profile?.full_name || 'Guest Member'}</h2>
              <p className={styles.memberEmail}>{getPhoneFromEmail(user.email)}</p>
              <span className={styles.badgeVIP}>Inner Circle Member</span>
              <div className={styles.verificationBadgeContainer}>
                <span className={styles.badgeVerified}>
                  Verified Gold Account
                </span>
              </div>
            </GlassCard>

            <div className={styles.tabsMenu}>
              <button
                className={`${styles.tabLink} ${activeTab === 'profile' ? styles.activeTabLink : ''}`}
                onClick={() => { setActiveTab('profile'); router.replace('/account?tab=profile'); }}
              >
                <User size={18} />
                <span>Profile Details</span>
              </button>
              <button
                className={`${styles.tabLink} ${activeTab === 'orders' ? styles.activeTabLink : ''}`}
                onClick={() => { setActiveTab('orders'); router.replace('/account?tab=orders'); }}
              >
                <ShoppingBag size={18} />
                <span>My Orders</span>
              </button>
              <button
                className={`${styles.tabLink} ${activeTab === 'addresses' ? styles.activeTabLink : ''}`}
                onClick={() => { setActiveTab('addresses'); router.replace('/account?tab=addresses'); }}
              >
                <MapPin size={18} />
                <span>Addresses Book</span>
              </button>
              <button
                className={`${styles.tabLink} ${activeTab === 'wishlist' ? styles.activeTabLink : ''}`}
                onClick={() => { setActiveTab('wishlist'); router.replace('/account?tab=wishlist'); }}
              >
                <Heart size={18} />
                <span>Saved Wishlist</span>
              </button>
              <button
                className={`${styles.tabLink} ${styles.logoutLink}`}
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Right Column: Tab Content */}
          <div className={styles.contentCol}>
            <GlassCard className={styles.contentCard} hoverGlow={false}>

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div>
                  <h3 className={styles.sectionTitle}>Profile Credentials</h3>
                  <p className={styles.sectionSubtitle}>Manage your registration credentials and verification status.</p>

                  <form onSubmit={handleUpdateProfile} className={styles.form}>
                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Registered Phone</span>
                      <input
                        type="text"
                        value={getPhoneFromEmail(user.email)}
                        className={styles.disabledInput}
                        disabled
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Verification Status</span>
                      <div className={styles.disabledInput} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d4af37' }}></span>
                        <span style={{ color: '#F4E6C0' }}>Verified Gold Account</span>
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Full Member Name</span>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your name"
                        className={styles.goldInput}
                        required
                      />
                    </div>

                    {profileSuccess && (
                      <div className={styles.successMessage}>
                        <Check size={16} />
                        <span>Profile successfully updated.</span>
                      </div>
                    )}

                    {profileError && (
                      <div className={styles.errorMessage}>
                        <span>{profileError}</span>
                      </div>
                    )}

                    <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
                      Update Credentials
                    </button>
                  </form>
                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div>
                  <h3 className={styles.sectionTitle}>Order History</h3>
                  <p className={styles.sectionSubtitle}>Review processing states and delivery details for your active orders.</p>

                  {loadingOrders ? (
                    <p className={styles.loadingData}>RESOLVING ARCHIVES...</p>
                  ) : orders.length === 0 ? (
                    <div className={styles.emptyState}>
                      <ShoppingBag size={36} className="text-gold" />
                      <p className={styles.emptyText}>No premium orders recorded. Purchase a premium cut to view order history.</p>
                    </div>
                  ) : (
                    <div className={styles.ordersList}>
                      {orders.map((order) => (
                        <div key={order.id} className={styles.orderCard}>
                          <div className={styles.orderHeader} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.2fr', gap: '16px', alignItems: 'center' }}>
                            <div>
                              <span className={styles.orderIdLabel}>Order ID</span>
                              <span className={styles.orderId}>{order.orderNumber}</span>
                            </div>
                            <div>
                              <span className={styles.orderIdLabel}>Payment Method</span>
                              <span className={styles.orderPaymentMethod} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.paymentMethod}</span>
                            </div>
                            <div className={styles.orderMeta} style={{ justifyContent: 'flex-end', gap: '12px' }}>
                              <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              <span className={styles.badgeStatus}>{order.status}</span>
                            </div>
                          </div>

                          <div className={styles.orderItems}>
                            {order.items.map((item) => (
                              <div key={item.id} className={styles.orderItemRow}>
                                <div className={styles.orderItemDetails}>
                                  <span className={styles.orderItemName}>{item.name}</span>
                                  <span className={styles.orderItemQty}>Qty: {item.quantity} ({item.weight})</span>
                                </div>
                                <span className={styles.orderItemPrice}>₹{item.price.toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>

                          {order.address && (
                            <div className={styles.orderAddressBlock} style={{
                              padding: '16px 20px',
                              borderTop: '1px solid rgba(255, 255, 255, 0.03)',
                              background: 'rgba(255, 255, 255, 0.01)',
                              fontSize: '0.8rem',
                              color: 'var(--text-secondary)'
                            }}>
                              <span className={styles.orderIdLabel} style={{ marginBottom: '6px' }}>Delivery Address</span>
                              <div style={{ color: '#fff', fontWeight: '500', marginBottom: '2px' }}>
                                {order.address.full_name} <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>| {order.address.phone}</span>
                              </div>
                              <div>
                                {order.address.address_line_1}
                                {order.address.address_line_2 && `, ${order.address.address_line_2}`}
                                <br />
                                {order.address.city}, {order.address.state} — {order.address.pincode}
                              </div>
                            </div>
                          )}

                          <div className={styles.orderFooter}>
                            <span>Order Total</span>
                            <span className={styles.orderTotal}>₹{order.total.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === 'addresses' && (
                <div>
                  <div className={styles.flexHeader}>
                    <div>
                      <h3 className={styles.sectionTitle}>Saved Addresses</h3>
                      <p className={styles.sectionSubtitle}>Configure default delivery coordinates for cold-chain logistic routes.</p>
                    </div>
                    {!showAddressForm && (
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="btn-primary"
                        style={{ padding: '10px 18px', fontSize: '0.75rem' }}
                      >
                        <Plus size={14} /> Add Address
                      </button>
                    )}
                  </div>

                  {showAddressForm && (
                    <form onSubmit={handleAddAddress} className={styles.addressForm}>
                      <h4 className={styles.formSubtitle}>New Delivery Address</h4>

                      <button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        className={styles.btnLocation}
                        disabled={fetchingLocation}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          background: 'rgba(212, 175, 55, 0.08)',
                          border: '1px solid rgba(212, 175, 55, 0.25)',
                          borderRadius: '10px',
                          padding: '12px 18px',
                          color: '#F4E6C0',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          width: '100%',
                          boxSizing: 'border-box',
                          marginTop: '4px',
                          marginBottom: '12px'
                        }}
                        id="btn-use-location"
                      >
                        {fetchingLocation ? (
                          <>
                            <span className={styles.loaderSmall} style={{
                              width: '14px',
                              height: '14px',
                              border: '2px solid rgba(212, 175, 55, 0.15)',
                              borderTop: '2px solid var(--gold)',
                              borderRadius: '50%',
                              animation: 'spin 0.8s linear infinite',
                              display: 'inline-block'
                            }}></span>
                            <span>Acquiring GPS Signal...</span>
                          </>
                        ) : (
                          <>
                            <MapPin size={14} />
                            <span>Use Current Location</span>
                          </>
                        )}
                      </button>

                      {newAddress.latitude && newAddress.longitude && (
                        <div className={styles.locationSuccess} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          fontSize: '0.75rem',
                          color: '#52b788',
                          background: 'rgba(82, 183, 136, 0.05)',
                          border: '1px solid rgba(82, 183, 136, 0.15)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          width: '100%',
                          boxSizing: 'border-box',
                          marginBottom: '12px'
                        }}>
                          <Check size={10} style={{ color: '#52b788', marginRight: '6px' }} />
                          <span>GPS Coordinates Captured: {newAddress.latitude.toFixed(6)}, {newAddress.longitude.toFixed(6)}</span>
                        </div>
                      )}

                      <div className={styles.formGrid} style={{ gridTemplateColumns: '1.2fr 1fr' }}>
                        <div className={styles.inputGroup}>
                          <span className={styles.inputLabel}>Full Name</span>
                          <input
                            type="text"
                            placeholder="Recipient Name"
                            value={newAddress.full_name}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, full_name: e.target.value }))}
                            className={styles.goldInput}
                            required
                          />
                        </div>

                        <div className={styles.inputGroup}>
                          <span className={styles.inputLabel}>Phone Number</span>
                          <input
                            type="tel"
                            placeholder="10-digit mobile"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                            className={styles.goldInput}
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.inputGroup}>
                        <span className={styles.inputLabel}>Email Address</span>
                        <input
                          type="email"
                          placeholder="recipient@domain.com"
                          value={newAddress.email}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, email: e.target.value }))}
                          className={styles.goldInput}
                          required
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <span className={styles.inputLabel}>Address Line 1</span>
                        <input
                          type="text"
                          placeholder="House/Apartment No, Building, Street"
                          value={newAddress.address_line_1}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
                          className={styles.goldInput}
                          required
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <span className={styles.inputLabel}>Address Line 2 (Optional)</span>
                        <input
                          type="text"
                          placeholder="Locality, Landmark"
                          value={newAddress.address_line_2}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
                          className={styles.goldInput}
                        />
                      </div>

                      <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                          <span className={styles.inputLabel}>City</span>
                          <input
                            type="text"
                            placeholder="City"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                            className={styles.goldInput}
                            required
                          />
                        </div>

                        <div className={styles.inputGroup}>
                          <span className={styles.inputLabel}>State</span>
                          <input
                            type="text"
                            placeholder="State"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                            className={styles.goldInput}
                            required
                          />
                        </div>

                        <div className={styles.inputGroup}>
                          <span className={styles.inputLabel}>Pincode</span>
                          <input
                            type="text"
                            placeholder="Pincode"
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                            className={styles.goldInput}
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.checkboxGroup}>
                        <input
                          type="checkbox"
                          id="is_default"
                          checked={newAddress.is_default}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, is_default: e.target.checked }))}
                          className={styles.goldCheckbox}
                        />
                        <label htmlFor="is_default">Set as default address</label>
                      </div>

                      {addressError && (
                        <div className={styles.errorMessage}>
                          <span>{addressError}</span>
                        </div>
                      )}

                          <div className={styles.formActions}>
                            <button type="submit" className="btn-primary">
                              Save Address
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddressForm(false);
                                setNewAddress({
                                  full_name: '',
                                  phone: '',
                                  email: '',
                                  address_line_1: '',
                                  address_line_2: '',
                                  city: '',
                                  state: '',
                                  pincode: '',
                                  is_default: false,
                                  latitude: null,
                                  longitude: null
                                });
                              }}
                              className="btn-glass"
                              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                            >
                              Cancel
                            </button>
                          </div>
                    </form>
                  )}

                  {loadingAddresses ? (
                    <p className={styles.loadingData}>RESOLVING REGISTER...</p>
                  ) : addresses.length === 0 ? (
                    <div className={styles.emptyState}>
                      <MapPin size={36} className="text-gold" />
                      <p className={styles.emptyText}>No registered addresses. Set a delivery address to enable cold chain deliveries.</p>
                    </div>
                  ) : (
                    <div className={styles.addressesGrid}>
                      {addresses.map((addr) => (
                        <div key={addr.id} className={styles.addressCard}>
                          <div>
                            <div className={styles.addressCardHeader}>
                              <span className={styles.addressCoords}>Delivery address</span>
                              {addr.is_default && (
                                <span className={styles.badgeDefault}>Default</span>
                              )}
                            </div>

                            <p className={styles.addressLines} style={{ marginBottom: '12px' }}>
                              <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{addr.full_name}</strong><br />
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{addr.phone} | {addr.email}</span>
                            </p>

                            <p className={styles.addressLines}>
                              {addr.address_line_1}<br />
                              {addr.address_line_2 && <>{addr.address_line_2}<br /></>}
                              {addr.city}, {addr.state} — {addr.pincode}
                              {addr.latitude && addr.longitude && (
                                <span style={{ display: 'block', marginTop: '6px', fontSize: '0.72rem', color: 'var(--gold-light)', fontStyle: 'italic' }}>
                                  GPS Coords: {addr.latitude.toFixed(6)}, {addr.longitude.toFixed(6)}
                                </span>
                              )}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className={styles.btnDeleteAddress}
                            style={{ marginTop: '16px' }}
                          >
                            <Trash2 size={12} />
                            <span>Remove Address</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* WISHLIST TAB */}
              {activeTab === 'wishlist' && (
                <div>
                  <h3 className={styles.sectionTitle}>Saved Wishlist Selections</h3>
                  <p className={styles.sectionSubtitle}>Exclusive products saved to your wishlist for future selection.</p>

                  {wishlist.length === 0 ? (
                    <div className={styles.emptyState}>
                      <Heart size={36} className="text-gold" />
                      <p className={styles.emptyText}>No items saved. Select items inside the storefront catalog to add to wishlist.</p>
                    </div>
                  ) : (
                    <div className={styles.wishlistGrid}>
                      {wishlist.map((item) => (
                        <div key={item.id} className={styles.wishlistCard}>
                          <div className={styles.wishlistVisual}>
                            {item.image && (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className={styles.wishlistInfo}>
                            <span className={styles.wishlistCategory}>{item.category}</span>
                            <h4 className={styles.wishlistName}>{item.name}</h4>
                            <span className={styles.wishlistPrice}>
                              {item.price ? `₹${item.price.toLocaleString('en-IN')}` : 'Premium Cut'}
                            </span>
                          </div>
                          <div className={styles.wishlistActions}>
                            <button
                              onClick={() => handleMoveToCart(item)}
                              className={styles.btnMoveToCart}
                            >
                              <span>Add to Cart</span>
                              <ArrowRight size={12} />
                            </button>
                            <button
                              onClick={() => removeFromWishlist(item.id)}
                              className={styles.btnRemoveWishlist}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </GlassCard>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}>
          <div className={styles.doubleSpinner1}></div>
          <div className={styles.doubleSpinner2}></div>
        </div>
        <p className={styles.loadingText}>RESOLVING PORTAL...</p>
      </div>
    }>
      <AccountDashboard />
    </Suspense>
  );
}
