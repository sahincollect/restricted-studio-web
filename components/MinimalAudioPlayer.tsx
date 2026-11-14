'use client';

import React, { useEffect, useRef, useState } from 'react';

const AUDIO_SRC = '/assets/audio/chasing-shadows.mp3';
const DEFAULT_VOLUME = 0.5; // %50 ses yüksekliği

export default function MinimalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userPausedRef = useRef<boolean>(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = DEFAULT_VOLUME;
    audio.loop = true;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    // Try immediate autoplay at 50% volume; if browser blocks, start on first user gesture
    audio.play().catch(() => {
      const unlockAudio = () => {
        if (!userPausedRef.current && audio.paused) {
          audio.volume = DEFAULT_VOLUME;
          audio.play().catch(() => {});
        }
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
      window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
    });

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = DEFAULT_VOLUME;

    if (audio.paused) {
      userPausedRef.current = false;
      audio.play().catch(() => {});
    } else {
      userPausedRef.current = true;
      audio.pause();
    }
  };

  return (
    <div className="rs-minimal-audio-wrap">
      <audio ref={audioRef} src={AUDIO_SRC} preload="auto" loop />
      <button
        type="button"
        onClick={togglePlay}
        className={`rs-minimal-audio-btn ${isPlaying ? 'is-playing' : ''}`}
        aria-label={isPlaying ? 'Müziği Durdur (Chasing Shadows)' : 'Müziği Başlat (Chasing Shadows)'}
        title={
          isPlaying
            ? 'Durdur · gelowler - Chasing Shadows (%50)'
            : 'Başlat · gelowler - Chasing Shadows (%50)'
        }
      >
        {isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="4" width="4.5" height="16" rx="1.2" />
            <rect x="13.5" y="4" width="4.5" height="16" rx="1.2" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7.5 4.8v14.4a1 1 0 0 0 1.54.84l11.2-7.2a1 1 0 0 0 0-1.68L9.04 3.96A1 1 0 0 0 7.5 4.8z" />
          </svg>
        )}
        <span className="rs-eq-bars" aria-hidden="true">
          <i className="rs-eq-bar rs-eq-1" />
          <i className="rs-eq-bar rs-eq-2" />
          <i className="rs-eq-bar rs-eq-3" />
          <i className="rs-eq-bar rs-eq-4" />
        </span>
      </button>
    </div>
  );
}
