'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  MapPin,
  Plus,
  Check,
  CreditCard,
  Smartphone,
  DollarSign,
  ShieldAlert,
  ShoppingBag,
  CheckCircle,
  Truck,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCartWishlist } from '../../context/CartWishlistContext';
import { dbService } from '../../services/db';
import Navigation from '../../components/Navigation';
import Footer from '../../sections/Footer';
import ParticleField from '../../components/ParticleField';
import GlassCard from '../../components/GlassCard';
import styles from './page.module.css';

function CheckoutContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, getCartSubtotal, clearCart } = useCartWishlist();

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
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
  const [savingAddress, setSavingAddress] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  // Checkout Operations State
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null); // Will hold orderNumber on success

  // Fetch addresses on load
  useEffect(() => {
    if (!user) return;
    const loadAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const list = await dbService.fetchAddresses(user.id);
        setAddresses(list);

        // Select default address if exists, otherwise the first one
        if (list.length > 0) {
          const defaultAddr = list.find(a => a.is_default);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          } else {
            setSelectedAddressId(list[0].id);
          }
        } else {
          // If no addresses, open form automatically
          setShowAddressForm(true);
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    };
    loadAddresses();
  }, [user]);

  // Protected route redirects
  useEffect(() => {
    if (!authLoading && !user) {
      alert('Please sign in to access the checkout portal.');
      router.push('/');
    }
  }, [user, authLoading, router]);



  // Geolocation and Reverse Geocoding Handler
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
        let errorMsg = 'Could not detect location. You can type your address manually below.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location access was denied. To enable: go to your phone Settings → Privacy/Location → turn on Location Services, then allow this browser to access location. You can also type your address manually below.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location unavailable. Please turn on GPS/Location in your phone Settings → Privacy/Location, then try again. You can also type your address manually below.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out. Please ensure GPS is enabled in your phone Settings and try again, or type your address manually below.';
        }
        setAddressError(errorMsg);
        setFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const generateWhatsAppLink = (orderNum, addressObj, cartItems, totalVal, payMethod, orderStatus, orderDate) => {
    const storePhone = process.env.NEXT_PUBLIC_STORE_PHONE || '917975463051';
    
    // Format items text
    const itemsText = cartItems.map(item => {
      const itemPrice = Math.round(item.basePrice * item.priceMultiplier * item.quantity);
      return `• ${item.name} (${item.weight}) × ${item.quantity} - ₹${itemPrice.toLocaleString('en-IN')}`;
    }).join('\n');

    // Complete delivery address text
    const completeAddress = `${addressObj.address_line_1}${addressObj.address_line_2 ? ', ' + addressObj.address_line_2 : ''}, ${addressObj.city}, ${addressObj.state} — ${addressObj.pincode}`;

    // Priority 1: Google Maps Coordinates Link, Priority 2: Full address fallback
    let mapsLink = '';
    if (addressObj.latitude && addressObj.longitude) {
      mapsLink = `https://maps.google.com/?q=${addressObj.latitude},${addressObj.longitude}`;
    } else {
      mapsLink = `https://maps.google.com/?q=${encodeURIComponent(completeAddress)}`;
    }

    const dateStr = orderDate.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const message = `*NEW ORDER RECEIVED — AL-QURAISH* 🥩

*Order ID:* ${orderNum}
*Date & Time:* ${dateStr}

*CUSTOMER DETAILS*
*Name:* ${addressObj.full_name}
*Phone:* ${addressObj.phone}
*Email:* ${addressObj.email}

*DELIVERY DETAILS*
*Address:* ${completeAddress}
*Google Maps Navigate:* ${mapsLink}

*ORDER DETAILS*
${itemsText}

*Total Amount:* ₹${Math.round(totalVal).toLocaleString('en-IN')}
*Payment Method:* ${payMethod}
*Order Status:* ${orderStatus}

_Please forward this message to the dispatch/delivery staff._`;

    return `https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`;
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressError('');

    // GPS coordinates are optional — users may not have location services enabled
    // We still encourage using location but don't block the order

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

    setSavingAddress(true);
    try {
      const added = await dbService.addAddress(user.id, newAddress);

      // Update address list and select the newly added address
      setAddresses(prev => {
        const updated = added.is_default
          ? prev.map(a => ({ ...a, is_default: false }))
          : prev;
        return [added, ...updated];
      });
      setSelectedAddressId(added.id);

      // Reset form
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
      setAddressError('Failed to save address details. Please verify all inputs.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setOrderError('Please select a delivery address to complete your order.');
      return;
    }

    setOrderError('');
    setPlacingOrder(true);

    try {
      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      const subtotal = getCartSubtotal();
      const grandTotal = subtotal; // Delivery fee is complimentary
      const orderDate = new Date();

      // Place Order in DB (creates order, order_items, links user & address, clears database cart_items)
      const res = await dbService.createOrder(
        user.id,
        cart,
        subtotal,
        selectedAddressId,
        paymentMethod
      );

      // Generate deterministic friendly order number to display
      const createdDate = new Date(res.created_at || orderDate);
      const year = createdDate.getFullYear() || 2026;
      let hash = 0;
      const uuid = res.id;
      for (let i = 0; i < uuid.length; i++) {
        const char = uuid.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      const friendlyNum = `ORD-${year}-${(Math.abs(hash) % 1000000).toString().padStart(6, '0')}`;

      // Generate WhatsApp redirection URL
      const waLink = generateWhatsAppLink(
        friendlyNum,
        selectedAddress,
        cart,
        grandTotal,
        paymentMethod,
        'Pending',
        createdDate
      );
      setWhatsappUrl(waLink);

      // Clear Cart frontend context
      await clearCart();

      // Set success status
      setOrderSuccess(friendlyNum);

      // Automatically open WhatsApp message to store owner
      try {
        window.open(waLink, '_blank');
      } catch (e) {
        console.warn('Auto-opening WhatsApp popup blocked. Backup CTA will display.', e);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setOrderError(err.message || 'Transaction failed. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Render Order Success Modal/Overlay
  if (orderSuccess) {
    return (
      <div className={styles.successScreen}>
        <ParticleField
          particleCount={30}
          color="rgba(212, 175, 55, 0.15)"
          speed={0.1}
          maxSize={1.5}
        />
        <div className={styles.successCard}>
          <div className={styles.successCheckContainer}>
            <CheckCircle size={64} className={styles.successCheckIcon} />
          </div>
          <h2 className={styles.successTitle}>ORDER PLACED SUCCESSFULLY</h2>
          <p className={styles.successSubtitle}>Welcome to Al-Quraish Gourmet experience.</p>

          <div className={styles.successDetails}>
            <div className={styles.successRow}>
              <span className={styles.successLabel}>Order Number</span>
              <span className={styles.successValue} style={{ color: '#0c5132' }}>{orderSuccess}</span>
            </div>
            <div className={styles.successRow}>
              <span className={styles.successLabel}>Payment Method</span>
              <span className={styles.successValue}>{paymentMethod}</span>
            </div>
            <div className={styles.successRow}>
              <span className={styles.successLabel}>Logistics Route</span>
              <span className={styles.successValue}>Cold-Chain Protected Express</span>
            </div>
          </div>

          <p className={styles.successNotice}>
            Our dispatch coordinators will prepare your premium selection. You will receive real-time cold-chain tracking details shortly.
          </p>

          <div className={styles.successActions} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '30px' }}>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn-primary ${styles.btnWhatsapp}`}
                id="btn-whatsapp-confirm"
                style={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '16px 24px', background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', border: '1px solid #25D366', color: '#ffffff' }}
              >
                <Smartphone size={16} />
                <span>Send Order to Store Owner</span>
              </a>
            )}
            <div style={{ display: 'flex', gap: '12px', width: '100%', flexWrap: 'wrap' }}>
              <Link href="/account?tab=orders" className="btn-primary" style={{ flex: '1 1 200px', justifyContent: 'center' }}>
                <span>View Order History</span>
                <ArrowRight size={14} />
              </Link>
              <Link href="/premium-poultry" className="btn-glass" style={{ flex: '1 1 200px', justifyContent: 'center' }}>
                Return to Catalog
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getCartSubtotal();
  const deliveryFee = 0; // Free delivery for luxury selections
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className={styles.pageContainer}>
      <title>Secure Checkout — AL-QURAISH</title>

      {/* Background Ambience removed in favor of global AtmosphericBackground */}

      <ParticleField
        particleCount={25}
        color="rgba(212, 175, 55, 0.12)"
        speed={0.08}
        maxSize={1.2}
      />

      <Navigation />

      <main className={`container ${styles.checkoutMain}`} style={{ paddingBottom: '100px', minHeight: '90vh' }}>

        {/* Back Link */}
        <Link href="/premium-poultry" className={styles.backLink}>
          <ChevronLeft size={16} />
          <span>Back to Catalog</span>
        </Link>

        <h1 className={styles.pageTitle}>
          SECURE<br />
          <span className="text-gold-gradient">CHECKOUT.</span>
        </h1>

        {cart.length === 0 ? (
          <div className={styles.emptyCartCard}>
            <ShoppingBag size={48} className={styles.emptyCartIcon} />
            <h2 className={styles.emptyCartTitle}>Your bag is empty</h2>
            <p className={styles.emptyCartSubtitle}>Browse our premium catalog to add fresh selections to your cart.</p>
            <Link href="/premium-poultry" className="btn-primary" style={{ marginTop: '24px' }}>
              Press to Shop
            </Link>
          </div>
        ) : (
          <div className={styles.checkoutGrid}>

          {/* Left Column: Delivery Details & Payment */}
          <div className={styles.mainCol}>

            {/* 1. DELIVERY ADDRESS SECTION */}
            <GlassCard className={styles.checkoutSection} hoverGlow={false} expandOnHover={false}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleBlock}>
                  <div className={styles.sectionIconFrame}>
                    <MapPin size={18} className="text-gold" />
                  </div>
                  <h3 className={styles.sectionTitle}>Delivery Address</h3>
                </div>
                {!showAddressForm && addresses.length > 0 && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className={styles.btnAddAddressToggle}
                    id="btn-add-address-toggle"
                  >
                    <Plus size={14} /> Add New Address
                  </button>
                )}
              </div>

              {/* Saved Address Book */}
              {!showAddressForm && (
                <div className={styles.addressList}>
                  {loadingAddresses ? (
                    <p className={styles.loadingText}>Fetching saved coordinates...</p>
                  ) : addresses.length === 0 ? (
                    <div className={styles.noAddressesState}>
                      <p>No addresses recorded in your secure notebook.</p>
                    </div>
                  ) : (
                    <div className={styles.addressGrid}>
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`${styles.addressCard} ${selectedAddressId === addr.id ? styles.addressCardSelected : ''}`}
                          onClick={() => setSelectedAddressId(addr.id)}
                          id={`address-card-${addr.id}`}
                        >
                          <div className={styles.addressCardHeader}>
                            <span className={styles.addressRecipientName}>{addr.full_name}</span>
                            {selectedAddressId === addr.id ? (
                              <span className={styles.selectedIndicator}>
                                <Check size={10} /> Selected
                              </span>
                            ) : (
                              addr.is_default && <span className={styles.defaultBadge}>Default</span>
                            )}
                          </div>

                          <p className={styles.addressContact}>
                            {addr.phone} | {addr.email}
                          </p>

                          <p className={styles.addressLines}>
                            {addr.address_line_1}
                            {addr.address_line_2 && `, ${addr.address_line_2}`}
                            <br />
                            {addr.city}, {addr.state} — {addr.pincode}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Add New Address Form Inline */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className={styles.addressForm} id="add-address-form">
                  <h4 className={styles.formSubtitle}>New Delivery Coordinates</h4>

                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className={styles.btnLocation}
                    disabled={fetchingLocation}
                    id="btn-use-location"
                  >
                    {fetchingLocation ? (
                      <>
                        <span className={styles.loaderSmall}></span>
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
                    <div className={styles.locationSuccess} id="location-success-indicator">
                      <Check size={10} style={{ color: '#0c5132', marginRight: '6px' }} />
                      <span>GPS Coordinates Captured: {newAddress.latitude.toFixed(6)}, {newAddress.longitude.toFixed(6)}</span>
                    </div>
                  )}

                  <div className={styles.namePhoneGrid}>
                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Full Name</span>
                      <input
                        type="text"
                        placeholder="Recipient Full Name"
                        value={newAddress.full_name}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, full_name: e.target.value }))}
                        className={styles.goldInput}
                        required
                        id="address-fullname-input"
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Phone Number</span>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                        className={styles.goldInput}
                        required
                        id="address-phone-input"
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
                      id="address-email-input"
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <span className={styles.inputLabel}>Address Line 1</span>
                    <input
                      type="text"
                      placeholder="House No, Apartment, Street name"
                      value={newAddress.address_line_1}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
                      className={styles.goldInput}
                      required
                      id="address-line1-input"
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <span className={styles.inputLabel}>Address Line 2 (Optional)</span>
                    <input
                      type="text"
                      placeholder="Locality, Area, Landmark"
                      value={newAddress.address_line_2}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
                      className={styles.goldInput}
                      id="address-line2-input"
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
                        id="address-city-input"
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
                        id="address-state-input"
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
                        id="address-pincode-input"
                      />
                    </div>
                  </div>

                  <div className={styles.checkboxGroup}>
                    <input
                      type="checkbox"
                      id="is_default_checkbox"
                      checked={newAddress.is_default}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, is_default: e.target.checked }))}
                      className={styles.goldCheckbox}
                    />
                    <label htmlFor="is_default_checkbox">Set as default coordinates</label>
                  </div>

                  {addressError && (
                    <div className={styles.errorMessage}>
                      <span>{addressError}</span>
                    </div>
                  )}

                  <div className={styles.formActions}>
                    <button type="submit" className="btn-primary" disabled={savingAddress} id="btn-save-address">
                      {savingAddress ? 'Saving details...' : 'Save Address'}
                    </button>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="btn-glass"
                        style={{ borderColor: 'rgba(209, 213, 219, 0.6)' }}
                        id="btn-cancel-address"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </GlassCard>

            {/* 2. PAYMENT METHODS SECTION */}
            <GlassCard className={styles.checkoutSection} hoverGlow={false} expandOnHover={false}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleBlock}>
                  <div className={styles.sectionIconFrame}>
                    <CreditCard size={18} className="text-gold" />
                  </div>
                  <h3 className={styles.sectionTitle}>Payment Method</h3>
                </div>
              </div>

              <div className={styles.paymentGrid}>
                {/* Active Cash on Delivery Option */}
                <div
                  className={`${styles.paymentCard} ${paymentMethod === 'Cash on Delivery' ? styles.paymentCardSelected : ''}`}
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  id="payment-cod-option"
                >
                  <div className={styles.paymentRadioIcon}>
                    <div className={paymentMethod === 'Cash on Delivery' ? styles.paymentRadioInnerActive : styles.paymentRadioInner}></div>
                  </div>
                  <div className={styles.paymentDetails}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DollarSign size={18} className="text-gold" />
                      <span className={styles.paymentName}>Cash on Delivery (COD)</span>
                    </div>
                    <p className={styles.paymentDesc}>Settle the transaction in cash or local UPI QR codes upon cold chain delivery.</p>
                  </div>
                </div>

                {/* Disabled Credit/Debit Cards Option */}
                <div className={`${styles.paymentCard} ${styles.paymentCardDisabled}`} title="Upcoming Feature">
                  <div className={styles.paymentRadioIcon}>
                    <div className={styles.paymentRadioInnerDisabled}></div>
                  </div>
                  <div className={styles.paymentDetails}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CreditCard size={18} className="text-muted" />
                      <span className={styles.paymentName}>Credit / Debit Cards</span>
                      <span className={styles.upcomingBadge}>Soon</span>
                    </div>
                    <p className={styles.paymentDesc}>Pay securely with Visa, Mastercard, or RuPay via checkout gateway.</p>
                  </div>
                </div>

                {/* Disabled UPI Option */}
                <div className={`${styles.paymentCard} ${styles.paymentCardDisabled}`} title="Upcoming Feature">
                  <div className={styles.paymentRadioIcon}>
                    <div className={styles.paymentRadioInnerDisabled}></div>
                  </div>
                  <div className={styles.paymentDetails}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Smartphone size={18} className="text-muted" />
                      <span className={styles.paymentName}>UPI Payments</span>
                      <span className={styles.upcomingBadge}>Soon</span>
                    </div>
                    <p className={styles.paymentDesc}>Direct transfer from Google Pay, PhonePe, or Paytm UPI accounts.</p>
                  </div>
                </div>

                {/* Disabled Razorpay Option */}
                <div className={`${styles.paymentCard} ${styles.paymentCardDisabled}`} title="Upcoming Feature">
                  <div className={styles.paymentRadioIcon}>
                    <div className={styles.paymentRadioInnerDisabled}></div>
                  </div>
                  <div className={styles.paymentDetails}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={styles.razorpayIcon}>💳</span>
                      <span className={styles.paymentName}>Razorpay Portal</span>
                      <span className={styles.upcomingBadge}>Soon</span>
                    </div>
                    <p className={styles.paymentDesc}>Comprehensive processing gateway including Net Banking.</p>
                  </div>
                </div>
              </div>
            </GlassCard>

          </div>

          {/* Right Column: Order Summary & Placement */}
          <div className={styles.sidebarCol}>
            <GlassCard className={styles.summaryCard} hoverGlow={false}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>
              <p className={styles.summarySubtitle}>Review your premium cuts before dispatch.</p>

              {/* Items List */}
              <div className={styles.cartItemsScrollList}>
                {cart.map((item) => (
                  <div key={`${item.id}-${item.weight}`} className={styles.summaryItemRow}>
                    <div className={styles.summaryItemImage}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className={styles.summaryItemDetail}>
                      <span className={styles.summaryItemName}>{item.name}</span>
                      <span className={styles.summaryItemVariant}>{item.weight} × {item.quantity}</span>
                    </div>
                    <span className={styles.summaryItemPrice}>
                      ₹{Math.round(item.basePrice * item.priceMultiplier * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation Breakdowns */}
              <div className={styles.summaryCalculations}>
                <div className={styles.calcRow}>
                  <span>Subtotal</span>
                  <span>₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className={`${styles.calcRow} ${styles.calcRowHighlight}`}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={12} className="text-gold" />
                    <span>Cold-Chain Delivery</span>
                  </span>
                  <span style={{ color: '#0c5132' }}>Complimentary</span>
                </div>
                <div className={styles.calcRowTotal}>
                  <span>Grand Total</span>
                  <span>₹{Math.round(grandTotal).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Alerts & Errors */}
              {orderError && (
                <div className={styles.errorMessage} style={{ margin: '16px 0 0' }}>
                  <span>{orderError}</span>
                </div>
              )}

              {!selectedAddressId && !showAddressForm && (
                <div className={styles.alertAddressPending}>
                  <ShieldAlert size={14} />
                  <span>Please configure/select a delivery address to enable ordering.</span>
                </div>
              )}

              {/* Place Order CTA */}
              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '24px', padding: '18px 24px' }}
                disabled={placingOrder || !selectedAddressId}
                onClick={handlePlaceOrder}
                id="btn-place-order"
              >
                {placingOrder ? 'Processing selection...' : 'Place Order'}
              </button>
            </GlassCard>
          </div>

        </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
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
      <CheckoutContent />
    </Suspense>
  );
}
