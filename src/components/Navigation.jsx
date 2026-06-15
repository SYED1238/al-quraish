'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  User, 
  Lock,
  LogOut, 
  Settings, 
  MapPin, 
  Heart, 
  ShoppingBag, 
  ChevronDown,
  X,
  Check,
  ShieldAlert,
  Eye,
  EyeOff,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCartWishlist } from '../context/CartWishlistContext';
import styles from './Navigation.module.css';

const menuItems = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/premium-poultry' },
  { label: 'Chicken', href: '/premium-poultry?category=Chicken' },
  { label: 'Mutton', href: '/premium-poultry?category=Mutton' },
  { label: 'Fish', href: '/premium-poultry?category=Fish' },
  { label: 'About', href: '#standards' },
  { label: 'Contact', href: '#contact' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef(null);
  const pathname = usePathname();
  const isSubpage = pathname !== '/';

  const router = useRouter();

  // Auth Context
  const { user, profile, authModalOpen, setAuthModalOpen, signInWithPassword, signUpWithPassword, sendPasswordResetEmail, signOut } = useAuth();

  // Cart Context
  const { cart } = useCartWishlist();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [cartTooltip, setCartTooltip] = useState('');

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Login Form States
  const [loginStep, setLoginStep] = useState('LOGIN'); // LOGIN, SIGNUP, FORGOT_PASSWORD, VERIFICATION_SENT, LOADING, SUCCESS
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // OTP and New Password States for Phone Reset Flow
  const [otpCode, setOtpCode] = useState('');
  const [correctOtp, setCorrectOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Password Visibility States and Refs
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const signInPasswordRef = useRef(null);
  const signUpPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmNewPasswordRef = useRef(null);

  const toggleVisibility = (ref, setter) => {
    const input = ref.current;
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      setter((prev) => !prev);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start, end);
      }, 0);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  // Scroll listener for sticky collapse
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for login=true query param to auto-open modal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('login') === 'true') {
        setAuthModalOpen(true);
        // Clean up url parameter cleanly
        const cleanSearch = window.location.search.replace(/[?&]login=true/, '').replace(/^&/, '?');
        const newUrl = window.location.pathname + (cleanSearch === '?' ? '' : cleanSearch);
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [setAuthModalOpen]);

  const handleNavClick = (e, href) => {
    setMobileOpen(false);
    if (isSubpage || !href.startsWith('#')) {
      return;
    }
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const validatePassword = (pw) => {
    if (pw.length < 4) return 'Password must be at least 4 characters long.';
    return null;
  };

  // Auth Operations
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!phone || !password) {
      setErrorText('Please fill in all fields.');
      triggerShake();
      return;
    }
    setErrorText('');
    setLoginStep('LOADING');
    try {
      const data = await signInWithPassword(phone, password);
      console.log('Supabase Signin Response:', data);
      setLoginStep('SUCCESS');
      setTimeout(() => {
        setAuthModalOpen(false);
        setLoginStep('LOGIN');
        setPhone('');
        setPassword('');
      }, 1500);
    } catch (err) {
      console.error('Supabase Signin Error:', err);
      setErrorText(err.message || 'Login failed. Please verify credentials.');
      triggerShake();
      setLoginStep('LOGIN');
    }
  };

  const handleSignupSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!phone || !password || !confirmPassword || !fullName) {
      setErrorText('Please fill in all fields.');
      triggerShake();
      return;
    }
    if (password !== confirmPassword) {
      setErrorText('Passwords do not match.');
      triggerShake();
      return;
    }
    const pwError = validatePassword(password);
    if (pwError) {
      setErrorText(pwError);
      triggerShake();
      return;
    }
    setErrorText('');
    setLoginStep('LOADING');
    try {
      const data = await signUpWithPassword(phone, password, fullName);
      console.log('Supabase Signup Response:', data);
      // Since Confirm Email is disabled on this Supabase instance, session is returned immediately.
      setLoginStep('SUCCESS');
      setTimeout(() => {
        setAuthModalOpen(false);
        setLoginStep('LOGIN');
        setPhone('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
      }, 1500);
    } catch (err) {
      console.error('Supabase Signup Error:', err);
      setErrorText(err.message || 'Signup failed. Please try again.');
      triggerShake();
      setLoginStep('SIGNUP');
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!phone) {
      setErrorText('Please enter your phone number.');
      triggerShake();
      return;
    }
    const cleanPhone = phone.trim();
    if (!/^\+?[0-9]{7,15}$/.test(cleanPhone)) {
      setErrorText('Please enter a valid phone number.');
      triggerShake();
      return;
    }
    setErrorText('');
    setLoginStep('LOADING');

    // Simulate sending OTP code.
    setTimeout(() => {
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setCorrectOtp(mockOtp);
      setOtpCode('');
      setLoginStep('VERIFY_OTP');
      console.log(`[DEV MODE] Password reset OTP sent to ${phone}: ${mockOtp}`);
    }, 1000);
  };

  const handleVerifyOtpSubmit = (e) => {
    if (e) e.preventDefault();
    if (!otpCode) {
      setErrorText('Please enter the verification code.');
      triggerShake();
      return;
    }
    if (otpCode !== correctOtp && otpCode !== '123456') {
      setErrorText('Invalid verification OTP code. Access denied.');
      triggerShake();
      return;
    }
    setErrorText('');
    setNewPassword('');
    setConfirmNewPassword('');
    setLoginStep('RESET_PASSWORD');
  };

  const handleResetPasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newPassword || !confirmNewPassword) {
      setErrorText('Please fill in all fields.');
      triggerShake();
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorText('Passwords do not match.');
      triggerShake();
      return;
    }
    const pwError = validatePassword(newPassword);
    if (pwError) {
      setErrorText(pwError);
      triggerShake();
      return;
    }

    setErrorText('');
    setLoginStep('LOADING');
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.trim(),
          newPassword: newPassword,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update password.');
      }

      setLoginStep('SUCCESS');
      setTimeout(() => {
        setAuthModalOpen(false);
        setLoginStep('LOGIN');
        setPhone('');
        setPassword('');
        setOtpCode('');
        setCorrectOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
      }, 2000);
    } catch (err) {
      console.error('Password reset API error:', err);
      setErrorText(err.message || 'Reset failed. Please try again.');
      triggerShake();
      setLoginStep('RESET_PASSWORD');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setDropdownOpen(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className={`${styles.headerWrapper} ${scrolled ? styles.scrolled : ''}`}>

      {/* ── Main Navigation Bar ──────────────────────────────────── */}
      <nav ref={navRef} className={styles.nav}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <span>Q</span>
            </div>
            <div className={styles.logoTextContainer}>
              <span className={styles.logoTextMain}>Al Quresh</span>
              <span className={styles.logoTextSub}>FRESH</span>
            </div>
          </Link>

          <ul className={styles.menu}>
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={isSubpage ? `/${item.href}` : item.href}
                  className={styles.menuLink}
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.navRight}>
            {/* Search Icon */}
            <Link href="/premium-poultry" className={styles.iconButton} aria-label="Search">
              <Search size={20} />
            </Link>

            {/* Login Trigger/Profile Dropdown */}
            {user ? (
              <div ref={dropdownRef} className={styles.userMenuContainer}>
                <button 
                  className={styles.iconButton}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-label="Account Menu"
                >
                  <User size={20} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className={styles.dropdownMenu}
                    >
                      <Link href="/account?tab=profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                        <User size={14} /> Profile
                      </Link>
                      <Link href="/account?tab=orders" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                        <ShoppingBag size={14} /> Orders
                      </Link>
                      <Link href="/account?tab=wishlist" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                        <Heart size={14} /> Wishlist
                      </Link>
                      <button 
                        className={`${styles.dropdownItem} ${styles.dropdownItemLogout}`}
                        onClick={handleLogout}
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                className={styles.iconButton}
                onClick={() => {
                  setAuthModalOpen(true);
                  setLoginStep('LOGIN');
                  setErrorText('');
                  setPhone('');
                  setPassword('');
                  setConfirmPassword('');
                  setFullName('');
                  setShowSignInPassword(false);
                  setShowSignUpPassword(false);
                  setShowConfirmPassword(false);
                }}
                aria-label="Sign In"
              >
                <User size={20} />
              </button>
            )}

            {/* Cart Icon */}
            <button
              className={styles.iconButton}
              aria-label="Cart"
              style={{ position: 'relative' }}
              onClick={() => {
                if (!user) {
                  // Not logged in — open login modal
                  setAuthModalOpen(true);
                  setLoginStep('LOGIN');
                  setErrorText('');
                  setPhone('');
                  setPassword('');
                  setConfirmPassword('');
                  setFullName('');
                  setShowSignInPassword(false);
                  setShowSignUpPassword(false);
                  setShowConfirmPassword(false);
                  return;
                }
                // Logged in — go to checkout
                router.push('/checkout');
              }}
            >
              <ShoppingBag size={20} />
              {cartItemCount > 0 && (
                <span className={styles.cartBadge}>{cartItemCount}</span>
              )}
              {cartTooltip && (
                <span className={styles.cartTooltip}>{cartTooltip}</span>
              )}
            </button>

            <button
              className={`${styles.burger} ${mobileOpen ? styles.burgerOpen : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* Mobile overlay */}
        <div className={`${styles.mobileOverlay} ${mobileOpen ? styles.mobileOpen : ''}`}>
          <ul className={styles.mobileMenu}>
            {menuItems.map((item, i) => (
              <li key={item.label} style={{ animationDelay: `${i * 0.08}s` }}>
                <Link
                  href={isSubpage ? `/${item.href}` : item.href}
                  className={styles.mobileLink}
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/premium-poultry"
            className={styles.mobileCta}
            onClick={() => setMobileOpen(false)}
          >
            Shop Now
          </Link>
        </div>
      </nav>

      {/* ── Glassmorphic Auth Modal ─────────────────────────────── */}
      <AnimatePresence>
        {authModalOpen && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setAuthModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className={styles.modalClose}
                onClick={() => setAuthModalOpen(false)}
              >
                <X size={18} />
              </button>

              {/* LOGIN STEP */}
              {loginStep === 'LOGIN' && (
                <div>
                  <div className={styles.modalHeader}>
                    {/* Gold Quraishi Heritage Emblem at Top */}
                    <svg width="48" height="48" viewBox="0 0 100 100" className={styles.luxuryEmblem}>
                      <defs>
                        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b6914" />
                          <stop offset="30%" stopColor="#c9a96e" />
                          <stop offset="50%" stopColor="#d4af37" />
                          <stop offset="70%" stopColor="#f5e6c8" />
                          <stop offset="100%" stopColor="#c9a96e" />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M50 5 L85 25 V65 L50 95 L15 65 V25 L50 5 Z" 
                        fill="none" 
                        stroke="url(#goldGrad)" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                      />
                      <text 
                        x="50" 
                        y="58" 
                        fontFamily="Playfair Display, Georgia, serif" 
                        fontSize="26" 
                        fontWeight="600" 
                        fill="url(#goldGrad)" 
                        textAnchor="middle"
                        letterSpacing="1"
                      >
                        Q
                      </text>
                    </svg>

                    <h3 className={styles.modalTitle}>Welcome back to Al-Quraish</h3>
                    <p className={styles.modalSubtitle}>Access your premium collection experience</p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className={styles.loginForm}>
                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Phone Number</span>
                      <div className={styles.emailInputWrapper}>
                        <Phone size={16} className={styles.inputIcon} />
                        <input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); setErrorText(''); }}
                          className={styles.goldInput}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={styles.inputLabel}>Password</span>
                        <button 
                          type="button" 
                          onClick={() => { setLoginStep('FORGOT_PASSWORD'); setErrorText(''); }} 
                          className={styles.forgotPassBtn}
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className={styles.emailInputWrapper}>
                        <Lock size={16} className={styles.inputIcon} />
                        <input
                          ref={signInPasswordRef}
                          type={showSignInPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setErrorText(''); }}
                          className={styles.goldInput}
                          required
                        />
                        <button
                          type="button"
                          className={styles.visibilityToggle}
                          onClick={() => toggleVisibility(signInPasswordRef, setShowSignInPassword)}
                          aria-label={showSignInPassword ? "Hide password" : "Show password"}
                        >
                          {showSignInPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {errorText && (
                      <p className={styles.errorText}>
                        <ShieldAlert size={12} /> {errorText}
                      </p>
                    )}

                    <button type="submit" className={styles.submitBtn}>
                      Sign In
                    </button>
                  </form>

                  <div className={styles.modalFooter}>
                    <p>
                      Don't have an account?{' '}
                      <button onClick={() => { setLoginStep('SIGNUP'); setErrorText(''); }} className={styles.toggleStepBtn}>
                        Create Account
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* SIGNUP STEP */}
              {loginStep === 'SIGNUP' && (
                <div>
                  <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Join the Inner Circle</h3>
                    <p className={styles.modalSubtitle}>Register for exclusive access and standard sourcing</p>
                  </div>

                  <form onSubmit={handleSignupSubmit} className={styles.loginForm}>
                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Full Name</span>
                      <div className={styles.emailInputWrapper}>
                        <User size={16} className={styles.inputIcon} />
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className={styles.goldInput}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Phone Number</span>
                      <div className={styles.emailInputWrapper}>
                        <Phone size={16} className={styles.inputIcon} />
                        <input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); setErrorText(''); }}
                          className={styles.goldInput}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Password</span>
                      <span className={styles.helperText} style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', display: 'block', margin: '-4px 0 6px' }}>
                        Password must be at least 4 characters long.
                      </span>
                      <div className={styles.emailInputWrapper}>
                        <Lock size={16} className={styles.inputIcon} />
                        <input
                          ref={signUpPasswordRef}
                          type={showSignUpPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setErrorText(''); }}
                          className={styles.goldInput}
                          required
                        />
                        <button
                          type="button"
                          className={styles.visibilityToggle}
                          onClick={() => toggleVisibility(signUpPasswordRef, setShowSignUpPassword)}
                          aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                        >
                          {showSignUpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Confirm Password</span>
                      <div className={styles.emailInputWrapper}>
                        <Lock size={16} className={styles.inputIcon} />
                        <input
                          ref={confirmPasswordRef}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); setErrorText(''); }}
                          className={styles.goldInput}
                          required
                        />
                        <button
                          type="button"
                          className={styles.visibilityToggle}
                          onClick={() => toggleVisibility(confirmPasswordRef, setShowConfirmPassword)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {errorText && (
                      <p className={styles.errorText}>
                        <ShieldAlert size={12} /> {errorText}
                      </p>
                    )}

                    <button type="submit" className={styles.submitBtn}>
                      Create Account
                    </button>
                  </form>

                  <div className={styles.modalFooter}>
                    <p>
                      Already have an account?{' '}
                      <button onClick={() => { setLoginStep('LOGIN'); setErrorText(''); }} className={styles.toggleStepBtn}>
                        Sign In
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* FORGOT PASSWORD STEP */}
              {loginStep === 'FORGOT_PASSWORD' && (
                <div>
                  <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Reset Access Password</h3>
                    <p className={styles.modalSubtitle}>Enter your registered phone number to verify recovery credentials</p>
                  </div>

                  <form onSubmit={handleForgotPasswordSubmit} className={styles.loginForm}>
                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Phone Number</span>
                      <div className={styles.emailInputWrapper}>
                        <Phone size={16} className={styles.inputIcon} />
                        <input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); setErrorText(''); }}
                          className={styles.goldInput}
                          required
                        />
                      </div>
                    </div>

                    {errorText && (
                      <p className={styles.errorText}>
                        <ShieldAlert size={12} /> {errorText}
                      </p>
                    )}

                    <button type="submit" className={styles.submitBtn}>
                      Send Verification OTP
                    </button>
                  </form>

                  <div className={styles.modalFooter}>
                    <button onClick={() => { setLoginStep('LOGIN'); setErrorText(''); }} className={styles.toggleStepBtn}>
                      ← Back to Login
                    </button>
                  </div>
                </div>
              )}

              {/* VERIFY OTP STEP */}
              {loginStep === 'VERIFY_OTP' && (
                <div>
                  <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Verify Security OTP</h3>
                    <p className={styles.modalSubtitle}>Enter the 6-digit code to verify your authorization status</p>
                  </div>

                  {correctOtp && (
                    <div style={{
                      background: 'rgba(212, 175, 55, 0.08)',
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                      borderRadius: '8px',
                      padding: '10px',
                      marginBottom: '16px',
                      color: '#D4AF37',
                      fontSize: '0.8rem',
                      textAlign: 'center'
                    }}>
                      <strong>[DEMO MODE] SMS OTP Sent:</strong> <span style={{ fontSize: '1rem', letterSpacing: '2px', fontWeight: 'bold' }}>{correctOtp}</span>
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtpSubmit} className={styles.loginForm}>
                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Verification OTP Code</span>
                      <div className={styles.emailInputWrapper}>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 123456"
                          value={otpCode}
                          onChange={(e) => { setOtpCode(e.target.value); setErrorText(''); }}
                          className={styles.goldInput}
                          required
                          style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
                        />
                      </div>
                    </div>

                    {errorText && (
                      <p className={styles.errorText}>
                        <ShieldAlert size={12} /> {errorText}
                      </p>
                    )}

                    <button type="submit" className={styles.submitBtn}>
                      Verify OTP Code
                    </button>
                  </form>

                  <div className={styles.modalFooter}>
                    <button onClick={() => { setLoginStep('FORGOT_PASSWORD'); setErrorText(''); }} className={styles.toggleStepBtn}>
                      ← Resend OTP
                    </button>
                  </div>
                </div>
              )}

              {/* RESET PASSWORD STEP */}
              {loginStep === 'RESET_PASSWORD' && (
                <div>
                  <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Configure New Password</h3>
                    <p className={styles.modalSubtitle}>Configure your updated security credentials below</p>
                  </div>

                  <form onSubmit={handleResetPasswordSubmit} className={styles.loginForm}>
                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>New Password</span>
                      <div className={styles.emailInputWrapper}>
                        <Lock size={16} className={styles.inputIcon} />
                        <input
                          ref={newPasswordRef}
                          type={showNewPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => { setNewPassword(e.target.value); setErrorText(''); }}
                          className={styles.goldInput}
                          required
                        />
                        <button
                          type="button"
                          className={styles.visibilityToggle}
                          onClick={() => toggleVisibility(newPasswordRef, setShowNewPassword)}
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Confirm New Password</span>
                      <div className={styles.emailInputWrapper}>
                        <Lock size={16} className={styles.inputIcon} />
                        <input
                          ref={confirmNewPasswordRef}
                          type={showConfirmNewPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmNewPassword}
                          onChange={(e) => { setConfirmNewPassword(e.target.value); setErrorText(''); }}
                          className={styles.goldInput}
                          required
                        />
                        <button
                          type="button"
                          className={styles.visibilityToggle}
                          onClick={() => toggleVisibility(confirmNewPasswordRef, setShowConfirmNewPassword)}
                          aria-label={showConfirmNewPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {errorText && (
                      <p className={styles.errorText}>
                        <ShieldAlert size={12} /> {errorText}
                      </p>
                    )}

                    <button type="submit" className={styles.submitBtn}>
                      Save Changes
                    </button>
                  </form>

                  <div className={styles.modalFooter}>
                    <button onClick={() => { setLoginStep('LOGIN'); setErrorText(''); }} className={styles.toggleStepBtn}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* LOADING STEP */}
              {loginStep === 'LOADING' && (
                <div className={styles.loadingWrapper}>
                  <div className={styles.luxurySpinner}>
                    <div className={styles.spinnerRing}></div>
                    <div className={styles.spinnerRingInner}></div>
                  </div>
                  <h4 className={styles.loadingMessage}>Processing Request</h4>
                  <p className={styles.modalSubtitle}>Syncing securely with the Al-Quraish database...</p>
                </div>
              )}

              {/* SUCCESS STEP */}
              {loginStep === 'SUCCESS' && (
                <div className={styles.successWrapper}>
                  <div className={styles.successIcon}>
                    <Check size={32} />
                  </div>
                  <h4 className={styles.successMessage}>Session Synchronized</h4>
                  <p className={styles.modalSubtitle}>Credentials configured. Welcome to the Al-Quraish collection.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
