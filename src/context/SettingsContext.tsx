import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, SettingsContextType } from '../types/settings';

const DEFAULT_SETTINGS: AppSettings = {
  appMode: 'pomodoro',
  theme: 'gradient',
  backgroundVideoId: 'rainy-city',
  timer: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    autoStartNext: false,
  },
  voice: {
    enabled: true,
    voiceURI: null,
    volume: 1.0,
    rate: 1.0,
    intervalReminderEnabled: false,
    intervalReminderMinutes: 5,
  },
  music: {
    volume: 0.5,
    autoPlay: false,
    lastTrackId: null,
    youtubeToken: null,
    selectedPlaylistId: 'RD1g9F8WPpwg8',
  },
  weather: {
    city: 'London',
  },
  clock: {
    announceTime: false,
    announceIntervalMinutes: 15,
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('pomodoroSettings');
      if (saved) {
        // Deep merge could be better, but spread is ok for shallow nested if we are careful
        const parsed = JSON.parse(saved);
        return {
          appMode: parsed.appMode ?? DEFAULT_SETTINGS.appMode,
          theme: parsed.theme ?? DEFAULT_SETTINGS.theme,
          backgroundVideoId: parsed.backgroundVideoId ?? DEFAULT_SETTINGS.backgroundVideoId,
          timer: { ...DEFAULT_SETTINGS.timer, ...parsed.timer },
          voice: { ...DEFAULT_SETTINGS.voice, ...parsed.voice },
          music: { 
            ...DEFAULT_SETTINGS.music, 
            ...parsed.music,
            selectedPlaylistId: parsed.music?.selectedPlaylistId === null ? 'RD1g9F8WPpwg8' : (parsed.music?.selectedPlaylistId ?? 'RD1g9F8WPpwg8')
          },
          weather: { ...DEFAULT_SETTINGS.weather, ...parsed.weather },
          clock: { ...DEFAULT_SETTINGS.clock, ...parsed.clock },
        };
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    document.body.className = `theme-${settings.theme}`;
  }, [settings]);

  const updateSettings = React.useCallback((newSettings: Partial<AppSettings> | ((prev: AppSettings) => Partial<AppSettings>)) => {
    setSettings((prev) => {
      const update = typeof newSettings === 'function' ? newSettings(prev) : newSettings;
      return { ...prev, ...update };
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
