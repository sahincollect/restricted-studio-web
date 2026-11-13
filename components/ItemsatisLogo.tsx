'use client';

import React from 'react';

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
  if (variant === 'icon') {
    return (
      <img
        src="/assets/itemsatis-icon.png"
        alt="İtemsatış"
        width={width || 24}
        height={height || 24}
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
          background: 'rgba(72, 133, 190, 0.15)',
          border: '1px solid rgba(72, 133, 190, 0.4)',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#38bdf8',
          ...style,
        }}
      >
        <img
          src="/assets/itemsatis-icon.png"
          alt=""
          width={14}
          height={14}
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

  // Default 'full' variant: official transparent lockup (emblem + text)
  return (
    <img
      src="/assets/itemsatis-logo.png"
      alt="İtemsatış"
      width={width || 110}
      height={height || 24}
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
