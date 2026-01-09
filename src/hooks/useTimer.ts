import { useState, useEffect, useCallback, useRef } from 'react';

type TimerMode = 'stopwatch' | 'countdown';

interface UseTimerOptions {
  /** Modo: stopwatch (crescente) ou countdown (decrescente) */
  mode?: TimerMode;
  /** Tempo inicial em segundos (para countdown) */
  initialTime?: number;
  /** Callback quando o tempo acabar (countdown) */
  onTimeUp?: () => void;
  /** Callback a cada segundo */
  onTick?: (time: number) => void;
  /** Auto-iniciar */
  autoStart?: boolean;
}

interface UseTimerReturn {
  /** Tempo atual em segundos */
  time: number;
  /** Tempo formatado (mm:ss) */
  formatted: string;
  /** Se está rodando */
  isRunning: boolean;
  /** Se acabou (countdown) */
  isFinished: boolean;
  /** Inicia o timer */
  start: () => void;
  /** Pausa o timer */
  pause: () => void;
  /** Reseta o timer */
  reset: () => void;
  /** Alterna entre start/pause */
  toggle: () => void;
}

/**
 * Hook para timer/cronômetro
 *
 * Suporta:
 * - Stopwatch (contagem crescente)
 * - Countdown (contagem regressiva)
 * - Callbacks onTimeUp e onTick
 * - Formatação mm:ss
 *
 * @example
 * // Cronômetro
 * const { time, formatted, start, pause, reset } = useTimer();
 *
 * // Countdown de 60 segundos
 * const { time, isFinished } = useTimer({
 *   mode: 'countdown',
 *   initialTime: 60,
 *   onTimeUp: () => alert('Tempo esgotado!')
 * });
 */
export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const {
    mode = 'stopwatch',
    initialTime = 0,
    onTimeUp,
    onTick,
    autoStart = false,
  } = options;

  const [time, setTime] = useState(mode === 'countdown' ? initialTime : 0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isFinished, setIsFinished] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  const onTickRef = useRef(onTick);

  // Atualiza refs dos callbacks
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
    onTickRef.current = onTick;
  }, [onTimeUp, onTick]);

  // Formata tempo em mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Limpa o intervalo
  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Inicia o timer
  const start = useCallback(() => {
    if (isFinished) return;
    setIsRunning(true);
  }, [isFinished]);

  // Pausa o timer
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Reseta o timer
  const reset = useCallback(() => {
    clearTimer();
    setTime(mode === 'countdown' ? initialTime : 0);
    setIsRunning(false);
    setIsFinished(false);
  }, [mode, initialTime, clearTimer]);

  // Toggle start/pause
  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, start, pause]);

  // Efeito principal do timer
  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTime((prevTime) => {
        const newTime = mode === 'countdown' ? prevTime - 1 : prevTime + 1;

        // Callback onTick
        onTickRef.current?.(newTime);

        // Verifica fim do countdown
        if (mode === 'countdown' && newTime <= 0) {
          setIsRunning(false);
          setIsFinished(true);
          onTimeUpRef.current?.();
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, mode, clearTimer]);

  // Cleanup no unmount
  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return {
    time,
    formatted: formatTime(time),
    isRunning,
    isFinished,
    start,
    pause,
    reset,
    toggle,
  };
}

/**
 * Formata segundos em mm:ss (utilitário exportado)
 */
export function formatSeconds(seconds: number): string {
  const mins = Math.floor(Math.abs(seconds) / 60);
  const secs = Math.abs(seconds) % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default useTimer;
