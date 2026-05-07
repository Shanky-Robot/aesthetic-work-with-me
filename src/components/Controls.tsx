import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';

export const Controls: React.FC<{
  timerState: ReturnType<typeof usePomodoroTimer>
}> = ({ timerState }) => {
  const { isRunning, start, pause, reset } = timerState;

  return (
    <div className="flex items-center justify-center space-x-6 relative z-10 mt-8">
      <button
        onClick={isRunning ? pause : start}
        className="flex items-center justify-center w-16 h-16 rounded-full bg-accent text-white shadow-[0_0_20px_var(--color-accent)] hover:scale-105 hover:bg-accent/90 transition-all focus:outline-none focus:ring-4 focus:ring-accent/30"
        aria-label={isRunning ? 'Pause Timer' : 'Start Timer'}
      >
        {isRunning ? <Pause size={28} className="fill-current" /> : <Play size={28} className="fill-current ml-1" />}
      </button>
      
      <button
        onClick={reset}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-surface text-primary border border-primary/10 shadow hover:bg-white/80 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-label="Reset Timer"
      >
        <RotateCcw size={22} />
      </button>
    </div>
  );
};
