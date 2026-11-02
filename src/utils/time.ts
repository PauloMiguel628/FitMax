/**
 * Formata milissegundos para MM:SS ou HH:MM:SS
 */
export function formatStopwatchTime(ms: number): {
  hours: string;
  minutes: string;
  seconds: string;
  formatted: string;
} {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const hoursStr = h > 0 ? String(h).padStart(2, '0') : '';
  const minutesStr = String(m).padStart(2, '0');
  const secondsStr = String(s).padStart(2, '0');

  const formatted = h > 0 
    ? `${hoursStr}:${minutesStr}:${secondsStr}` 
    : `${minutesStr}:${secondsStr}`;

  return {
    hours: hoursStr,
    minutes: minutesStr,
    seconds: secondsStr,
    formatted,
  };
}

/**
 * Formata duração para leitura amigável, ex: "15 min", "1h 12m"
 */
export function formatFriendlyDuration(ms: number, locale: 'pt-BR' | 'en' = 'pt-BR'): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    return `${h}h ${m}m`;
  }
  if (m > 0) {
    return `${m}m ${s}s`;
  }
  return `${s}s`;
}
