'use client';

import React from 'react';
import Image from 'next/image';

interface ShopierLogoProps {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function ShopierLogo({
  width = 18,
  height = 18,
  className = '',
  style = {},
}: ShopierLogoProps) {
  return (
    <Image
      src="/assets/shopier-icon.png"
      alt="Shopier"
      width={width}
      height={height}
      sizes={`${Math.max(width, 18)}px`}
      className={`shopier-brand-icon ${className}`}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        borderRadius: '5px',
        objectFit: 'contain',
        border: '1px solid rgba(255,255,255,0.28)',
        ...style,
      }}
    />
  );
}
