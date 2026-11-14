'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from './I18nProvider';
import { isSupportedLocale, type Locale } from '@/lib/i18n';
import { INTERACTIVE_I18N } from '@/lib/interactive-i18n';

interface MinimalCatalogEntry {
  id: string;
  title: string;
  category: string;
}

const KONAMI_SEQUENCE = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a',
];

export default function ConsoleEasterEgg() {
  const { locale, setLocale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const ui = INTERACTIVE_I18N[locale].showcase.f8;

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [logs, setLogs] = useState<string[]>([
    '[RS-F8] Restricted Studio Developer Surface v3.4',
    '[HINT] Komutlar: help | resmon | pacman | godmode | lang <tr|en|ru|fr> | status',
  ]);
  const [catalogCache, setCatalogCache] = useState<MinimalCatalogEntry[] | null>(null);
  const [overdriveToast, setOverdriveToast] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const konamiIdxRef = useRef(0);

  const triggerOverdrive = useCallback(() => {
    window.dispatchEvent(new CustomEvent('rs:overdrive', { detail: { active: true } }));
    document.documentElement.dataset.rsOverdrive = 'crimson';
    setOverdriveToast(true);
    window.setTimeout(() => setOverdriveToast(false), 4000);
  }, []);

  const launchArcade = useCallback(() => {
    setIsOpen(false);
    if (pathname === '/') {
      window.dispatchEvent(
        new CustomEvent('rs:showcase-mode', { detail: { tab: 'arcade', takeControl: true } })
      );
    } else {
      router.push('/');
    }
  }, [pathname, router]);

  // Lazy load catalog entries only when user actually opens the F8 console
  useEffect(() => {
    if (!isOpen) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 20);
    if (!catalogCache) {
      import('@/lib/catalog-data.json')
        .then((mod) => {
          const raw = (mod.default || []) as MinimalCatalogEntry[];
          setCatalogCache(raw);
        })
        .catch(() => {
          setCatalogCache([]);
        });
    }
    return () => window.clearTimeout(id);
  }, [isOpen, catalogCache]);

  // Global keyboard shortcuts: F8 / Ctrl+K / Escape / Konami + CustomEvents + DevTools API
  useEffect(() => {
    const win = window as unknown as {
      __rsBannerLogged?: boolean;
      rs?: Record<string, unknown>;
    };

    if (!win.__rsBannerLogged) {
      win.__rsBannerLogged = true;
      console.log(
        '%c RESTRICTED STUDIO %c NOIR CORE v3.4 · 0% ESCROW ',
        'background:#A50000;color:#F0F0F0;font-weight:800;padding:4px 8px;border:1px solid #F0F0F0;',
        'background:#080808;color:#E8E5DE;font-weight:700;padding:4px 8px;border:1px solid #A50000;'
      );
      console.log(
        '%c[EASTER EGG]%c Gizli komutlar için konsola %crs.help()%c yaz veya sayfada %cF8%c tuşuna bas.',
        'color:#A50000;font-weight:700;',
        'color:#A1A1AA;',
        'color:#F0F0F0;background:#18181b;padding:1px 5px;border:1px solid #3f3f46;',
        'color:#A1A1AA;',
        'color:#F0F0F0;background:#18181b;padding:1px 5px;border:1px solid #3f3f46;',
        'color:#A1A1AA;'
      );
    }

    win.rs = {
      help: () => {
        console.table({
          'rs.f8()': 'Site içi FiveM F8 komut konsolunu açar',
          'rs.pacman()': 'Triadic Noir PAC-RUN oyununu başlatır',
          'rs.godmode()': 'Monolit Overdrive + Pac-Run ölümsüzlük modunu açar',
          'rs.noclip()': 'Kızıl ızgara + Monolit hız modunu açar',
          'rs.status()': 'Canlı sistem sağlığını (/api/health) sorgular',
          'rs.pack()': '15+ Paket %50 indirim bilgisini gösterir',
        });
        return 'Restricted Studio DevTools API hazır.';
      },
      f8: () => {
        setIsOpen(true);
        return '[RS-F8] Açıldı.';
      },
      pacman: () => {
        launchArcade();
        return '[PAC-RUN] Oyuncu kontrolü aktifleştirildi.';
      },
      godmode: () => {
        triggerOverdrive();
        return '[GODMODE] 0.00ms Overdrive aktif. Hayaletler savunmasız!';
      },
      noclip: () => {
        triggerOverdrive();
        return '[NOCLIP] Monolit wireframe overdrive tetiklendi.';
      },
      matrix: () => {
        triggerOverdrive();
        return '[NOIR-MATRIX] Kızıl sinyal taraması başlatıldı.';
      },
      pack: () => {
        console.info(
          '%c15+ Paket Sepetinde %50 İndirim Aktif! %chttps://www.restrictedstudio.shop/katalog',
          'color:#F0F0F0;background:#8B0000;padding:2px 6px;font-weight:700;',
          'color:#E8E5DE;'
        );
        return '100 TL / adet · 16+ sepette 50 TL / adet';
      },
      status: async () => {
        try {
          const res = await fetch('/api/health', { cache: 'no-store' });
          const data = await res.json();
          console.table(data.services || data);
          return data.overall || 'checked';
        } catch (err) {
          return String(err);
        }
      },
    };

    const onOpenConsole = () => setIsOpen(true);

    const onKeyDown = (e: KeyboardEvent) => {
      // Konami sequence detection (passive across page)
      const lowerKey = e.key.toLowerCase();
      if (lowerKey === KONAMI_SEQUENCE[konamiIdxRef.current]) {
        konamiIdxRef.current++;
        if (konamiIdxRef.current >= KONAMI_SEQUENCE.length) {
          konamiIdxRef.current = 0;
          triggerOverdrive();
          setLogs((prev) => [
            ...prev.slice(-8),
            '> [KONAMI] ↑↑↓↓←→←→BA · GODMODE UNLOCKED',
          ]);
        }
      } else {
        konamiIdxRef.current = lowerKey === KONAMI_SEQUENCE[0] ? 1 : 0;
      }

      // Open F8 console via F8 or Ctrl/Cmd + K
      if (e.key === 'F8' || ((e.ctrlKey || e.metaKey) && lowerKey === 'k')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('rs:open-console', onOpenConsole);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('rs:open-console', onOpenConsole);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, launchArcade, triggerOverdrive]);

  // Live catalog search matches inside F8 modal
  const quickMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !catalogCache || q.startsWith('/')) return [];
    const exactCmds = new Set(['help', 'resmon', 'pacman', 'arcade', 'godmode', 'noclip', 'matrix', 'clear', 'status', 'featured', 'popular']);
    if (exactCmds.has(q) || q.startsWith('lang ')) return [];

    const cleanQ = q.startsWith('find ') ? q.slice(5).trim() : q.startsWith('ara ') ? q.slice(4).trim() : q;
    if (cleanQ.length < 2) return [];

    const out: MinimalCatalogEntry[] = [];
    for (const item of catalogCache) {
      if (
        item.title.toLowerCase().includes(cleanQ) ||
        item.id.toLowerCase() === cleanQ
      ) {
        out.push(item);
        if (out.length >= 6) break;
      }
    }
    return out;
  }, [query, catalogCache]);

  const executeCommand = async (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;
    const cmd = trimmed.toLowerCase();
    setQuery('');

    if (cmd === 'clear') {
      setLogs([]);
      return;
    }

    if (cmd === 'help') {
      setLogs((prev) => [
        ...prev.slice(-10),
        '> help:',
        '  pacman / arcade   -> Sağ ekrandaki Pac-Run modunu başlatır',
        '  godmode / noclip  -> 3D Monolit overdrive & Pac-Run ölümsüzlük',
        '  resmon            -> Çekirdek performans izi gösterir',
        '  status            -> /api/health canlı sistem kontrolü yapar',
        '  popular           -> En çok tıklanan katalog öğelerine gider',
        '  lang tr|en|ru|fr  -> Dil değiştirir',
        '  clear             -> Ekranı temizler',
      ]);
      return;
    }

    if (cmd === 'resmon') {
      setLogs((prev) => [
        ...prev.slice(-10),
        '> resmon trace:',
        '  [restricted_core]   cpu: 0.00ms | mem: 4.1MB | escrow: NONE',
        '  [bridge_framework]  qbox/qb/esx synced in 0.02ms',
        '  [mlo_occlusion]     60.0 FPS locked',
      ]);
      return;
    }

    if (cmd === 'pacman' || cmd === 'arcade') {
      setLogs((prev) => [...prev.slice(-10), '> [ARCADE] Launching PAC-RUN...']);
      launchArcade();
      return;
    }

    if (cmd === 'godmode' || cmd === 'noclip' || cmd === 'matrix') {
      triggerOverdrive();
      setLogs((prev) => [
        ...prev.slice(-10),
        `> [${cmd.toUpperCase()}] Triadic Crimson Overdrive aktif!`,
      ]);
      return;
    }

    if (cmd === 'popular' || cmd === 'featured') {
      setIsOpen(false);
      router.push(`/katalog?view=${cmd === 'popular' ? 'popular' : 'featured'}`);
      return;
    }

    if (cmd.startsWith('lang ')) {
      const target = cmd.slice(5).trim();
      if (isSupportedLocale(target)) {
        setLocale(target as Locale);
        setLogs((prev) => [...prev.slice(-10), `> [I18N] Locale -> ${target.toUpperCase()}`]);
      } else {
        setLogs((prev) => [...prev.slice(-10), '> [ERR] Geçerli diller: tr, en, ru, fr']);
      }
      return;
    }

    if (cmd === 'status') {
      setLogs((prev) => [...prev.slice(-10), '> [PING] Checking /api/health...']);
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        const json = await res.json();
        setLogs((prev) => [
          ...prev.slice(-10),
          `> [HEALTH] overall=${json.overall || 'ok'} | latency=${json.latencyMs ?? '-'}ms`,
        ]);
      } catch {
        setLogs((prev) => [...prev.slice(-10), '> [ERR] Health endpoint unreachable']);
      }
      return;
    }

    const searchWord = cmd.startsWith('find ')
      ? trimmed.slice(5).trim()
      : cmd.startsWith('ara ')
      ? trimmed.slice(4).trim()
      : trimmed;

    setIsOpen(false);
    router.push(`/katalog?q=${encodeURIComponent(searchWord)}`);
  };

  return (
    <>
      {overdriveToast && (
        <div className="rs-overdrive-hud" role="status">
          <span className="roh-dot" />
          <span>{ui.godmodeToast}</span>
        </div>
      )}

      {isOpen && (
        <div
          className="rs-f8-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={ui.title}
          onClick={() => setIsOpen(false)}
        >
          <div className="rs-f8-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rs-f8-head">
              <div className="rs-f8-title-wrap">
                <span className="rs-f8-dot" />
                <span className="rs-f8-title">{ui.title}</span>
              </div>
              <button
                type="button"
                className="rs-f8-close"
                onClick={() => setIsOpen(false)}
              >
                {ui.close}
              </button>
            </div>

            <form
              className="rs-f8-input-row"
              onSubmit={(e) => {
                e.preventDefault();
                executeCommand(query);
              }}
            >
              <span className="rs-f8-caret">&gt;_</span>
              <input
                ref={inputRef}
                type="text"
                className="rs-f8-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={ui.placeholder}
              />
            </form>

            {quickMatches.length > 0 && (
              <div className="rs-f8-results">
                {quickMatches.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="rs-f8-result-item"
                    onClick={() => {
                      setIsOpen(false);
                      router.push(`/katalog?q=${encodeURIComponent(m.title)}`);
                    }}
                  >
                    <span className="rs-f8-res-id">{m.id}</span>
                    <span className="rs-f8-res-title">{m.title}</span>
                    <span className="rs-f8-res-cat">{m.category}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="rs-f8-log-box">
              {logs.map((line, idx) => (
                <div key={idx} className="rs-f8-log-line">
                  {line}
                </div>
              ))}
            </div>

            <div className="rs-f8-foot">
              <span>{ui.helpHint}</span>
              <div className="rs-f8-quick-cmds">
                <button type="button" onClick={() => executeCommand('pacman')}>
                  pacman
                </button>
                <button type="button" onClick={() => executeCommand('godmode')}>
                  godmode
                </button>
                <button type="button" onClick={() => executeCommand('popular')}>
                  popular
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
