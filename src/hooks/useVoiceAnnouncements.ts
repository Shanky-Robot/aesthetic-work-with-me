import { useCallback, useEffect, useState, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { formatTimeForSpeech } from '../utils/timeFormat';

export const useVoiceAnnouncements = () => {
  const { settings, updateSettings } = useSettings();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { enabled, voiceURI, volume, rate } = settings.voice;
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  
  const lastAnnouncedMinuteRef = useRef<number | null>(null);

  useEffect(() => {
    if (!synth) return;
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);

      if (!voiceURI && availableVoices.length > 0) {
        const defaultVoice = availableVoices.find(
          (v) => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Woman') || v.name.includes('Samantha') || v.name.includes('Victoria'))
        ) || availableVoices.find((v) => v.lang.startsWith('en')) || availableVoices[0];
        
        if (defaultVoice) {
          updateSettings({ voice: { ...settings.voice, voiceURI: defaultVoice.voiceURI } });
        }
      }
    };

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
  }, [synth, voiceURI, settings.voice, updateSettings]);

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

    const intervalId = setInterval(() => {
      const now = new Date();
      const currentMinute = now.getMinutes();
      const currentSecond = now.getSeconds();

      if (currentMinute % settings.clock.announceIntervalMinutes === 0 && currentSecond === 0) {
        if (lastAnnouncedMinuteRef.current !== currentMinute) {
          lastAnnouncedMinuteRef.current = currentMinute;
          speak(`It is now ${formatTimeForSpeech(now)}`);
        }
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [settings.appMode, settings.clock.announceTime, settings.clock.announceIntervalMinutes, enabled, speak]);

  return { voices, speak, isSupported: !!synth };
};
