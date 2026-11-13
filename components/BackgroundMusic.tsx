'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5); // %50 default
  const [minimized, setMinimized] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const savedVol = localStorage.getItem('rs_music_volume');
      if (savedVol !== null) {
        const v = parseFloat(savedVol);
        if (!isNaN(v) && v >= 0 && v <= 1) {
          setVolume(v);
        }
      }
      const savedMin = localStorage.getItem('rs_music_minimized');
      if (savedMin === 'true') {
        setMinimized(true);
      }
    } catch {
      // ignore
    }

    const audio = new Audio('/assets/restricted-studio.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolume = () => {
      setIsMuted(audio.muted || audio.volume === 0);
      setVolume(audio.volume);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const handleLoadedMetadata = () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('volumechange', handleVolume);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Autoplay attempt
    const startPlayback = () => {
      if (!audioRef.current) return;
      audioRef.current.volume = 0.5;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // First user interaction unlock
            const unlockAudio = () => {
              if (audioRef.current && audioRef.current.paused) {
                audioRef.current.volume = volume > 0 ? volume : 0.5;
                audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
              }
              removeUnlockListeners();
            };

            const removeUnlockListeners = () => {
              window.removeEventListener('click', unlockAudio);
              window.removeEventListener('keydown', unlockAudio);
              window.removeEventListener('touchstart', unlockAudio);
              window.removeEventListener('scroll', unlockAudio);
            };

            window.addEventListener('click', unlockAudio, { once: true, passive: true });
            window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
            window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
            window.addEventListener('scroll', unlockAudio, { once: true, passive: true });
          });
      }
    };

    startPlayback();

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('volumechange', handleVolume);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.volume = isMuted ? 0 : (volume > 0 ? volume : 0.5);
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!audioRef.current) return;
    if (audioRef.current.muted || isMuted || volume === 0) {
      const targetVol = volume > 0 ? volume : 0.5;
      audioRef.current.muted = false;
      audioRef.current.volume = targetVol;
      setIsMuted(false);
      setVolume(targetVol);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const newVol = Math.max(0, Math.min(1, val / 100));
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      if (newVol > 0) {
        audioRef.current.muted = false;
        setIsMuted(false);
      } else {
        setIsMuted(true);
      }
    }
    try {
      localStorage.setItem('rs_music_volume', String(newVol));
    } catch {
      // ignore
    }
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('rs_music_minimized', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pos * duration;
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!mounted) return null;

  const currentPercent = isMuted ? 0 : Math.round(volume * 100);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <aside
      className={`rs-music-dock ${minimized ? 'is-minimized' : 'is-expanded'} ${isPlaying ? 'is-playing' : ''}`}
      aria-label="Restricted Studio Müzik Çalar"
    >
      {/* ===================================================================
           MINIMIZED COMPACT PILL
           =================================================================== */}
      {minimized ? (
        <div
          className="music-mini-pill"
          onClick={() => setMinimized(false)}
          title="Müzik Çaları Genişlet (Tıkla)"
          role="button"
          tabIndex={0}
        >
          {/* Animated Vinyl Thumbnail */}
          <div className="music-mini-disc-wrap">
            <img
              src="/assets/rslogo.jpg"
              alt=""
              className={`music-mini-disc ${isPlaying ? 'spinning' : ''}`}
            />
            <span className="music-mini-santa-hat" aria-hidden="true" />
          </div>

          <div className="music-mini-info">
            <span className="music-mini-title">Restricted Studio</span>
            <span className="music-mini-status">
              {isPlaying ? (
                <>
                  <span className="mini-eq-dot"></span>
                  Çalıyor · %{currentPercent}
                </>
              ) : (
                'Duraklatıldı'
              )}
            </span>
          </div>

          {/* Quick Play/Pause */}
          <button
            type="button"
            className="music-mini-quick-btn"
            onClick={togglePlay}
            title={isPlaying ? 'Duraklat' : 'Çal'}
            aria-label={isPlaying ? 'Duraklat' : 'Çal'}
          >
            {isPlaying ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          {/* Expand Chevron */}
          <button
            type="button"
            className="music-mini-expand-btn"
            onClick={toggleMinimize}
            title="Genişlet"
            aria-label="Genişlet"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
        </div>
      ) : (
        /* ===================================================================
           EXPANDED MODERN STUDIO PLAYER
           =================================================================== */
        <div className="music-expanded-player">
          {/* Top Bar with festive badge and minimize */}
          <div className="music-player-top">
            <div className="music-player-brand-tag">
              <span className="music-sparkle-dot"></span>
              <span>🎄 Kış &amp; Yılbaşı Sürümü · Studio Engine</span>
            </div>
            <button
              type="button"
              className="music-ctrl-icon-btn music-minimize-btn"
              onClick={toggleMinimize}
              title="Müzik Çaları Küçült"
              aria-label="Müzik Çaları Küçült"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {/* Main Controls Row */}
          <div className="music-player-main-row">
            {/* Spinning Disc Cover with Festive Santa Hat */}
            <div className="music-cover-container" onClick={togglePlay} title="Çal / Duraklat">
              <div className={`music-vinyl-cover ${isPlaying ? 'spinning' : ''}`}>
                <img src="/assets/rslogo.jpg" alt="Restricted Studio Album" className="music-cover-img" />
                <div className="music-vinyl-hole"></div>
              </div>
              <span className="music-cover-santa-hat" aria-hidden="true" />
            </div>

            {/* Track Info & Equalizer */}
            <div className="music-meta-wrap">
              <div className="music-track-title-row">
                <span className="music-track-title">Restricted Studio</span>
                <span className="music-track-badge">Official Theme</span>
              </div>

              {/* 5-Bar Animated Equalizer */}
              <div className={`music-eq-strip ${isPlaying && !isMuted && volume > 0 ? 'is-active' : ''}`} aria-hidden="true">
                <span className="music-eq-bar b1"></span>
                <span className="music-eq-bar b2"></span>
                <span className="music-eq-bar b3"></span>
                <span className="music-eq-bar b4"></span>
                <span className="music-eq-bar b5"></span>
              </div>
            </div>

            {/* Play/Pause Main Button */}
            <button
              type="button"
              className={`music-primary-play-btn ${isPlaying ? 'playing' : ''}`}
              onClick={togglePlay}
              title={isPlaying ? 'Müziği Duraklat' : 'Müziği Başlat'}
              aria-label={isPlaying ? 'Müziği Duraklat' : 'Müziği Başlat'}
            >
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1.5" />
                  <rect x="14" y="4" width="4" height="16" rx="1.5" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>
          </div>

          {/* Interactive Progress Bar */}
          <div className="music-progress-wrapper" onClick={handleSeek} title="İlerleme çubuğunda atla">
            <div className="music-progress-track">
              <div className="music-progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="music-progress-times">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume Controls Row */}
          <div className="music-volume-row">
            {/* Mute/Unmute Toggle */}
            <button
              type="button"
              className="music-ctrl-icon-btn music-mute-btn"
              onClick={toggleMute}
              title={isMuted || currentPercent === 0 ? 'Sesi Aç' : 'Sesi Kapat'}
              aria-label={isMuted || currentPercent === 0 ? 'Sesi Aç' : 'Sesi Kapat'}
            >
              {isMuted || currentPercent === 0 ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </button>

            {/* Slider */}
            <div className="music-slider-container">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={currentPercent}
                onChange={handleVolumeChange}
                className="music-volume-range"
                aria-label="Ses Seviyesi Kaydırıcısı"
              />
            </div>

            {/* Volume Percentage Badge */}
            <span className="music-volume-badge" title="Mevcut Ses Seviyesi">
              %{currentPercent}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
