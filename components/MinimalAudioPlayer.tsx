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
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5.14v13.72a1 1 0 0 0 1.55.83l10.29-6.86a1 1 0 0 0 0-1.66L9.55 4.31A1 1 0 0 0 8 5.14z" />
          </svg>
        )}
        <span className="rs-eq-bars" aria-hidden="true">
          <i className="rs-eq-bar rs-eq-1" />
          <i className="rs-eq-bar rs-eq-2" />
          <i className="rs-eq-bar rs-eq-3" />
        </span>
      </button>

      <style jsx>{`
        .rs-minimal-audio-wrap {
          position: fixed;
          left: 18px;
          bottom: 18px;
          z-index: 90;
        }
        .rs-minimal-audio-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 32px;
          padding: 0 11px;
          border-radius: 999px;
          background: rgba(10, 11, 16, 0.86);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: rgba(240, 242, 248, 0.78);
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.65);
          transition:
            border-color 0.16s ease,
            background-color 0.16s ease,
            color 0.16s ease,
            box-shadow 0.16s ease;
        }
        .rs-minimal-audio-btn:hover {
          background: rgba(18, 12, 16, 0.94);
          border-color: rgba(224, 27, 36, 0.55);
          color: #ffffff;
          box-shadow:
            0 0 14px rgba(224, 27, 36, 0.25),
            0 6px 18px rgba(0, 0, 0, 0.8);
        }
        .rs-minimal-audio-btn.is-playing {
          border-color: rgba(224, 27, 36, 0.48);
          color: #f4f6fb;
        }
        .rs-eq-bars {
          display: inline-flex;
          align-items: flex-end;
          gap: 2px;
          height: 10px;
        }
        .rs-eq-bar {
          display: block;
          width: 2px;
          height: 3px;
          border-radius: 1px;
          background: rgba(240, 242, 248, 0.42);
          transition: height 0.18s ease, background-color 0.18s ease;
        }
        .rs-minimal-audio-btn.is-playing .rs-eq-bar {
          background: #e01b24;
          animation: rsEqBounce 0.85s ease-in-out infinite alternate;
        }
        .rs-minimal-audio-btn.is-playing .rs-eq-1 {
          animation-duration: 0.62s;
        }
        .rs-minimal-audio-btn.is-playing .rs-eq-2 {
          animation-duration: 0.48s;
          animation-delay: 0.15s;
        }
        .rs-minimal-audio-btn.is-playing .rs-eq-3 {
          animation-duration: 0.74s;
          animation-delay: 0.28s;
        }
        @keyframes rsEqBounce {
          0% {
            height: 3px;
          }
          100% {
            height: 10px;
          }
        }
      `}</style>
    </div>
  );
}
