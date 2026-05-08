import { useCallback, useEffect, useState, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { AppSettings } from '../types/settings';
import { formatTimeForSpeech } from '../utils/timeFormat';

export const useVoiceAnnouncements = () => {
  const { settings, updateSettings } = useSettings();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { enabled, voiceURI, volume, rate } = settings.voice;
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  
  const lastAnnouncedMinuteRef = useRef<number | null>(null);

  // Load voices and listen for changes
  useEffect(() => {
    if (!synth) return;

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    // Initial load
    loadVoices();

    // Chrome/Safari often load voices asynchronously
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    // Also use addEventListener as a secondary listener
    synth.addEventListener?.('voiceschanged', loadVoices);

    // Fallback polling for the first few seconds if list is empty
    let pollCount = 0;
    const pollInterval = setInterval(() => {
      const currentVoices = synth.getVoices();
      if (currentVoices.length > 0) {
        setVoices(currentVoices);
        clearInterval(pollInterval);
      }
      if (++pollCount > 10) clearInterval(pollInterval);
    }, 500);

    return () => {
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = null;
      }
      synth.removeEventListener?.('voiceschanged', loadVoices);
      clearInterval(pollInterval);
    };
  }, [synth]);

  // Set default voice if none selected
  useEffect(() => {
    if (voices.length > 0 && !voiceURI) {
      const defaultVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Woman') || v.name.includes('Samantha') || v.name.includes('Victoria'))
      ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];
      
      if (defaultVoice) {
        updateSettings((prev: AppSettings) => ({ 
          voice: { ...prev.voice, voiceURI: defaultVoice.voiceURI } 
        }));
      }
    }
  }, [voices, voiceURI, updateSettings]);

  const speak = useCallback((text: string) => {
    if (!enabled || !synth) return;

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (voiceURI) {
      const selectedVoice = voices.find((v) => v.voiceURI === voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    utterance.volume = volume;
    utterance.rate = rate;
    
    synth.speak(utterance);
  }, [enabled, synth, voices, voiceURI, volume, rate]);

  useEffect(() => {
    if (settings.appMode !== 'clock' || !settings.clock.announceTime || !enabled) {
      lastAnnouncedMinuteRef.current = null;
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextCheck = () => {
      const now = new Date();
      const currentMinute = now.getMinutes();
      const currentSeconds = now.getSeconds();
      const currentMillis = now.getMilliseconds();

      // Check if we should announce
      // Triggers if current minute is a multiple of the interval, 
      // we haven't announced this minute yet, and we are at the start of the minute
      if (currentMinute % settings.clock.announceIntervalMinutes === 0) {
        if (lastAnnouncedMinuteRef.current !== currentMinute && currentSeconds < 3) {
          lastAnnouncedMinuteRef.current = currentMinute;
          speak(`It is now ${formatTimeForSpeech(now)}`);
        }
      }

      // Calculate delay until the exact start of the next minute
      // (60s - currentSeconds) * 1000ms - currentMillis
      const msToNextMinute = (60 - currentSeconds) * 1000 - currentMillis;
      
      // Schedule the next check to fire right at the start of the next minute
      // Add a tiny buffer (50ms) to ensure we've actually crossed the minute boundary
      timeoutId = setTimeout(scheduleNextCheck, msToNextMinute + 50);
    };

    scheduleNextCheck();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [settings.appMode, settings.clock.announceTime, settings.clock.announceIntervalMinutes, enabled, speak]);

  return { voices, speak, isSupported: !!synth };
};
