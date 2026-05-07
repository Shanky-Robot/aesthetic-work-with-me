import React from 'react';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import { useSettings } from '../context/SettingsContext';

export const TimerDisplay: React.FC<{
  timerState: ReturnType<typeof usePomodoroTimer>
}> = ({ timerState }) => {
  const { timeRemaining, mode, sessionCount } = timerState;
  const { settings } = useSettings();

  const mins = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
  const secs = (timeRemaining % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center space-y-4 my-8 relative z-10 backdrop-blur-md bg-surface p-12 rounded-3xl shadow-lg border border-white/20">
      <h2 className="text-xl md:text-2xl font-medium tracking-widest uppercase opacity-80">
        {mode}
      </h2>
      <div className="text-7xl md:text-9xl font-light tracking-tighter tabular-nums drop-shadow-md">
        {mins}:{secs}
      </div>
      
      <div className="flex space-x-2 mt-4">
        {Array.from({ length: settings.timer.sessionsBeforeLongBreak }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i < (sessionCount % settings.timer.sessionsBeforeLongBreak)
                ? 'bg-accent shadow-[0_0_8px_var(--color-accent)]'
                : 'bg-primary/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
