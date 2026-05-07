import React, { useState } from 'react';
import { Settings, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useVoiceAnnouncements } from '../hooks/useVoiceAnnouncements';
import { Theme } from '../types/settings';
import { useGoogleLogin } from '@react-oauth/google';
import { useYouTubePlaylists } from '../hooks/useYouTubePlaylists';
import { BACKGROUND_VIDEOS } from '../data/backgroundVideos';

const THEMES: { id: Theme; name: string }[] = [
  { id: 'gradient', name: 'Soft Gradient' },
  { id: 'rainy', name: 'Rainy City at Night' },
  { id: 'sunny', name: 'Sunny Minimal Workspace' },
];

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { voices, isSupported, speak } = useVoiceAnnouncements();
  const [isOpen, setIsOpen] = useState(false);

  const [expandedSection, setExpandedSection] = useState<'timer' | 'voice' | 'theme' | 'youtube' | null>('timer');

  const toggleSection = (section: 'timer' | 'voice' | 'theme' | 'youtube') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      updateSettings({ music: { ...settings.music, youtubeToken: tokenResponse.access_token } });
    },
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
  });

  const { playlists, loading, error } = useYouTubePlaylists(settings.music.youtubeToken);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 p-4 rounded-full bg-surface/80 backdrop-blur border border-white/20 shadow-lg text-primary hover:bg-white/90 transition-all z-50"
        aria-label="Open Settings"
      >
        <Settings size={24} />
      </button>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-surface/95 backdrop-blur-xl border-l border-white/20 shadow-2xl z-50 flex flex-col transition-transform">
      <div className="p-6 border-b border-white/20 flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Settings size={20} /> Settings
        </h2>
        <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-black/5" aria-label="Close Settings">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Timer Settings */}
        <section className="bg-white/40 rounded-xl overflow-hidden border border-white/30">
          <button
            onClick={() => toggleSection('timer')}
            className="w-full p-4 flex justify-between items-center font-medium hover:bg-white/20 transition-colors"
            aria-expanded={expandedSection === 'timer'}
          >
            Timer Configuration
            {expandedSection === 'timer' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSection === 'timer' && (
            <div className="p-4 pt-0 space-y-4 text-sm">
              <label className="block">
                <span className="block opacity-80 mb-1">Focus Duration (min)</span>
                <input
                  type="number"
                  min="1" max="120"
                  value={settings.timer.focusDuration}
                  onChange={(e) => updateSettings({ timer: { ...settings.timer, focusDuration: Number(e.target.value) } })}
                  className="w-full p-2 rounded-lg bg-white/50 border border-white/40 focus:ring-2 focus:ring-accent/50 outline-none"
                />
              </label>
              <label className="block">
                <span className="block opacity-80 mb-1">Short Break (min)</span>
                <input
                  type="number"
                  min="1" max="30"
                  value={settings.timer.shortBreakDuration}
                  onChange={(e) => updateSettings({ timer: { ...settings.timer, shortBreakDuration: Number(e.target.value) } })}
                  className="w-full p-2 rounded-lg bg-white/50 border border-white/40 focus:ring-2 focus:ring-accent/50 outline-none"
                />
              </label>
              <label className="block">
                <span className="block opacity-80 mb-1">Long Break (min)</span>
                <input
                  type="number"
                  min="1" max="60"
                  value={settings.timer.longBreakDuration}
                  onChange={(e) => updateSettings({ timer: { ...settings.timer, longBreakDuration: Number(e.target.value) } })}
                  className="w-full p-2 rounded-lg bg-white/50 border border-white/40 focus:ring-2 focus:ring-accent/50 outline-none"
                />
              </label>
              <label className="flex items-center space-x-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.timer.autoStartNext}
                  onChange={(e) => updateSettings({ timer: { ...settings.timer, autoStartNext: e.target.checked } })}
                  className="rounded text-accent focus:ring-accent w-4 h-4"
                />
                <span className="opacity-90">Auto-start next session</span>
              </label>
            </div>
          )}
        </section>

        {/* Theme Settings */}
        <section className="bg-white/40 rounded-xl overflow-hidden border border-white/30">
          <button
            onClick={() => toggleSection('theme')}
            className="w-full p-4 flex justify-between items-center font-medium hover:bg-white/20 transition-colors"
            aria-expanded={expandedSection === 'theme'}
          >
            Appearance
            {expandedSection === 'theme' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSection === 'theme' && (
            <div className="p-4 pt-0 space-y-4">
              <div>
                <span className="block opacity-80 mb-2 text-xs uppercase font-semibold tracking-wider">Background Video (Muted)</span>
                <div className="space-y-2">
                  {BACKGROUND_VIDEOS.map((video) => (
                    <label key={video.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/40 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="video"
                        value={video.id}
                        checked={settings.backgroundVideoId === video.id}
                        onChange={() => updateSettings({ backgroundVideoId: video.id })}
                        className="text-accent focus:ring-accent w-4 h-4"
                      />
                      <span>{video.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="pt-2 border-t border-white/20">
                <span className="block opacity-80 mb-2 text-xs uppercase font-semibold tracking-wider">Fallback CSS Theme</span>
                <div className="space-y-2">
                  {THEMES.map((theme) => (
                    <label key={theme.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/40 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="theme"
                        value={theme.id}
                        checked={settings.theme === theme.id}
                        onChange={() => updateSettings({ theme: theme.id })}
                        className="text-accent focus:ring-accent w-4 h-4"
                      />
                      <span>{theme.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Voice Settings */}
        <section className="bg-white/40 rounded-xl overflow-hidden border border-white/30">
          <button
            onClick={() => toggleSection('voice')}
            className="w-full p-4 flex justify-between items-center font-medium hover:bg-white/20 transition-colors"
            aria-expanded={expandedSection === 'voice'}
          >
            Voice Announcements
            {expandedSection === 'voice' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSection === 'voice' && (
            <div className="p-4 pt-0 space-y-4 text-sm">
              {!isSupported ? (
                <div className="text-red-500 bg-red-50/50 p-3 rounded-lg border border-red-100">
                  Voice announcements are not supported in this browser.
                </div>
              ) : (
                <>
                  <label className="flex items-center space-x-2 cursor-pointer border-b border-white/20 pb-3">
                    <input
                      type="checkbox"
                      checked={settings.voice.enabled}
                      onChange={(e) => updateSettings({ voice: { ...settings.voice, enabled: e.target.checked } })}
                      className="rounded text-accent focus:ring-accent w-4 h-4"
                    />
                    <span className="font-medium">Enable Voice Announcements</span>
                  </label>

                  <div className={`space-y-4 transition-opacity ${!settings.voice.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <label className="block">
                      <span className="block opacity-80 mb-1">Voice Selection</span>
                      <select
                        value={settings.voice.voiceURI || ''}
                        onChange={(e) => updateSettings({ voice: { ...settings.voice, voiceURI: e.target.value } })}
                        className="w-full p-2 rounded-lg bg-white/50 border border-white/40 focus:ring-2 focus:ring-accent/50 outline-none"
                      >
                        {voices.map((v) => (
                          <option key={v.voiceURI} value={v.voiceURI}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="flex justify-between opacity-80 mb-1">
                        <span>Volume</span>
                        <span>{Math.round(settings.voice.volume * 100)}%</span>
                      </span>
                      <input
                        type="range"
                        min="0" max="1" step="0.1"
                        value={settings.voice.volume}
                        onChange={(e) => updateSettings({ voice: { ...settings.voice, volume: parseFloat(e.target.value) } })}
                        className="w-full accent-accent"
                      />
                    </label>

                    <label className="block">
                      <span className="flex justify-between opacity-80 mb-1">
                        <span>Speech Rate</span>
                        <span>{settings.voice.rate.toFixed(1)}x</span>
                      </span>
                      <input
                        type="range"
                        min="0.5" max="1.5" step="0.1"
                        value={settings.voice.rate}
                        onChange={(e) => updateSettings({ voice: { ...settings.voice, rate: parseFloat(e.target.value) } })}
                        className="w-full accent-accent"
                      />
                    </label>

                    <button
                      onClick={() => speak('This is a test of the selected voice.')}
                      className="w-full p-2 mt-2 rounded-lg bg-white/20 hover:bg-white/30 text-primary font-medium border border-white/30 transition-colors"
                    >
                      Test Voice
                    </button>

                    <div className="pt-4 border-t border-white/20 mt-4 space-y-4">
                      <span className="block opacity-80 mb-2 text-xs uppercase font-semibold tracking-wider">Clock Announcements</span>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.clock.announceTime}
                          onChange={(e) => updateSettings({ clock: { ...settings.clock, announceTime: e.target.checked } })}
                          className="rounded text-accent focus:ring-accent w-4 h-4"
                        />
                        <span className="opacity-90">Announce current time aloud</span>
                      </label>
                      <label className={`block transition-opacity ${!settings.clock.announceTime ? 'opacity-50 pointer-events-none' : ''}`}>
                        <span className="block opacity-80 mb-1">Interval</span>
                        <select
                          value={settings.clock.announceIntervalMinutes}
                          onChange={(e) => updateSettings({ clock: { ...settings.clock, announceIntervalMinutes: parseInt(e.target.value) as any } })}
                          className="w-full p-2 rounded-lg bg-white/50 border border-white/40 focus:ring-2 focus:ring-accent/50 outline-none"
                        >
                          <option value="10">Every 10 minutes</option>
                          <option value="15">Every 15 minutes</option>
                          <option value="30">Every 30 minutes</option>
                          <option value="60">Every hour</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* YouTube Settings */}
        <section className="bg-white/40 rounded-xl overflow-hidden border border-white/30">
          <button
            onClick={() => toggleSection('youtube')}
            className="w-full p-4 flex justify-between items-center font-medium hover:bg-white/20 transition-colors"
            aria-expanded={expandedSection === 'youtube'}
          >
            YouTube Music
            {expandedSection === 'youtube' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSection === 'youtube' && (
            <div className="p-4 pt-0 space-y-4 text-sm">
              <label className="block mt-3">
                <span className="block opacity-80 mb-1">Select Playlist</span>
                <select
                  value={settings.music.selectedPlaylistId || 'LOCAL'}
                  onChange={(e) => updateSettings({ music: { ...settings.music, selectedPlaylistId: e.target.value === 'LOCAL' ? null : e.target.value } })}
                  className="w-full p-2 rounded-lg bg-white/50 border border-white/40 focus:ring-2 focus:ring-accent/50 outline-none"
                >
                  <option value="LOCAL">-- None (Use Local Music) --</option>
                  <option value="RD1g9F8WPpwg8">Default Lofi Mix</option>
                  {playlists.map(pl => (
                    <option key={pl.id} value={pl.id}>{pl.title}</option>
                  ))}
                </select>
              </label>

              {!settings.music.youtubeToken ? (
                <div className="pt-2 border-t border-white/20">
                  <p className="opacity-70 mb-3 text-xs">Sign in to fetch your saved YouTube playlists.</p>
                  <button
                    onClick={() => login()}
                    className="w-full p-2 rounded-lg bg-red-500 text-white font-medium shadow hover:bg-red-600 transition-colors"
                  >
                    Sign in with Google
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-white/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-green-600">Connected to YouTube</span>
                    <button
                      onClick={() => updateSettings({ music: { ...settings.music, youtubeToken: null } })}
                      className="text-xs text-primary/60 hover:text-primary underline"
                    >
                      Sign Out
                    </button>
                  </div>
                  {loading && <p className="opacity-70 text-xs">Loading playlists...</p>}
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
