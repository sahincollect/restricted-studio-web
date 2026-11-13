'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5); // Default %50 ses
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Audio element setup
    const audio = new Audio('/assets/restricted-studio.mp3');
    audio.loop = true;
    audio.volume = 0.5; // İstek doğrultusunda %50 ses seviyesi
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolume = () => {
      setIsMuted(audio.muted || audio.volume === 0);
      setVolume(audio.volume);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('volumechange', handleVolume);

    // Tarayıcı autoplay politikası gereği doğrudan başlatmayı dene
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
            // Tarayıcı otomatik çalmayı engellediyse (NotAllowedError),
            // kullanıcının sayfadaki ilk etkileşiminde (tıklama, kaydırma, tuş) başlat
            const unlockAudio = () => {
              if (audioRef.current && audioRef.current.paused) {
                audioRef.current.volume = 0.5;
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
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.volume = volume > 0 ? volume : 0.5;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (audioRef.current.muted || isMuted) {
      audioRef.current.muted = false;
      audioRef.current.volume = 0.5;
      setIsMuted(false);
      setVolume(0.5);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  if (!mounted) return null;

  return (
    <aside
      className="bg-music-pill"
      aria-label="Arka Plan Müziği"
      title="Restricted Studio Müziği (%50 Ses)"
    >
      {/* Equalizer Görsel Efekti */}
      <div className={`bg-music-eq ${isPlaying && !isMuted ? 'playing' : ''}`} aria-hidden="true">
        <span className="bg-music-eq-bar" style={{ height: isPlaying && !isMuted ? undefined : '3px' }}></span>
        <span className="bg-music-eq-bar" style={{ height: isPlaying && !isMuted ? undefined : '7px' }}></span>
        <span className="bg-music-eq-bar" style={{ height: isPlaying && !isMuted ? undefined : '4px' }}></span>
      </div>

      <span className="bg-music-title">Restricted Studio</span>

      <span className="bg-music-vol-badge" title="Ses Seviyesi">
        {isMuted ? 'Sessiz' : `%${Math.round(volume * 100)}`}
      </span>

      {/* Oynat / Duraklat Butonu */}
      <button
        type="button"
        onClick={togglePlay}
        className="bg-music-btn"
        title={isPlaying ? 'Müziği duraklat' : 'Müziği başlat'}
        aria-label={isPlaying ? 'Müziği duraklat' : 'Müziği başlat'}
      >
        {isPlaying ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      {/* Sessize Al / Aç Butonu */}
      <button
        type="button"
        onClick={toggleMute}
        className="bg-music-btn"
        title={isMuted ? 'Sesi aç' : 'Sesi kapat'}
        aria-label={isMuted ? 'Sesi aç' : 'Sesi kapat'}
      >
        {isMuted ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>
    </aside>
  );
}
