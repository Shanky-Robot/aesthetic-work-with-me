import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Youtube } from 'lucide-react';
import { TRACKS } from '../data/tracks';
import { useSettings } from '../context/SettingsContext';
import YouTube, { YouTubeProps } from 'react-youtube';

export const MusicPlayer: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    const idx = TRACKS.findIndex(t => t.id === settings.music.lastTrackId);
    return idx >= 0 ? idx : 0;
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ytTrackTitle, setYtTrackTitle] = useState<string>('YouTube Playlist');

  const isYouTubeMode = !!settings.music.selectedPlaylistId;
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    const vol = settings.music.volume;
    if (isYouTubeMode && ytPlayerRef.current) {
      ytPlayerRef.current.setVolume(vol * 100);
    } else if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  }, [settings.music.volume, isYouTubeMode]);

  useEffect(() => {
    if (!isYouTubeMode) {
      updateSettings({ music: { ...settings.music, lastTrackId: currentTrack.id } });
    }
  }, [currentTrack.id, isYouTubeMode, updateSettings, settings.music]);

  useEffect(() => {
    setIsPlaying(false);
    if (isYouTubeMode) {
      if (audioRef.current) audioRef.current.pause();
    } else {
      if (ytPlayerRef.current) ytPlayerRef.current.pauseVideo();
    }
  }, [isYouTubeMode]);

  const togglePlay = () => {
    if (isYouTubeMode) {
      if (!ytPlayerRef.current) return;
      if (isPlaying) ytPlayerRef.current.pauseVideo();
      else ytPlayerRef.current.playVideo();
    } else {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => setErrorMsg('Failed to play track. Audio missing?'));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    setErrorMsg(null);
    if (isYouTubeMode) {
      if (ytPlayerRef.current) ytPlayerRef.current.nextVideo();
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
      if (isPlaying && audioRef.current) {
        setTimeout(() => audioRef.current?.play().catch(() => setErrorMsg('Failed to play track.')), 50);
      }
    }
  };

  const playPrev = () => {
    setErrorMsg(null);
    if (isYouTubeMode) {
      if (ytPlayerRef.current) ytPlayerRef.current.previousVideo();
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
      if (isPlaying && audioRef.current) {
        setTimeout(() => audioRef.current?.play().catch(() => setErrorMsg('Failed to play track.')), 50);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    updateSettings({ music: { ...settings.music, volume: vol } });
  };

  const onYtReady: YouTubeProps['onReady'] = (event) => {
    ytPlayerRef.current = event.target;
    event.target.setVolume(settings.music.volume * 100);
  };

  const onYtStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (event.data === 1) {
      setIsPlaying(true);
      const data = event.target.getVideoData();
      if (data && data.title) setYtTrackTitle(data.title);
    } else if (event.data === 2) {
      setIsPlaying(false);
    }
  };

  /*
  const ytOpts: YouTubeProps['opts'] = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: autoPlay ? 1 : 0,
    },
  };
  */

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* YouTube Mini-Player */}
      {isYouTubeMode && settings.music.selectedPlaylistId && (
        <div className={`overflow-hidden rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 transform ${isPlaying ? 'scale-100 opacity-100' : 'scale-95 opacity-80'}`}>
          <YouTube 
            opts={{
              height: '180',
              width: '320',
              playerVars: {
                listType: 'playlist',
                list: settings.music.selectedPlaylistId || '',
                autoplay: 0,
                modestbranding: 1,
                controls: 0, // We use our own controls
              },
            }} 
            onReady={onYtReady} 
            onStateChange={onYtStateChange} 
            onError={() => setErrorMsg('YouTube playback error.')} 
          />
        </div>
      )}

      {!isYouTubeMode && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          onEnded={playNext}
          onError={() => { setErrorMsg('Track not found.'); setIsPlaying(false); }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Media Bar */}
      <div className="bg-white/10 backdrop-blur-2xl rounded-full px-8 py-3 border border-white/20 shadow-xl flex flex-wrap items-center justify-center gap-8">
        {/* Track Info (Minimal) */}
        <div className="flex flex-col items-center min-w-[120px] max-w-[200px]">
          <p className="text-xs font-semibold text-white truncate w-full text-center">
            {isYouTubeMode ? ytTrackTitle : currentTrack.title}
          </p>
          <div className="flex items-center gap-1 opacity-50">
            {isYouTubeMode ? <Youtube size={10} /> : <Music size={10} />}
            <span className="text-[10px] uppercase tracking-widest">
              {isYouTubeMode ? 'YouTube' : 'Local'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button onClick={playPrev} className="text-white/70 hover:text-white transition-colors" aria-label="Previous">
            <SkipBack size={20} />
          </button>
          <button 
            onClick={togglePlay} 
            className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
          </button>
          <button onClick={playNext} className="text-white/70 hover:text-white transition-colors" aria-label="Next">
            <SkipForward size={20} />
          </button>
        </div>

        {/* Volume & Error */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <Volume2 size={14} className="text-white/60" />
            <input
              type="range"
              min="0" max="1" step="0.01"
              value={settings.music.volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
              aria-label="Volume"
            />
          </div>
          {errorMsg && <p className="text-[9px] text-red-400 mt-1">{errorMsg}</p>}
        </div>
      </div>
    </div>
  );
};
