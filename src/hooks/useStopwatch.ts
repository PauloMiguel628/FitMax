import { useState, useRef, useEffect, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

interface UseStopwatchReturn {
  isRunning: boolean;
  elapsedMs: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export function useStopwatch(initialElapsedMs: number = 0): UseStopwatchReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(initialElapsedMs);

  // Armazena o instante absoluto de início da contagem atual
  const startTimeRef = useRef<number | null>(null);
  // Armazena o tempo acumulado em pausas anteriores
  const accumulatedMsRef = useRef<number>(initialElapsedMs);
  const animFrameRef = useRef<number | null>(null);
  const updateLoopRef = useRef<() => void>(() => {});

  const updateLoop = useCallback(() => {
    if (startTimeRef.current !== null) {
      const now = Date.now();
      const currentDelta = now - startTimeRef.current;
      setElapsedMs(accumulatedMsRef.current + currentDelta);
      animFrameRef.current = requestAnimationFrame(() => updateLoopRef.current());
    }
  }, []);

  useEffect(() => {
    updateLoopRef.current = updateLoop;
  }, [updateLoop]);

  const start = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      activateKeepAwakeAsync('fitmax_timer');
    } catch {}

    const now = Date.now();
    startTimeRef.current = now;
    setIsRunning(true);
    animFrameRef.current = requestAnimationFrame(updateLoop);
  }, [updateLoop]);

  const pause = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      deactivateKeepAwake('fitmax_timer');
    } catch {}

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (startTimeRef.current !== null) {
      const delta = Date.now() - startTimeRef.current;
      accumulatedMsRef.current += delta;
      setElapsedMs(accumulatedMsRef.current);
      startTimeRef.current = null;
    }

    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    start();
  }, [start]);

  const reset = useCallback(() => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      deactivateKeepAwake('fitmax_timer');
    } catch {}

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    startTimeRef.current = null;
    accumulatedMsRef.current = 0;
    setElapsedMs(0);
    setIsRunning(false);
  }, []);

  // Limpa animação e desliga keep-awake ao desmontar
  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
      try {
        deactivateKeepAwake('fitmax_timer');
      } catch {}
    };
  }, []);

  return {
    isRunning,
    elapsedMs,
    start,
    pause,
    resume,
    reset,
  };
}
