'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function ViceBackdrop() {
  const pathname = usePathname() || '/';
  const isGtaViRoute = pathname.toLowerCase().startsWith('/gtavi');
  const isStaticDark = pathname === '/login' || pathname === '/register';

  if (isGtaViRoute) {
    return (
      <div className="vice-backdrop is-gtavi-theme" aria-hidden="true">
        <img
          src="/assets/vice-backdrop.jpg"
          alt=""
          className="vice-art-img"
          loading="eager"
          decoding="async"
        />
        <div className="vice-art-scrim" />
        <div className="vice-horizon-glow" />
      </div>
    );
  }

  return (
    <div
      className={`vetra-backdrop ${isStaticDark ? 'is-static-dark' : ''}`.trim()}
      aria-hidden="true"
    >
      <div className="vetra-vertical-ribs" />
      <div className="vetra-ambient-top" />
    </div>
  );
}
