'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  X,
  Check,
  ShieldAlert,
  Lock,
  ChevronLeft,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Navigation from '../../components/Navigation';
import Footer from '../../sections/Footer';
import ParticleField from '../../components/ParticleField';
import GlassCard from '../../components/GlassCard';
import styles from './page.module.css';

function ResetPasswordContent() {
  const router = useRouter();
  const [canReset, setCanReset] = useState(false);
  const [checking, setChecking] = useState(true);

  // Form states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [success, setSuccess] = useState(false);

  // Visibility States and Refs
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRef = useRef(null);
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

  useEffect(() => {
    // 1. Listen for PASSWORD_RECOVERY auth change events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event in reset-password:', event);
      if (event === 'PASSWORD_RECOVERY') {
        setCanReset(true);
      }
    });

    // 2. Check current session or hash params on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCanReset(true);
      } else if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
        // Token exists in hash fragment, client SDK will parse it shortly
        setCanReset(true);
      }
      setChecking(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const validatePassword = (pw) => {
    if (pw.length < 6) return 'Password must be at least 6 characters long.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorText('');

    if (!password || !confirmPassword) {
      setErrorText('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorText('Passwords do not match.');
      return;
    }

    const pwError = validatePassword(password);
    if (pwError) {
      setErrorText(pwError);
      return;
    }

    setLoading(true);
    try {
      // 3. Update the password for the recovery session
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);

      // 4. Sign out the recovery session to clear tokens and force fresh login
      await supabase.auth.signOut();

      // 5. Redirect back to home page with login modal open after 2 seconds
      setTimeout(() => {
        router.push('/?login=true');
      }, 2500);

    } catch (err) {
      setErrorText(err.message || 'Failed to update password. Recovery link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}>
          <div className={styles.doubleSpinner1}></div>
          <div className={styles.doubleSpinner2}></div>
        </div>
        <p className={styles.loadingText}>CHECKING RECOVERY TOKEN...</p>
      </div>
    );
  }

  // Access Denied State if no token found
  if (!canReset) {
    return (
      <div className={styles.deniedScreen}>
        <ParticleField
          particleCount={25}
          color="rgba(212, 175, 55, 0.1)"
          speed={0.05}
          maxSize={1.2}
        />
        <GlassCard className={styles.deniedCard}>
          <ShieldAlert size={48} className="text-gold" style={{ marginBottom: '20px' }} />
          <h2 className={styles.deniedTitle}>ACCESS DENIED</h2>
          <p className={styles.deniedText}>
            A valid password recovery session is required to access this portal. Please request a new recovery link from the Sign In modal on the homepage.
          </p>
          <Link href="/" className="btn-primary" style={{ marginTop: '24px' }}>
            <ChevronLeft size={16} /> Return to Homepage
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <title>Reset Password — AL-QURAISH</title>

      {/* Background Ambience removed in favor of global AtmosphericBackground */}

      <ParticleField
        particleCount={30}
        color="rgba(212, 175, 55, 0.15)"
        speed={0.1}
        maxSize={1.2}
      />

      <Navigation />

      <main className="container" style={{ paddingTop: '160px', paddingBottom: '100px', display: 'flex', justifyContent: 'center' }}>

        <GlassCard className={styles.formCard} hoverGlow={false}>
          {success ? (
            <div className={styles.successWrapper}>
              <div className={styles.successIcon}>
                <ShieldCheck size={36} className="text-gold" />
              </div>
              <h3 className={styles.successTitle}>Password Updated</h3>
              <p className={styles.successText}>
                Your new password has been successfully configured. Returning to the secure portal.
              </p>
              <div className={styles.redirectNotice}>
                Redirecting to secure login...
              </div>
            </div>
          ) : (
            <div>
              <div className={styles.formHeader}>
                {/* Gold Quraishi Heritage Emblem */}
                <svg width="48" height="48" viewBox="0 0 100 100" className={styles.luxuryEmblem}>
                  <defs>
                    <linearGradient id="goldGradReset" x1="0%" y1="0%" x2="100%" y2="100%">
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
                    stroke="url(#goldGradReset)"
                    strokeWidth="2"
                  />
                  <text
                    x="50"
                    y="58"
                    fontFamily="Playfair Display, Georgia, serif"
                    fontSize="26"
                    fontWeight="600"
                    fill="url(#goldGradReset)"
                    textAnchor="middle"
                  >
                    Q
                  </text>
                </svg>

                <h2 className={styles.formTitle}>Configure New Password</h2>
                <p className={styles.formSubtitle}>Set your secure access credentials for the Al-Quraish portal</p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <span className={styles.inputLabel}>New Password</span>
                  <span className={styles.helperText}>
                    Password must be at least 6 characters long.
                  </span>
                  <div className={styles.inputWrapper}>
                    <Lock size={16} className={styles.inputIcon} />
                    <input
                      ref={passwordRef}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.goldInput}
                      required
                    />
                    <button
                      type="button"
                      className={styles.visibilityToggle}
                      onClick={() => toggleVisibility(passwordRef, setShowPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <span className={styles.inputLabel}>Confirm Password</span>
                  <div className={styles.inputWrapper}>
                    <Lock size={16} className={styles.inputIcon} />
                    <input
                      ref={confirmPasswordRef}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <div className={styles.errorMessage}>
                    <ShieldAlert size={14} style={{ marginRight: '6px', flexShrink: 0 }} />
                    <span>{errorText}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '16px' }}
                  disabled={loading}
                >
                  {loading ? 'Saving credentials...' : 'Save Password'}
                </button>
              </form>
            </div>
          )}
        </GlassCard>

      </main>

      <Footer />
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  );
}
