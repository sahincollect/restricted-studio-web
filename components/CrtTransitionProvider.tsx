'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';

export type CrtTransitionPhase = 'idle' | 'closing' | 'blackout' | 'opening';

interface CrtTransitionContextValue {
  phase: CrtTransitionPhase;
  navigateWithCrt: (href: string) => void;
}

const CrtTransitionContext = createContext<CrtTransitionContextValue>({
  phase: 'idle',
  navigateWithCrt: () => {},
});

export function useCrtTransition() {
  return useContext(CrtTransitionContext);
}

const CLOSE_MS = 560;
const BLACKOUT_NAV_MS = 60;
const OPEN_SETTLE_MS = 70;
const OPEN_MS = 580;

export default function CrtTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<CrtTransitionPhase>('idle');
  const [scrollSnapshotY, setScrollSnapshotY] = useState(0);

  const phaseRef = useRef<CrtTransitionPhase>('idle');
  const targetPathRef = useRef<string | null>(null);
  const timersRef = useRef<number[]>([]);
  const scrollInnerRef = useRef<HTMLDivElement | null>(null);

  const clearAllTimers = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  const setPhaseSync = useCallback((next: CrtTransitionPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimers();
      document.documentElement.classList.remove('is-crt-animating');
    };
  }, [clearAllTimers]);

  useLayoutEffect(() => {
    const inner = scrollInnerRef.current;
    if (!inner) return;
    if (phase === 'closing' && scrollSnapshotY > 0) {
      inner.style.setProperty('--crt-scroll-y', `-${scrollSnapshotY}px`);
    } else {
      inner.style.removeProperty('--crt-scroll-y');
    }
  }, [phase, scrollSnapshotY]);

  useEffect(() => {
    if (phase !== 'blackout') return;
    const expectedPath = targetPathRef.current;
    if (!expectedPath || pathname !== expectedPath) return;

    clearAllTimers();
    const openTimer = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      setPhaseSync('opening');

      const finishTimer = window.setTimeout(() => {
        targetPathRef.current = null;
        document.documentElement.classList.remove('is-crt-animating');
        setPhaseSync('idle');
      }, OPEN_MS);
      timersRef.current.push(finishTimer);
    }, OPEN_SETTLE_MS);

    timersRef.current.push(openTimer);
  }, [pathname, phase, clearAllTimers, setPhaseSync]);

  const navigateWithCrt = useCallback(
    (href: string) => {
      const normalizedPath = href.split('#')[0].split('?')[0] || '/';
      if (normalizedPath === pathname) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (phaseRef.current !== 'idle') return;

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        router.push(href);
        return;
      }

      clearAllTimers();
      router.prefetch(normalizedPath);

      setScrollSnapshotY(Math.round(window.scrollY || 0));
      targetPathRef.current = normalizedPath;
      document.documentElement.classList.add('is-crt-animating');
      setPhaseSync('closing');

      const closeTimer = window.setTimeout(() => {
        setPhaseSync('blackout');

        const navTimer = window.setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
          router.push(href);
        }, BLACKOUT_NAV_MS);
        timersRef.current.push(navTimer);
      }, CLOSE_MS);

      const fallbackTimer = window.setTimeout(() => {
        if (phaseRef.current === 'idle') return;
        targetPathRef.current = null;
        document.documentElement.classList.remove('is-crt-animating');
        setPhaseSync('idle');
      }, 3600);

      timersRef.current.push(closeTimer, fallbackTimer);
    },
    [pathname, router, clearAllTimers, setPhaseSync]
  );

  return (
    <CrtTransitionContext.Provider value={{ phase, navigateWithCrt }}>
      {phase !== 'idle' && (
        <div
          className={`crt-tube-backdrop crt-tube-backdrop--${phase}`}
          aria-hidden="true"
        />
      )}

      <div className={`crt-screen-shell crt-screen-shell--${phase}`}>
        <div ref={scrollInnerRef} className="crt-screen-inner">
          {children}
        </div>
      </div>

      {phase !== 'idle' && (
        <div
          className={`crt-phosphor-overlay crt-phosphor-overlay--${phase}`}
          aria-hidden="true"
        >
          <span className="crt-phosphor-line" />
          <span className="crt-phosphor-dot" />
        </div>
      )}
    </CrtTransitionContext.Provider>
  );
}
