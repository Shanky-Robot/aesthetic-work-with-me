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

  const ytOpts: YouTubeProps['opts'] = {
    height: '0',
    width: '0',
    playerVars: {
      listType: 'playlist',
      list: settings.music.selectedPlaylistId || '',
      autoplay: 0,
    },
  };

  return (
    <section className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          {isYouTubeMode ? <Youtube size={20} className="text-red-500" /> : <Music size={20} />} 
          {isYouTubeMode ? 'YouTube Music' : 'Local Music'}
        </h3>
      </div>

      <div className="text-center mb-4">
        <p className="font-medium text-primary truncate">
          {isYouTubeMode ? ytTrackTitle : currentTrack.title}
        </p>
        <p className="text-xs opacity-70 truncate">
          {isYouTubeMode ? 'YouTube Playlist' : currentTrack.artist}
        </p>
        {errorMsg && <p className="text-xs text-red-500 mt-1">{errorMsg}</p>}
      </div>

      {!isYouTubeMode && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          onEnded={playNext}
          onError={() => { setErrorMsg('Track not found. Place audio in public/audio/'); setIsPlaying(false); }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
      
      {isYouTubeMode && settings.music.selectedPlaylistId && (
        <div className="hidden">
          <YouTube opts={ytOpts} onReady={onYtReady} onStateChange={onYtStateChange} onError={() => setErrorMsg('YouTube playback error.')} />
        </div>
      )}

      <div className="flex items-center justify-center space-x-4 mb-4">
        <button onClick={playPrev} className="p-2 rounded-full hover:bg-white/50 transition-colors" aria-label="Previous Track">
          <SkipBack size={20} />
        </button>
        <button onClick={togglePlay} className="p-3 rounded-full bg-accent text-white shadow-md hover:bg-accent/90 transition-colors" aria-label={isPlaying ? 'Pause Music' : 'Play Music'}>
          {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
        </button>
        <button onClick={playNext} className="p-2 rounded-full hover:bg-white/50 transition-colors" aria-label="Next Track">
          <SkipForward size={20} />
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <Volume2 size={16} className="opacity-60" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={settings.music.volume}
          onChange={handleVolumeChange}
          className="w-full h-2 bg-slate-700/60 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent [&::-webkit-slider-thumb]:rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent/80 transition-shadow min-w-[100px]"
          aria-label="Music volume"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(settings.music.volume * 100)}
        />
      </div>

      {!isYouTubeMode && (
        <div className="mt-4 pt-4 border-t border-white/20 max-h-32 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-wider opacity-50 mb-2 font-semibold">Playlist</p>
          <ul className="space-y-1">
            {TRACKS.map((track, idx) => (
              <li key={track.id}>
                <button
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    if (isPlaying) {
                      setTimeout(() => audioRef.current?.play(), 50);
                    }
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                    idx === currentTrackIndex ? 'bg-white/60 font-medium' : 'hover:bg-white/30 opacity-80'
                  }`}
                >
                  {track.title}
                </button>
              </li>
            ))}
          </ul>
          <p className="text-[9px] opacity-40 mt-3 text-center">Music sourced from CC / YouTube Audio Library</p>
        </div>
      )}
    </section>
  );
};
