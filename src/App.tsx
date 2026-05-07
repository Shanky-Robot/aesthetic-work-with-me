import { useCallback } from 'react';
import { BackgroundScene } from './components/BackgroundScene';
import { TimerDisplay } from './components/TimerDisplay';
import { Controls } from './components/Controls';
import { SettingsPanel } from './components/SettingsPanel';
import { MusicPlayer } from './components/MusicPlayer';
import { WeatherWidget } from './components/WeatherWidget';
import { usePomodoroTimer, TimerMode } from './hooks/usePomodoroTimer';
import { useVoiceAnnouncements } from './hooks/useVoiceAnnouncements';
import { useSettings } from './context/SettingsContext';
import { ClockDisplay } from './components/ClockDisplay';
import { useEffect } from 'react';

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

  useEffect(() => {
    if (settings.appMode === 'clock') {
      timerState.reset();
      window.speechSynthesis.cancel();
    }
  }, [settings.appMode, timerState]);

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col md:grid md:grid-cols-[2fr_1fr] transition-colors duration-500">
      <BackgroundScene />
      
      <main className="relative z-10 flex flex-col items-center justify-center p-8 h-[60vh] md:h-screen">
        <div className="absolute top-8 left-8 text-left hidden md:block">
          <h1 className="text-2xl font-bold opacity-90 tracking-wide drop-shadow-sm">Aesthetic Work With Me</h1>
          <p className="text-sm opacity-80 mt-1 font-medium">Focus with music, voice reminders, and live weather.</p>
        </div>
        
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
      </main>

      <aside className="relative z-10 p-8 h-auto md:h-screen flex flex-col gap-6 overflow-y-auto backdrop-blur-md bg-black/30 border-l border-white/20 shadow-2xl">
        <WeatherWidget />
        <MusicPlayer />
        <SettingsPanel />
      </aside>
    </div>
  );
}

export default App;
