export type Theme = 'rainy' | 'sunny' | 'gradient';
export type AppMode = 'pomodoro' | 'clock';
export type AnnounceIntervalMinutes = 10 | 15 | 30 | 60;

export interface TimerSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  autoStartNext: boolean;
}

export interface VoiceSettings {
  enabled: boolean;
  voiceURI: string | null;
  volume: number;
  rate: number;
  intervalReminderEnabled: boolean;
  intervalReminderMinutes: number;
}

export interface MusicSettings {
  volume: number;
  autoPlay: boolean;
  lastTrackId: string | null;
  youtubeToken: string | null;
  selectedPlaylistId: string | null;
}

export interface WeatherSettings {
  city: string;
}

export interface ClockSettings {
  announceTime: boolean;
  announceIntervalMinutes: AnnounceIntervalMinutes;
}

export interface AppSettings {
  appMode: AppMode;
  theme: Theme;
  backgroundVideoId: string;
  timer: TimerSettings;
  voice: VoiceSettings;
  music: MusicSettings;
  weather: WeatherSettings;
  clock: ClockSettings;
}

export interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}
