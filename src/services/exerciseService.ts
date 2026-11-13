import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise } from '@/types';
import { BUNDLED_EXERCISES } from './bundledExercises';
import { isHomeFriendlyExercise, matchesExerciseCategory } from '@/config/home-friendly';

const CACHE_KEY_ALL = 'fitmax_cache_all_exercises_v5';

// Optional RapidAPI endpoint if user configures .env
const RAPIDAPI_HOST = 'exercisedb.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;

export class ExerciseService {
  private static memoryCache: Exercise[] | null = null;

  /**
   * Retorna imediatamente os exercícios em memória ou o catálogo embutido
   * para evitar flashes ou atrasos na primeira renderização.
   */
  static getInitialExercises(): Exercise[] {
    if (this.memoryCache && this.memoryCache.length > 0) {
      return this.memoryCache;
    }
    const filteredBundled = BUNDLED_EXERCISES.filter(isHomeFriendlyExercise);
    this.memoryCache = filteredBundled;
    return filteredBundled;
  }

  /**
   * Obtém todos os exercícios livres, filtrados e validados.
   */
  static async getAllExercises(forceRefresh: boolean = false): Promise<Exercise[]> {
    if (!forceRefresh && this.memoryCache && this.memoryCache.length > 0) {
      return this.memoryCache;
    }

    // 1. Tentar ler do AsyncStorage se não estiver forçando refresh
    if (!forceRefresh) {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY_ALL);
        if (cached) {
          const parsed: Exercise[] = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.memoryCache = parsed.filter(isHomeFriendlyExercise);
            return this.memoryCache;
          }
        }
      } catch (err) {
        console.warn('Erro ao ler cache de exercícios:', err);
      }
    }

    // 2. Se houver chave RapidAPI configurada, tenta buscar na rede
    if (RAPIDAPI_KEY) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(
          `https://${RAPIDAPI_HOST}/exercises?limit=300`,
          {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': RAPIDAPI_HOST,
            },
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const formatted: Exercise[] = data
              .filter(isHomeFriendlyExercise)
              .map((item) => ({
                id: String(item.id),
                name: item.name,
                bodyPart: item.bodyPart,
                equipment: item.equipment,
                target: item.target,
                secondaryMuscles: item.secondaryMuscles || [],
                instructions: Array.isArray(item.instructions)
                  ? item.instructions
                  : [String(item.instructions || '')],
                gifUrl: item.gifUrl,
              }));

            if (formatted.length > 0) {
              this.memoryCache = formatted;
              await AsyncStorage.setItem(CACHE_KEY_ALL, JSON.stringify(formatted));
              return formatted;
            }
          }
        }
      } catch (err) {
        console.warn('Falha na API externa, aplicando fallback embutido:', err);
      }
    }

    // 3. Fallback infalível para o catálogo curado embutido
    const filteredBundled = BUNDLED_EXERCISES.filter(isHomeFriendlyExercise);
    this.memoryCache = filteredBundled;
    try {
      await AsyncStorage.setItem(CACHE_KEY_ALL, JSON.stringify(filteredBundled));
    } catch {
      // Ignora falha de escrita no storage
    }

    return filteredBundled;
  }

  /**
   * Obtém exercícios de uma categoria específica (bodyPart), priorizando os de foco primário
   */
  static async getExercisesByBodyPart(bodyPart: string): Promise<Exercise[]> {
    const all = await this.getAllExercises();
    const targetPart = bodyPart.toLowerCase().trim();

    const matched = all.filter((ex) => matchesExerciseCategory(ex, targetPart));

    return matched.sort((a, b) => {
      const aPrimary = (a.bodyPart || '').toLowerCase().trim() === targetPart ? 0 : 1;
      const bPrimary = (b.bodyPart || '').toLowerCase().trim() === targetPart ? 0 : 1;
      return aPrimary - bPrimary;
    });
  }

  /**
   * Obtém detalhes de um exercício por ID
   */
  static async getExerciseById(id: string): Promise<Exercise | null> {
    const all = await this.getAllExercises();
    const found = all.find((ex) => String(ex.id) === String(id));
    return found || null;
  }

  /**
   * Busca textual por nome ou músculo alvo
   */
  static async searchExercises(query: string, bodyPart?: string): Promise<Exercise[]> {
    let exercises = bodyPart
      ? await this.getExercisesByBodyPart(bodyPart)
      : await this.getAllExercises();

    const q = query.toLowerCase().trim();
    if (!q) return exercises;

    return exercises.filter((ex) => {
      const nameMatch = ex.name.toLowerCase().includes(q);
      const targetMatch = ex.target.toLowerCase().includes(q);
      const muscleMatch = ex.secondaryMuscles.some((m) => m.toLowerCase().includes(q));
      return nameMatch || targetMatch || muscleMatch;
    });
  }
}
