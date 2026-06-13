'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  User, 
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
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Navigation.module.css';

const menuItems = [
  { label: 'Collection', href: '#collection' },
  { label: 'Standards', href: '#standards' },
  { label: 'Source', href: '#source' },
  { label: 'Experience', href: '#experience' },
  { label: 'Membership', href: '#membership' },
  { label: 'Contact', href: '#contact' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef(null);
  const pathname = usePathname();
  const isSubpage = pathname !== '/';

  // Auth Context
  const { user, profile, authModalOpen, setAuthModalOpen, signInWithPassword, signUpWithPassword, sendPasswordResetEmail, signOut } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Login Form States
  const [loginStep, setLoginStep] = useState('LOGIN'); // LOGIN, SIGNUP, FORGOT_PASSWORD, VERIFICATION_SENT, LOADING, SUCCESS
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // Password Visibility States and Refs
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const signInPasswordRef = useRef(null);
  const signUpPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

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
    if (isSubpage) {
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
    if (pw.length < 6) return 'Password must be at least 6 characters long.';
    return null;
  };

  // Auth Operations
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setErrorText('Please fill in all fields.');
      triggerShake();
      return;
    }
    setErrorText('');
    setLoginStep('LOADING');
    try {
      const data = await signInWithPassword(email, password);
      console.log('Supabase Signin Response:', data);
      setLoginStep('SUCCESS');
      setTimeout(() => {
        setAuthModalOpen(false);
        setLoginStep('LOGIN');
        setEmail('');
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
    if (!email || !password || !confirmPassword || !fullName) {
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
      const data = await signUpWithPassword(email, password, fullName);
      console.log('Supabase Signup Response:', data);
      if (data?.session) {
        setLoginStep('SUCCESS');
        setTimeout(() => {
          setAuthModalOpen(false);
          setLoginStep('LOGIN');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setFullName('');
        }, 1500);
      } else {
        setLoginStep('VERIFICATION_SENT');
      }
    } catch (err) {
      console.error('Supabase Signup Error:', err);
      setErrorText(err.message || 'Signup failed. Please try again.');
      triggerShake();
      setLoginStep('SIGNUP');
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      setErrorText('Please enter your email address.');
      triggerShake();
      return;
    }
    setErrorText('');
    setLoginStep('LOADING');
    try {
      await sendPasswordResetEmail(email);
      setLoginStep('VERIFICATION_SENT');
    } catch (err) {
      setErrorText(err.message || 'Reset request failed. Please try again.');
      triggerShake();
      setLoginStep('FORGOT_PASSWORD');
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
            AL-QURAISH
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
            <Link 
              href={isSubpage ? "/#collection" : "#collection"} 
              className={styles.cta}
              onClick={(e) => handleNavClick(e, '#collection')}
            >
              Explore
            </Link>

            {/* Login Trigger/Profile Dropdown */}
            {user ? (
              <div ref={dropdownRef} className={styles.userMenuContainer}>
                <button 
                  className={styles.userTrigger}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className={styles.userName}>Account</span>
                  <ChevronDown size={12} className="text-gold" />
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
                className={styles.loginBtn}
                onClick={() => {
                  setAuthModalOpen(true);
                  setLoginStep('LOGIN');
                  setErrorText('');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setFullName('');
                  setShowSignInPassword(false);
                  setShowSignUpPassword(false);
                  setShowConfirmPassword(false);
                }}
              >
                Sign In
              </button>
            )}

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
            href={isSubpage ? "/#collection" : "#collection"}
            className={styles.mobileCta}
            onClick={(e) => handleNavClick(e, '#collection')}
          >
            Explore Collection
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
                      <span className={styles.inputLabel}>Email Address</span>
                      <div className={styles.emailInputWrapper}>
                        <input
                          type="email"
                          placeholder="name@domain.com"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setErrorText(''); }}
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
                          onClick={() => setLoginStep('FORGOT_PASSWORD')} 
                          className={styles.forgotPassBtn}
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className={styles.emailInputWrapper}>
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
                      <span className={styles.inputLabel}>Email Address</span>
                      <div className={styles.emailInputWrapper}>
                        <input
                          type="email"
                          placeholder="name@domain.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={styles.goldInput}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Password</span>
                      <span className={styles.helperText} style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', display: 'block', margin: '-4px 0 6px' }}>
                        Password must be at least 6 characters long.
                      </span>
                      <div className={styles.emailInputWrapper}>
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
                    <p className={styles.modalSubtitle}>Enter your registered email coordinates to recover your account</p>
                  </div>

                  <form onSubmit={handleForgotPasswordSubmit} className={styles.loginForm}>
                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Email Address</span>
                      <div className={styles.emailInputWrapper}>
                        <input
                          type="email"
                          placeholder="name@domain.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
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
                      Send Reset Link
                    </button>
                  </form>

                  <div className={styles.modalFooter}>
                    <button onClick={() => { setLoginStep('LOGIN'); setErrorText(''); }} className={styles.toggleStepBtn}>
                      ← Back to Login
                    </button>
                  </div>
                </div>
              )}

              {/* VERIFICATION SENT STEP */}
              {loginStep === 'VERIFICATION_SENT' && (
                <div>
                  <div className={styles.modalHeader}>
                    <div className={styles.goldSuccessIndicator}>
                      <svg width="64" height="64" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b6914" />
                            <stop offset="30%" stopColor="#c9a96e" />
                            <stop offset="50%" stopColor="#d4af37" />
                            <stop offset="70%" stopColor="#f5e6c8" />
                            <stop offset="100%" stopColor="#c9a96e" />
                          </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="url(#goldGrad2)" strokeWidth="2" opacity="0.3" />
                        <circle cx="50" cy="50" r="35" fill="none" stroke="url(#goldGrad2)" strokeWidth="2" />
                        <path 
                          d="M35 50 L45 60 L65 38" 
                          fill="none" 
                          stroke="url(#goldGrad2)" 
                          strokeWidth="3.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <h3 className={styles.modalTitle}>Verification Required</h3>
                    <p className={styles.modalSubtitle} style={{ color: 'var(--gold-light)', fontWeight: '500' }}>
                      We sent a secure verification link to:
                    </p>
                    <p className={styles.emailHighlighted}>{email}</p>
                    <p className={styles.modalSubtitle} style={{ marginTop: '12px' }}>
                      Please click the link inside the verification email to activate your account. You will not be able to place orders until verified.
                    </p>
                  </div>

                  <div className={styles.loginForm} style={{ marginTop: '12px', textAlign: 'center' }}>
                    <button onClick={() => { setLoginStep('LOGIN'); setErrorText(''); }} className={styles.submitBtn}>
                      Return to Sign In
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
                  <h4 className={styles.loadingMessage}>Connecting Securely</h4>
                  <p className={styles.modalSubtitle}>Authenticating with the Al-Quraish secure portal...</p>
                </div>
              )}

              {/* SUCCESS STEP */}
              {loginStep === 'SUCCESS' && (
                <div className={styles.successWrapper}>
                  <div className={styles.successIcon}>
                    <Check size={32} />
                  </div>
                  <h4 className={styles.successMessage}>Authenticated</h4>
                  <p className={styles.modalSubtitle}>Welcome to the inner circle of Al-Quraish.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
