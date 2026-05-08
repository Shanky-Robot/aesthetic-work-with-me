import { useCallback, useEffect, useRef } from 'react';
import { BackgroundScene } from './components/BackgroundScene';
import { TimerDisplay } from './components/TimerDisplay';
import { Controls } from './components/Controls';
import { SettingsPanel } from './components/SettingsPanel';
import { MusicPlayer } from './components/MusicPlayer';
// import { WeatherWidget } from './components/WeatherWidget';
import { usePomodoroTimer, TimerMode } from './hooks/usePomodoroTimer';
import { useVoiceAnnouncements } from './hooks/useVoiceAnnouncements';
import { useSettings } from './context/SettingsContext';
import { ClockDisplay } from './components/ClockDisplay';


function App() {
  const { speak } = useVoiceAnnouncements();
  const { settings, updateSettings } = useSettings();

  const handleModeChange = useCallback((mode: TimerMode, minutes: number) => {
    speak(`${mode} started. You have ${minutes} minutes.`);
  }, [speak]);

  const handleSessionEnd = useCallback(() => {
    speak("Time's up. Session finished.");
  }, [speak]);

  const timerState = usePomodoroTimer(handleModeChange, handleSessionEnd);
  const lastReminderMinuteRef = useRef<number | null>(null);
  const prevModeRef = useRef(settings.appMode);

  useEffect(() => {
    // Only trigger if we are explicitly switching TO clock mode from another mode
    if (settings.appMode === 'clock' && prevModeRef.current !== 'clock') {
      timerState.reset();
      window.speechSynthesis.cancel();
    }
    prevModeRef.current = settings.appMode;
  }, [settings.appMode, timerState]);

  // Handle Pomodoro Interval Reminders
  useEffect(() => {
    if (settings.appMode !== 'pomodoro' || !timerState.isRunning || !settings.voice.enabled || !settings.voice.intervalReminderEnabled) {
      lastReminderMinuteRef.current = null;
      return;
    }

    const minutesRemaining = Math.floor(timerState.timeRemaining / 60);
    const secondsRemaining = timerState.timeRemaining % 60;
    
    // We only announce when seconds are 0 and we haven't announced this minute yet
    if (secondsRemaining === 0 && minutesRemaining > 0 && minutesRemaining % settings.voice.intervalReminderMinutes === 0) {
      if (lastReminderMinuteRef.current !== minutesRemaining) {
        lastReminderMinuteRef.current = minutesRemaining;
        speak(`${minutesRemaining} minutes remaining in your ${timerState.mode} session.`);
      }
    }
  }, [timerState.timeRemaining, timerState.isRunning, timerState.mode, settings.appMode, settings.voice, speak]);

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center transition-colors duration-500">
      <BackgroundScene />
      
      {/* Top Left Header */}
      <div className="absolute top-8 left-8 z-20 text-white">
        <h1 className="text-2xl font-bold opacity-90 tracking-wide drop-shadow-md">Aesthetic Work With Me</h1>
        <p className="text-sm opacity-80 mt-1 font-medium">Focus with music and voice reminders.</p>
      </div>
      
      <main className="relative z-10 flex flex-col items-center justify-center p-8 h-[60vh] md:h-screen">
        
        <div className="absolute top-8 mt-2 md:mt-0 flex items-center justify-center w-full md:w-auto z-20">
          <div className="bg-white/20 backdrop-blur-md p-1 rounded-full flex border border-white/20 shadow-sm">
            <button
              onClick={() => updateSettings({ appMode: 'pomodoro' })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${settings.appMode === 'pomodoro' ? 'bg-white text-primary shadow' : 'text-white hover:bg-white/10'}`}
            >
              Pomodoro
            </button>
            <button
              onClick={() => updateSettings({ appMode: 'clock' })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${settings.appMode === 'clock' ? 'bg-white text-primary shadow' : 'text-white hover:bg-white/10'}`}
            >
              Real Time
            </button>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {settings.appMode === 'pomodoro' ? (
            <div className="w-full max-w-md">
              <TimerDisplay timerState={timerState} />
              <Controls timerState={timerState} />
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <ClockDisplay />
            </div>
          )}
        </div>

        <div className="mt-12 w-full max-w-2xl px-4">
          <MusicPlayer />
        </div>

        <div className="mt-8 text-center text-white/40 text-[10px] font-medium tracking-widest uppercase">
          &copy; {new Date().getFullYear()} Aesthetic Work With Me.
        </div>
      </main>

      <SettingsPanel />
    </div>
  );
}

export default App;
