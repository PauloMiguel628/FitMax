import { useState, useRef, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { triggerTimerStartSignal, triggerTimerFinishSignal } from '@/utils/sound';

interface UseCountdownOptions {
  initialDurationSeconds?: number;
  autoSignalOnStart?: boolean;
  onFinish?: () => void;
}

export interface UseCountdownReturn {
  isRunning: boolean;
  isCompleted: boolean;
  targetSeconds: number;
  remainingMs: number;
  totalDurationMs: number;
  progress: number;
  start: (customDurationSeconds?: number) => void;
  pause: () => void;
  resume: () => void;
  reset: (newTargetSeconds?: number) => void;
  addSeconds: (deltaSeconds: number) => void;
  setTargetDuration: (seconds: number) => void;
}

export function useCountdown({
  initialDurationSeconds = 45,
  autoSignalOnStart = true,
  onFinish,
}: UseCountdownOptions = {}): UseCountdownReturn {
  const initialMs = Math.max(5, initialDurationSeconds) * 1000;
  const [targetSeconds, setTargetSeconds] = useState(Math.max(5, initialDurationSeconds));
  const [totalDurationMs, setTotalDurationMs] = useState(initialMs);
  const [remainingMs, setRemainingMs] = useState(initialMs);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Instante absoluto (Date.now()) em que a contagem regressiva terminará
  const endTimeRef = useRef<number | null>(null);
  const pausedRemainingRef = useRef<number>(initialMs);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const syncRemainingFromClock = useCallback(() => {
    if (endTimeRef.current === null) return;
    const now = Date.now();
    const nextRemaining = Math.max(0, endTimeRef.current - now);
    setRemainingMs(nextRemaining);
    pausedRemainingRef.current = nextRemaining;

    if (nextRemaining <= 0) {
      endTimeRef.current = null;
      clearTimerInterval();
      setIsRunning(false);
      setIsCompleted(true);
      try {
        deactivateKeepAwake('fitmax_countdown');
      } catch {}
      triggerTimerFinishSignal();
      if (onFinishRef.current) {
        onFinishRef.current();
      }
    }
  }, [clearTimerInterval]);

  // Monitora AppState para atualizar instantaneamente ao destravar a tela ou voltar do 2º plano
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active' && endTimeRef.current !== null) {
        syncRemainingFromClock();
      }
    };
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      sub.remove();
    };
  }, [syncRemainingFromClock]);

  const start = useCallback(
    (customDurationSeconds?: number) => {
      clearTimerInterval();
      const baseSeconds =
        typeof customDurationSeconds === 'number' && customDurationSeconds > 0
          ? customDurationSeconds
          : targetSeconds;
      const durationMs = Math.max(5, baseSeconds) * 1000;

      if (typeof customDurationSeconds === 'number' && customDurationSeconds > 0) {
        setTargetSeconds(baseSeconds);
      }

      setTotalDurationMs(durationMs);
      setRemainingMs(durationMs);
      pausedRemainingRef.current = durationMs;
      endTimeRef.current = Date.now() + durationMs;
      setIsCompleted(false);
      setIsRunning(true);

      try {
        activateKeepAwakeAsync('fitmax_countdown');
      } catch {}

      if (autoSignalOnStart) {
        triggerTimerStartSignal();
      } else {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {}
      }

      intervalRef.current = setInterval(syncRemainingFromClock, 100);
    },
    [autoSignalOnStart, clearTimerInterval, syncRemainingFromClock, targetSeconds]
  );

  const pause = useCallback(() => {
    if (endTimeRef.current !== null) {
      const left = Math.max(0, endTimeRef.current - Date.now());
      pausedRemainingRef.current = left;
      setRemainingMs(left);
      endTimeRef.current = null;
    }
    clearTimerInterval();
    setIsRunning(false);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      deactivateKeepAwake('fitmax_countdown');
    } catch {}
  }, [clearTimerInterval]);

  const resume = useCallback(() => {
    const left = pausedRemainingRef.current > 0 ? pausedRemainingRef.current : targetSeconds * 1000;
    endTimeRef.current = Date.now() + left;
    setIsCompleted(false);
    setIsRunning(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      activateKeepAwakeAsync('fitmax_countdown');
    } catch {}
    clearTimerInterval();
    intervalRef.current = setInterval(syncRemainingFromClock, 100);
  }, [clearTimerInterval, syncRemainingFromClock, targetSeconds]);

  const reset = useCallback(
    (newTargetSeconds?: number) => {
      clearTimerInterval();
      endTimeRef.current = null;
      const secs =
        typeof newTargetSeconds === 'number' && newTargetSeconds > 0
          ? Math.max(5, newTargetSeconds)
          : targetSeconds;
      if (typeof newTargetSeconds === 'number' && newTargetSeconds > 0) {
        setTargetSeconds(secs);
      }
      const ms = secs * 1000;
      setTotalDurationMs(ms);
      setRemainingMs(ms);
      pausedRemainingRef.current = ms;
      setIsRunning(false);
      setIsCompleted(false);
      try {
        deactivateKeepAwake('fitmax_countdown');
      } catch {}
    },
    [clearTimerInterval, targetSeconds]
  );

  const addSeconds = useCallback((deltaSeconds: number) => {
    const deltaMs = deltaSeconds * 1000;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (endTimeRef.current !== null) {
      const nextEnd = Math.max(Date.now() + 1000, endTimeRef.current + deltaMs);
      endTimeRef.current = nextEnd;
      const nextRem = Math.max(1000, nextEnd - Date.now());
      pausedRemainingRef.current = nextRem;
      setRemainingMs(nextRem);
      setTotalDurationMs((prev) => Math.max(nextRem, prev + deltaMs));
    } else {
      const nextRem = Math.max(5000, pausedRemainingRef.current + deltaMs);
      pausedRemainingRef.current = nextRem;
      setRemainingMs(nextRem);
      setTotalDurationMs(nextRem);
      setTargetSeconds(Math.round(nextRem / 1000));
    }
  }, []);

  const setTargetDuration = useCallback(
    (seconds: number) => {
      const clamped = Math.max(5, Math.min(3600, seconds));
      reset(clamped);
    },
    [reset]
  );

  useEffect(() => {
    return () => {
      clearTimerInterval();
      try {
        deactivateKeepAwake('fitmax_countdown');
      } catch {}
    };
  }, [clearTimerInterval]);

  const progress = totalDurationMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalDurationMs)) : 0;

  return {
    isRunning,
    isCompleted,
    targetSeconds,
    remainingMs,
    totalDurationMs,
    progress,
    start,
    pause,
    resume,
    reset,
    addSeconds,
    setTargetDuration,
  };
}
