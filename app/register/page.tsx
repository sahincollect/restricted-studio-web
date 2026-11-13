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

    const cleanInput = identifier.trim();
    const isEmail = cleanInput.includes('@');

    if (!cleanInput) {
      setError('Lütfen kullanıcı adı veya e-posta giriniz.');
      setLoading(false);
      return;
    }

    if (!isEmail && cleanInput.length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalıdır.');
      setLoading(false);
      return;
    }

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
      const resolvedEmail = resolveLoginIdentifier(cleanInput);

      // 1. Önce sunucu API üzerinden doğrudan onaylı kayıt oluşturmayı dene
      let registeredViaApi = false;
      try {
        const apiRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: cleanInput, password }),
        });
        const apiData = await apiRes.json();
        if (apiRes.ok && apiData.success) {
          registeredViaApi = true;
        } else if (apiData.serviceRoleAvailable) {
          throw new Error(apiData.message || 'Kayıt oluşturulamadı.');
        }
      } catch (apiErr: any) {
        if (apiErr.message && !apiErr.message.includes('fetch')) {
          throw apiErr;
        }
      }

      // 2. Sunucuda service role anahtarı yoksa istemci signUp ile devam et
      if (!registeredViaApi) {
        const { data, error: authError } = await supabase.auth.signUp({
          email: resolvedEmail,
          password: password,
          options: {
            data: {
              username: cleanInput,
            },
          },
        });

        if (authError) {
          const msg = authError.message || '';
          if (msg.toLowerCase().includes('rate limit')) {
            throw new Error('E-posta gönderim limiti aşıldı. Lütfen birkaç dakika sonra tekrar deneyin veya hemen "Anonim Olarak Devam Et" seçeneğini kullanın.');
          }
          if (msg.toLowerCase().includes('already registered')) {
            throw new Error('Bu kullanıcı adı veya e-posta zaten kayıtlı. Lütfen giriş yapın.');
          }
          throw new Error(msg);
        }
      }

      // 3. Kayıt sonrası otomatik giriş yap
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password: password,
      });

      if (!signInErr && signInData?.session) {
        router.push('/dashboard');
        router.refresh();
      } else {
        router.push('/login?registered=1');
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
            <span className="brand-logo-shimmer">RESTRICTED STUDIO</span>
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
              placeholder="Örn: saintstudio veya ornek@domain.com"
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
