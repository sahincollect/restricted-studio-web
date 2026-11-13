'use client';

import React, { useState, useEffect } from 'react';

export default function ChristmasTree() {
  const [mounted, setMounted] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [sparkleActive, setSparkleActive] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [lightsActive, setLightsActive] = useState(true);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('rs_holiday_tree');
      if (saved === 'minimized') {
        setMinimized(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('rs_holiday_tree', next ? 'minimized' : 'expanded');
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleTreeClick = () => {
    setSparkleActive(true);
    setShowMessage(true);
    setTimeout(() => setSparkleActive(false), 1500);
    setTimeout(() => setShowMessage(false), 4500);
  };

  if (!mounted) return null;

  return (
    <div
      className={`holiday-tree-wrapper ${minimized ? 'minimized' : ''}`}
      aria-label="Yılbaşı Ağacı ve Süslemeleri"
    >
      {/* Minimized Mini Tree Pill */}
      {minimized ? (
        <button
          type="button"
          onClick={toggleMinimize}
          className="holiday-tree-mini-btn"
          title="Yılbaşı Ağacını Göster"
          aria-label="Yılbaşı Ağacını Göster"
        >
          <span className="holiday-mini-emoji">🎄</span>
          <span className="holiday-mini-label">Yılbaşı Ağacı</span>
        </button>
      ) : (
        /* Full Festive Christmas Tree */
        <div className="holiday-tree-container" onClick={handleTreeClick}>
          {/* Festive Click Speech Bubble Message */}
          {showMessage && (
            <div className="holiday-speech-bubble" role="status">
              <span>🎄 <strong>Restricted Studio</strong> ailesi olarak mutlu ve bereketli bir yeni yıl dileriz! 🎁</span>
              <small style={{ display: 'block', marginTop: '4px', opacity: 0.85, fontSize: '11px', color: '#67e8f9' }}>
                15+ Paket Seçimlerinde %50 İndirim Aktif!
              </small>
            </div>
          )}

          {/* Sparkles effect container */}
          {sparkleActive && (
            <div className="holiday-sparkles" aria-hidden="true">
              <span className="sparkle s1">✨</span>
              <span className="sparkle s2">⭐</span>
              <span className="sparkle s3">❄️</span>
              <span className="sparkle s4">✨</span>
              <span className="sparkle s5">🎁</span>
              <span className="sparkle s6">🔔</span>
            </div>
          )}

          {/* Minimize / Close Button */}
          <button
            type="button"
            onClick={toggleMinimize}
            className="holiday-tree-close-btn"
            title="Ağacı Küçült"
            aria-label="Ağacı Küçült"
          >
            ×
          </button>

          {/* SVG Tree Asset with Dynamic Twinkling Garlands */}
          <div className="holiday-tree-graphic">
            <img
              src="/assets/christmas-tree.svg"
              alt="Restricted Studio Yılbaşı Ağacı"
              className="holiday-tree-img"
              draggable="false"
            />

            {/* Twinkling Fairy Lights Garland Overlay */}
            {lightsActive && (
              <div className="tree-fairy-lights" aria-hidden="true">
                <span className="light l1"></span>
                <span className="light l2"></span>
                <span className="light l3"></span>
                <span className="light l4"></span>
                <span className="light l5"></span>
                <span className="light l6"></span>
                <span className="light l7"></span>
                <span className="light l8"></span>
              </div>
            )}
          </div>

          {/* Gift boxes under the tree */}
          <div className="tree-presents-row" aria-hidden="true">
            <span className="tree-present p1" title="Yeni Yıl Hediyesi">🎁</span>
            <span className="tree-present p2" title="Özel İndirim">🎁</span>
          </div>

          {/* Festive Subtle Base Ground / Snow Shadow */}
          <div className="holiday-tree-base-glow" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
