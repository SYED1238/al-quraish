'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, User, Lock, AlertTriangle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import ParticleField from '../../components/ParticleField';
import Navigation from '../../components/Navigation';
import Footer from '../../sections/Footer';
import styles from './page.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to /admin directly
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('admin_session') === 'true') {
      router.push('/admin');
    }
  }, [router]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Short artificial loading delay for secure premium feel
    setTimeout(() => {
      if (username === 'hussainumair' && password === '654321') {
        localStorage.setItem('admin_session', 'true');
        router.push('/admin');
      } else {
        setError('Invalid administrative credentials. Access denied.');
        setIsSubmitting(false);
      }
    }, 1200);
  };

  return (
    <div className={styles.pageWrapper}>
      <title>Admin Portal Sign-In — AL-QURAISH</title>

      <ParticleField
        particleCount={25}
        color="rgba(212, 175, 55, 0.1)"
        speed={0.08}
        maxSize={1.2}
      />

      <Navigation />

      <main className="container" style={{ paddingTop: '160px', paddingBottom: '80px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <GlassCard className={styles.loginCard} hoverGlow={false}>
          <div className={styles.iconFrame}>
            <Shield size={36} className="text-gold" />
          </div>
          <h2 className={styles.loginTitle}>ADMIN SECURE ROUTE</h2>
          <p className={styles.loginDesc}>Provide authorized credentials to access order routing systems.</p>

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <span className={styles.inputLabel}>Admin Username</span>
              <div className={styles.inputContainer}>
                <User size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.goldInput}
                  required
                  id="admin-username-input"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <span className={styles.inputLabel}>Access Password</span>
              <div className={styles.inputContainer}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.goldInput}
                  required
                  id="admin-password-input"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {error && (
              <div className={styles.errorBanner}>
                <AlertTriangle size={14} className={styles.errorIcon} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '24px', padding: '16px 20px' }}
              disabled={isSubmitting}
              id="admin-login-submit"
            >
              {isSubmitting ? 'Verifying Credentials...' : 'Authenticate'}
            </button>
          </form>
        </GlassCard>
      </main>

      <Footer />
    </div>
  );
}
