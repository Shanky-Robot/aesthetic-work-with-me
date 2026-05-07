import { useState, useEffect, useRef, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';

export type TimerMode = 'Focus' | 'Short Break' | 'Long Break';

export const usePomodoroTimer = (onModeChange?: (mode: TimerMode, minutes: number) => void, onSessionEnd?: () => void) => {
  const { settings } = useSettings();
  const { focusDuration, shortBreakDuration, longBreakDuration, sessionsBeforeLongBreak, autoStartNext } = settings.timer;

  const [mode, setMode] = useState<TimerMode>('Focus');
  const [timeRemaining, setTimeRemaining] = useState(focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const endTimeRef = useRef<number | null>(null);

  const getDurationForMode = useCallback((m: TimerMode) => {
    switch (m) {
      case 'Focus': return focusDuration * 60;
      case 'Short Break': return shortBreakDuration * 60;
      case 'Long Break': return longBreakDuration * 60;
    }
  }, [focusDuration, shortBreakDuration, longBreakDuration]);

  useEffect(() => {
    if (!isRunning) {
      setTimeRemaining(getDurationForMode(mode));
    }
  }, [focusDuration, shortBreakDuration, longBreakDuration, mode, isRunning, getDurationForMode]);

  const start = useCallback(() => {
    if (!isRunning) {
      endTimeRef.current = Date.now() + timeRemaining * 1000;
      setIsRunning(true);
      if (timeRemaining === getDurationForMode(mode)) {
        onModeChange?.(mode, getDurationForMode(mode) / 60);
      }
    }
  }, [isRunning, timeRemaining, mode, getDurationForMode, onModeChange]);

  const pause = useCallback(() => {
    setIsRunning(false);
    endTimeRef.current = null;
  }, []);

  const resume = useCallback(() => {
    if (!isRunning) {
      endTimeRef.current = Date.now() + timeRemaining * 1000;
      setIsRunning(true);
    }
  }, [isRunning, timeRemaining]);

  const reset = useCallback(() => {
    setIsRunning(false);
    endTimeRef.current = null;
    setTimeRemaining(getDurationForMode(mode));
  }, [mode, getDurationForMode]);

  const switchMode = useCallback(() => {
    let nextMode: TimerMode = 'Focus';
    let newSessionCount = sessionCount;

    if (mode === 'Focus') {
      newSessionCount += 1;
      setSessionCount(newSessionCount);
      if (newSessionCount > 0 && newSessionCount % sessionsBeforeLongBreak === 0) {
        nextMode = 'Long Break';
      } else {
        nextMode = 'Short Break';
      }
    } else {
      nextMode = 'Focus';
    }

    setMode(nextMode);
    const newDuration = getDurationForMode(nextMode);
    setTimeRemaining(newDuration);
    
    if (autoStartNext) {
      endTimeRef.current = Date.now() + newDuration * 1000;
      setIsRunning(true);
      onModeChange?.(nextMode, newDuration / 60);
    } else {
      setIsRunning(false);
      endTimeRef.current = null;
    }
  }, [mode, sessionCount, sessionsBeforeLongBreak, getDurationForMode, autoStartNext, onModeChange]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (isRunning) {
      intervalId = setInterval(() => {
        if (endTimeRef.current) {
          const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
          setTimeRemaining(remaining);

          if (remaining === 0) {
            clearInterval(intervalId);
            onSessionEnd?.();
            switchMode();
          }
        }
      }, 200);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, switchMode, onSessionEnd]);

  return { timeRemaining, mode, isRunning, sessionCount, start, pause, resume, reset };
};
