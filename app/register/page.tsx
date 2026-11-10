'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientSupabase, resolveLoginIdentifier } from '@/lib/supabase';

export default function RegisterPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      setLoading(false);
      return;
    }

    if (password !== passwordConfirm) {
      setError('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      setLoading(false);
      return;
    }

    try {
      const resolvedEmail = resolveLoginIdentifier(identifier);
      const { data, error: authError } = await supabase.auth.signUp({
        email: resolvedEmail,
        password: password,
        options: {
          data: {
            username: identifier.trim(),
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (data?.user) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Kayıt işlemi sırasında bir hata oluştu.');
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
          <h1 style={styles.title}>Hesap Oluştur</h1>
          <p style={styles.subtitle}>İtemsatış kodlarınızı aktive etmek ve R-AI kullanmak için kaydolun.</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>KULLANICI ADI VEYA E-POSTA</label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Kullanıcı adı veya ornek@domain.com"
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
              placeholder="En az 6 karakter"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>ŞİFRE TEKRAR</label>
            <input
              type="password"
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading || anonLoading} style={styles.button}>
            {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#52525b', letterSpacing: '0.08em' }}>VEYA KAYITSIZ</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
        </div>

        <button
          type="button"
          onClick={handleAnonContinue}
          disabled={loading || anonLoading}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            color: '#f4f4f5',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>{anonLoading ? 'Anonim Oturum Açılıyor...' : 'Anonim Olarak Devam Et'}</span>
        </button>

        <div style={styles.footer}>
          <span>Zaten hesabınız var mı?</span>{' '}
          <Link href="/login" style={styles.link}>
            Giriş Yapın
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
    backgroundColor: '#08080b',
    backgroundImage:
      'radial-gradient(circle at 50% 20%, rgba(254, 0, 0, 0.12) 0%, transparent 50%), repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 20px)',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: 'rgba(14, 15, 22, 0.92)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '36px 32px',
    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(254, 0, 0, 0.08)',
    backdropFilter: 'blur(20px)',
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
    color: '#94a3b8',
    textDecoration: 'none',
    marginBottom: '16px',
  },
  brandDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#fe0000',
    boxShadow: '0 0 10px #fe0000',
  },
  title: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.02em',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#71717a',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#a1a1aa',
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    marginTop: '6px',
    padding: '13px',
    borderRadius: '10px',
    backgroundColor: '#fe0000',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(254, 0, 0, 0.35)',
    transition: 'all 0.2s',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '18px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '13px',
    color: '#71717a',
  },
  link: {
    color: '#ff4d4d',
    textDecoration: 'none',
    fontWeight: 600,
  },
};
