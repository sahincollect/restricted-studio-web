'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function ViceBackdrop() {
  const pathname = usePathname();
  const isStaticDark = pathname === '/login' || pathname === '/register';

  return (
    <div
      className={`vice-backdrop ${isStaticDark ? 'is-static-dark' : ''}`.trim()}
      aria-hidden="true"
    >
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
