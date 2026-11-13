'use client';

import React, { useState, useEffect } from 'react';

export default function ChristmasTree() {
  const [mounted, setMounted] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [sparkleActive, setSparkleActive] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('rs_holiday_tree');
      if (saved === 'minimized') {
        setMinimized(true);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('rs_holiday_tree', next ? 'minimized' : 'expanded');
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const handleTreeClick = () => {
    setSparkleActive(true);
    setShowMessage(true);
    setTimeout(() => setSparkleActive(false), 1200);
    setTimeout(() => setShowMessage(false), 3500);
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
          <span className="holiday-mini-label">Yılbaşı</span>
        </button>
      ) : (
        /* Full Festive Christmas Tree */
        <div className="holiday-tree-container" onClick={handleTreeClick}>
          {/* Festive Click Speech Bubble Message */}
          {showMessage && (
            <div className="holiday-speech-bubble" role="status">
              <span>🎄 <strong>Restricted Studio</strong> ailesi olarak mutlu ve başarılı bir yeni yıl dileriz! 🎁</span>
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

          {/* SVG Tree Asset */}
          <div className="holiday-tree-graphic">
            <img
              src="/assets/christmas-tree.svg"
              alt="Restricted Studio Yılbaşı Ağacı"
              className="holiday-tree-img"
              draggable="false"
            />
          </div>

          {/* Festive Subtle Base Ground / Snow Shadow */}
          <div className="holiday-tree-base-glow" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
