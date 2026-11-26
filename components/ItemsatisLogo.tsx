'use client';

import React from 'react';
import Image from 'next/image';

interface ItemsatisLogoProps {
  variant?: 'full' | 'icon' | 'white-svg' | 'badge';
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ItemsatisLogo({
  variant = 'full',
  width,
  height,
  className = '',
  style = {},
}: ItemsatisLogoProps) {
  const numericWidth = typeof width === 'number' ? width : Number.parseInt(String(width || ''), 10);
  const numericHeight = typeof height === 'number' ? height : Number.parseInt(String(height || ''), 10);

  if (variant === 'icon') {
    const w = Number.isFinite(numericWidth) && numericWidth > 0 ? numericWidth : 24;
    const h = Number.isFinite(numericHeight) && numericHeight > 0 ? numericHeight : 24;
    return (
      <Image
        src="/assets/itemsatis-icon.png"
        alt="İtemsatış"
        width={w}
        height={h}
        sizes={`${Math.max(w, 24)}px`}
        className={`itemsatis-brand-icon ${className}`}
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          borderRadius: '6px',
          objectFit: 'contain',
          ...style,
        }}
      />
    );
  }

  if (variant === 'badge') {
    return (
      <span
        className={`itemsatis-verified-badge ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 8px',
          background: '#111115',
          border: '1px solid rgba(249, 115, 22, 0.5)',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#F0F0F0',
          ...style,
        }}
      >
        <Image
          src="/assets/itemsatis-icon.png"
          alt=""
          width={14}
          height={14}
          sizes="14px"
          style={{ borderRadius: '3px' }}
        />
        <span>İtemsatış Resmi Mağaza</span>
      </span>
    );
  }

  if (variant === 'white-svg') {
    return (
      <img
        src="/assets/itemsatis-logo.svg"
        alt="İtemsatış"
        width={width || 90}
        height={height || 18}
        className={`itemsatis-brand-svg ${className}`}
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          objectFit: 'contain',
          ...style,
        }}
      />
    );
  }

  const fullW = Number.isFinite(numericWidth) && numericWidth > 0 ? numericWidth : 110;
  const fullH = Number.isFinite(numericHeight) && numericHeight > 0 ? numericHeight : 24;
  return (
    <Image
      src="/assets/itemsatis-logo.png"
      alt="İtemsatış"
      width={fullW}
      height={fullH}
      sizes={`${fullW}px`}
      className={`itemsatis-brand-logo ${className}`}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        objectFit: 'contain',
        ...style,
      }}
    />
  );
}
