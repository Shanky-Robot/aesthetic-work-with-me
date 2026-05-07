import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { BACKGROUND_VIDEOS } from '../data/backgroundVideos';

export const BackgroundScene: React.FC = () => {
  const { settings } = useSettings();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeVideo = BACKGROUND_VIDEOS.find(v => v.id === settings.backgroundVideoId) || BACKGROUND_VIDEOS[0];

  useEffect(() => {
    setVideoError(false);
    if (videoRef.current && !prefersReducedMotion) {
      videoRef.current.load();
      videoRef.current.play().catch(() => setVideoError(true));
    }
  }, [settings.backgroundVideoId, prefersReducedMotion]);

  const showVideo = !videoError && !prefersReducedMotion;

  const drops = Array.from({ length: 50 }).map((_, i) => (
    <div
      key={i}
      className="rain-drop"
      style={{
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 1 + 0.5}s`,
        animationDelay: `${Math.random() * 2}s`
      }}
    />
  ));

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-1000 bg-slate-900">
      {showVideo && (
        <video
          ref={videoRef}
          src={activeVideo.src}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-70"
          onError={() => {
            console.warn(`Failed to load background video: ${activeVideo.src}`);
            setVideoError(true);
          }}
        />
      )}

      {!showVideo && (
        <>
          {settings.theme === 'rainy' && (
            <div className="absolute inset-0 bg-slate-900 opacity-80 z-0">
              {!prefersReducedMotion && drops}
            </div>
          )}
          
          {settings.theme === 'sunny' && (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-amber-50 opacity-90 z-0"></div>
          )}

          {settings.theme === 'gradient' && (
            <div className={`absolute inset-0 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 bg-[length:200%_200%] opacity-80 z-0 ${!prefersReducedMotion ? 'animate-gradientShift' : ''}`}></div>
          )}
        </>
      )}

      <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />

      {videoError && (
        <div className="absolute bottom-4 left-4 z-50 text-[10px] bg-black/50 text-white px-2 py-1 rounded backdrop-blur-md">
          Video background unavailable. Using CSS fallback.
        </div>
      )}
    </div>
  );
};
