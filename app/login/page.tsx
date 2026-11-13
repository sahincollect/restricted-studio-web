'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientSupabase, resolveLoginIdentifier, resolveLegacyLoginIdentifier } from '@/lib/supabase';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [anonLoading, setAnonLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientSupabase();

  const handleAnonContinue = async () => {
    setAnonLoading(true);
    setError(null);
    try {
      let creds: { email: string; password: string } | null = null;
      const saved = typeof window !== 'undefined' ? localStorage.getItem('rs_anon_creds') : null;
      if (saved) {
        try {
          creds = JSON.parse(saved);
        } catch {
          creds = null;
        }
      }

      if (creds?.email && creds?.password) {
        const { data: existingAuth, error: existingErr } = await supabase.auth.signInWithPassword({
          email: creds.email,
          password: creds.password,
        });
        if (!existingErr && existingAuth?.user) {
          router.push('/dashboard');
          router.refresh();
          return;
        }
      }

      const res = await fetch('/api/auth/anonymous', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Anonim oturum başlatılamadı.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('rs_anon_creds', JSON.stringify({ email: data.email, password: data.password }));
      }

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInErr) throw new Error(signInErr.message);

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Anonim giriş sırasında bir hata oluştu.');
    } finally {
      setAnonLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const resolvedEmail = resolveLoginIdentifier(identifier);
      let { data, error: authError } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password: password,
      });

      // Eski @restrictedstudio.local hesapları için geriye dönük uyumluluk kontrolü
      if (authError && !identifier.includes('@')) {
        const legacyEmail = resolveLegacyLoginIdentifier(identifier);
        if (legacyEmail) {
          const legacyAttempt = await supabase.auth.signInWithPassword({
            email: legacyEmail,
            password: password,
          });
          if (!legacyAttempt.error && legacyAttempt.data?.user) {
            data = legacyAttempt.data;
            authError = null;
          }
        }
      }

      if (authError) {
        throw new Error(
          authError.message === 'Invalid login credentials'
            ? 'Kullanıcı adı/e-posta veya şifre hatalı.'
            : authError.message
        );
      }

      if (data?.user) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Link href="/" style={styles.brandLink}>
            <span style={styles.brandDot}></span>
            RESTRICTED STUDIO
          </Link>
          <h1 style={styles.title}>Müşteri Girişi</h1>
          <p style={styles.subtitle}>R-AI lisans yönetimi ve dosya indirmeleri için hesabınıza giriş yapın.</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>KULLANICI ADI VEYA E-POSTA</label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Restricted veya ornek@domain.com"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>ŞİFRE</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading || anonLoading} style={styles.button}>
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(240,240,240,0.22)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(240,240,240,0.56)', letterSpacing: '0.08em' }}>VEYA KAYITSIZ</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(240,240,240,0.22)' }} />
        </div>

        <button
          type="button"
          onClick={handleAnonContinue}
          disabled={loading || anonLoading}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: '0px',
            backgroundColor: '#0e0e0e',
            border: '1.5px solid rgba(240, 240, 240, 0.42)',
            color: '#F0F0F0',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A50000" strokeWidth="2.2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>{anonLoading ? 'Anonim Oturum Açılıyor...' : 'Anonim Olarak Devam Et'}</span>
        </button>

        <div style={styles.footer}>
          <span>İsteğe bağlı hesap oluşturmak için:</span>{' '}
          <Link href="/register" style={styles.link}>
            Kayıt Olun
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: '#080808',
    backgroundImage:
      'var(--grain-svg), radial-gradient(rgba(240, 240, 240, 0.08) 1px, transparent 1px), linear-gradient(155deg, #080808 0%, #080808 58%, #450000 84%, #8B0000 100%)',
    backgroundSize: '160px 160px, 5px 5px, 100% 100%',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#080808',
    border: '2px solid #F0F0F0',
    borderRadius: '0px',
    padding: '36px 32px',
    boxShadow: '7px 7px 0 #A50000',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  brandLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    color: 'rgba(240, 240, 240, 0.8)',
    textDecoration: 'none',
    marginBottom: '16px',
  },
  brandDot: {
    width: '8px',
    height: '8px',
    borderRadius: '0px',
    backgroundColor: '#A50000',
    border: '1px solid #F0F0F0',
  },
  title: {
    fontSize: '26px',
    fontWeight: 800,
    color: '#F0F0F0',
    letterSpacing: '-0.02em',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '13px',
    color: 'rgba(240, 240, 240, 0.68)',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'rgba(240, 240, 240, 0.78)',
    letterSpacing: '0.06em',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '0px',
    backgroundColor: '#0e0e0e',
    border: '1.5px solid rgba(240, 240, 240, 0.3)',
    color: '#F0F0F0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  button: {
    marginTop: '6px',
    padding: '13px',
    borderRadius: '0px',
    backgroundColor: '#A50000',
    color: '#F0F0F0',
    fontSize: '14px',
    fontWeight: 700,
    border: '1.5px solid #F0F0F0',
    cursor: 'pointer',
    boxShadow: '4px 4px 0 #8B0000',
    transition: 'all 0.15s',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#450000',
    border: '1.5px solid #F0F0F0',
    color: '#F0F0F0',
    padding: '10px 14px',
    borderRadius: '0px',
    fontSize: '13px',
    marginBottom: '18px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '13px',
    color: 'rgba(240, 240, 240, 0.65)',
  },
  link: {
    color: '#F0F0F0',
    textDecoration: 'underline',
    fontWeight: 700,
  },
};
