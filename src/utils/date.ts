import { HistoryEntry, WeeklySummary } from '@/types';

/**
 * Retorna a data local no formato YYYY-MM-DD (respeitando o fuso horário do dispositivo)
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(isoString: string, locale: 'pt-BR' | 'en' = 'pt-BR'): string {
  try {
    const normalized =
      isoString.length === 10 && !isoString.includes('T')
        ? `${isoString}T12:00:00`
        : isoString;
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return isoString;

    if (locale === 'pt-BR') {
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string, locale: 'pt-BR' | 'en' = 'pt-BR'): string {
  try {
    if (isoString.length === 10 && !isoString.includes('T')) {
      return formatDate(isoString, locale);
    }
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;

    const time = d.toLocaleTimeString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${formatDate(isoString, locale)} • ${time}`;
  } catch {
    return isoString;
  }
}

export function formatShortDateTime(isoString: string, locale: 'pt-BR' | 'en' = 'pt-BR'): string {
  try {
    const normalized =
      isoString.length === 10 && !isoString.includes('T')
        ? `${isoString}T12:00:00`
        : isoString;
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return isoString;

    const dayMonth = d.toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
    });
    if (isoString.length === 10 && !isoString.includes('T')) {
      return dayMonth;
    }
    const time = d.toLocaleTimeString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dayMonth} ${time}`;
  } catch {
    return isoString;
  }
}

/**
 * Calcula quantos dias seguidos o usuário acessou/logou no aplicativo até hoje
 */
export function calculateLoginStreak(loginDates: string[], referenceDate: Date = new Date()): number {
  const uniqueDates = new Set(loginDates.filter(Boolean));
  const todayKey = getLocalDateString(referenceDate);
  if (uniqueDates.size === 0) return 0;

  let streak = 0;
  const cursor = new Date(referenceDate);

  // Se ainda não registrou hoje mas registrou ontem, começa de ontem; caso contrário começa de hoje
  if (!uniqueDates.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
    if (!uniqueDates.has(getLocalDateString(cursor))) {
      return 0;
    }
  }

  while (true) {
    const key = getLocalDateString(cursor);
    if (uniqueDates.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calcula o resumo dos últimos 7 dias a partir do histórico de treinos e dias logados salvos
 */
export function calculateWeeklySummary(
  history: HistoryEntry[],
  locale: 'pt-BR' | 'en' = 'pt-BR',
  loginDates: string[] = []
): WeeklySummary {
  const now = new Date();
  const dayNamesPt = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNames = locale === 'en' ? dayNamesEn : dayNamesPt;
  const dailyCountsMap: Record<string, number> = {};

  const allLoginDates = new Set<string>(loginDates.filter(Boolean));
  // Garante que o dia atual em que o usuário está visualizando conta como logado
  const todayKey = getLocalDateString(now);
  allLoginDates.add(todayKey);

  // Inicializa os últimos 7 dias
  const last7Days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = getLocalDateString(d);
    last7Days.push(key);
    dailyCountsMap[key] = 0;
  }

  let workoutsCount = 0;
  let totalDurationMs = 0;

  history.forEach((entry) => {
    try {
      const entryDate = new Date(entry.finishedAt || entry.startedAt);
      const key = getLocalDateString(entryDate);
      allLoginDates.add(key);

      if (key in dailyCountsMap) {
        dailyCountsMap[key] += 1;
        workoutsCount += 1;
        totalDurationMs += entry.durationMs || 0;
      }
    } catch {
      // Ignora datas inválidas
    }
  });

  // Calcula streak de treinos (dias consecutivos treinando até hoje/ontem)
  let streakDays = 0;
  for (let i = last7Days.length - 1; i >= 0; i--) {
    const key = last7Days[i];
    if (dailyCountsMap[key] > 0) {
      streakDays++;
    } else {
      if (i === last7Days.length - 1) {
        continue;
      }
      break;
    }
  }

  const loginStreakDays = calculateLoginStreak(Array.from(allLoginDates), now);

  let totalLoginDaysWeek = 0;
  const dailyCounts = last7Days.map((dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    const loggedIn = allLoginDates.has(dateStr) || (dailyCountsMap[dateStr] || 0) > 0;
    if (loggedIn) totalLoginDaysWeek++;
    return {
      day: dayNames[d.getDay()],
      date: dateStr,
      count: dailyCountsMap[dateStr] || 0,
      loggedIn,
    };
  });

  return {
    workoutsCount,
    totalDurationMs,
    streakDays,
    loginStreakDays,
    totalLoginDaysWeek,
    dailyCounts,
  };
}
