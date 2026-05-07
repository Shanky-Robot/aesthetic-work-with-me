import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { BACKGROUND_VIDEOS } from '../data/backgroundVideos';

interface BackgroundSceneProps {
  showDebugInfo?: boolean;
}

export const BackgroundScene: React.FC<BackgroundSceneProps> = ({ showDebugInfo = false }) => {
  const { settings } = useSettings();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoError, setIsVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeVideo = BACKGROUND_VIDEOS.find(v => v.id === settings.backgroundVideoId) || BACKGROUND_VIDEOS[0];

  useEffect(() => {
    setIsVideoReady(false);
    setIsVideoError(false);
  }, [settings.backgroundVideoId, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || isVideoError || !videoRef.current) {
      return;
    }

    videoRef.current.play().catch((error) => {
      // Some browsers can reject early play() calls before enough media is buffered.
      console.debug('Background video play() was deferred by the browser', error);
    });
  }, [activeVideo.src, prefersReducedMotion, isVideoError]);

  const showVideo = !prefersReducedMotion && !isVideoError;
  const showUnavailableMessage = !prefersReducedMotion && isVideoError;

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
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-1000 bg-slate-900">
      <div className="absolute inset-0 z-0">
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
      </div>

      {showVideo && (
        <video
          key={activeVideo.src}
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover z-[1] opacity-70"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => {
            setIsVideoReady(true);
            setIsVideoError(false);
          }}
          onError={(e) => {
            console.error('Background video failed to load', e);
            setIsVideoError(true);
            setIsVideoReady(false);
          }}
        >
          <source src={activeVideo.src} type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-0 bg-black/25 z-[2] pointer-events-none" />

      {showUnavailableMessage && (
        <div className="absolute bottom-4 left-4 z-50 text-[10px] bg-black/40 text-white px-2 py-1 rounded backdrop-blur-md">
          Video background unavailable.
        </div>
      )}

      {showDebugInfo && !prefersReducedMotion && (
        <div className="absolute bottom-4 right-4 z-50 text-[10px] bg-black/40 text-white px-2 py-1 rounded backdrop-blur-md">
          {`ready:${isVideoReady ? 'yes' : 'no'} error:${isVideoError ? 'yes' : 'no'} src:${activeVideo.src}`}
        </div>
      )}
    </div>
  );
};
