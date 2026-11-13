'use client';

import { useEffect, useRef } from 'react';

interface TurnstileWidgetProps {
  onToken: (token: string | null) => void;
  resetSignal?: number;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
          language?: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_ID = 'cf-turnstile-api-script';

export default function TurnstileWidget({ onToken, resetSignal = 0 }: TurnstileWidgetProps) {
  const siteKey = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '').trim();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbackRef = useRef(onToken);

  callbackRef.current = onToken;

  useEffect(() => {
    if (!siteKey) return;

    let cancelled = false;

    const mountWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'dark',
        size: 'flexible',
        language: 'tr',
        callback: (token) => callbackRef.current(token),
        'expired-callback': () => callbackRef.current(null),
        'error-callback': () => callbackRef.current(null),
      });
    };

    if (window.turnstile) {
      mountWidget();
    } else {
      let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      const onLoad = () => mountWidget();
      script.addEventListener('load', onLoad);
      const pollId = window.setInterval(() => {
        if (window.turnstile) {
          window.clearInterval(pollId);
          mountWidget();
        }
      }, 150);

      return () => {
        cancelled = true;
        window.clearInterval(pollId);
        script?.removeEventListener('load', onLoad);
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  useEffect(() => {
    if (!siteKey || !resetSignal) return;
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      callbackRef.current(null);
    }
  }, [resetSignal, siteKey]);

  if (!siteKey) return null;

  return (
    <div style={{ margin: '4px 0', display: 'flex', justifyContent: 'center' }}>
      <div ref={containerRef} />
    </div>
  );
}
