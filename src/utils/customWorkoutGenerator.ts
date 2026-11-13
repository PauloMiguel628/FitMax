import { Exercise, Workout, WorkoutItem } from '@/types';
import { BUNDLED_EXERCISES } from '@/services/bundledExercises';
import { isHomeFriendlyExercise, matchesExerciseCategory } from '@/config/home-friendly';

export type CustomWorkoutLevel = 'iniciante' | 'intermediario' | 'avancado';

export type CustomWorkoutCategory =
  | 'full-body'
  | 'cardio'
  | 'chest'
  | 'waist'
  | 'back'
  | 'upper legs'
  | 'shoulders'
  | 'upper arms'
  | 'lower legs';

export interface CustomWorkoutCategoryOption {
  id: CustomWorkoutCategory;
  labelPt: string;
  labelEn: string;
  icon: string;
}

export const CUSTOM_WORKOUT_CATEGORIES: CustomWorkoutCategoryOption[] = [
  {
    id: 'full-body',
    labelPt: 'Full-Body (Corpo Inteiro)',
    labelEn: 'Full-Body (Whole Body)',
    icon: 'body-outline',
  },
  {
    id: 'cardio',
    labelPt: 'Cardio',
    labelEn: 'Cardio',
    icon: 'flame-outline',
  },
  {
    id: 'chest',
    labelPt: 'Peitoral',
    labelEn: 'Chest',
    icon: 'fitness-outline',
  },
  {
    id: 'waist',
    labelPt: 'Abdômen e Core',
    labelEn: 'Abs & Core',
    icon: 'shield-checkmark-outline',
  },
  {
    id: 'back',
    labelPt: 'Costas',
    labelEn: 'Back',
    icon: 'accessibility-outline',
  },
  {
    id: 'upper legs',
    labelPt: 'Pernas e Glúteos',
    labelEn: 'Legs & Glutes',
    icon: 'walk-outline',
  },
  {
    id: 'shoulders',
    labelPt: 'Ombros',
    labelEn: 'Shoulders',
    icon: 'barbell-outline',
  },
  {
    id: 'upper arms',
    labelPt: 'Braços',
    labelEn: 'Arms',
    icon: 'flash-outline',
  },
  {
    id: 'lower legs',
    labelPt: 'Panturrilhas',
    labelEn: 'Calves',
    icon: 'footsteps-outline',
  },
];

export const LEVEL_PARAMETERS: Record<
  CustomWorkoutLevel,
  {
    labelPt: string;
    labelEn: string;
    sets: number;
    reps: number;
    restSeconds: number;
    countSingleCategory: number;
    countFullBody: number;
  }
> = {
  iniciante: {
    labelPt: 'Iniciante',
    labelEn: 'Beginner',
    sets: 3,
    reps: 10,
    restSeconds: 75,
    countSingleCategory: 4,
    countFullBody: 5,
  },
  intermediario: {
    labelPt: 'Intermediário',
    labelEn: 'Intermediate',
    sets: 3,
    reps: 12,
    restSeconds: 60,
    countSingleCategory: 5,
    countFullBody: 6,
  },
  avancado: {
    labelPt: 'Avançado',
    labelEn: 'Advanced',
    sets: 4,
    reps: 15,
    restSeconds: 45,
    countSingleCategory: 6,
    countFullBody: 7,
  },
};

/**
 * Listas curadas de exercícios por categoria e nível para garantir progressão biomecânica realista
 */
const CURATED_POOLS: Record<Exclude<CustomWorkoutCategory, 'full-body'>, Record<CustomWorkoutLevel, string[]>> = {
  cardio: {
    iniciante: [
      'back and forth step',
      'short stride run',
      'ski step',
      'half knee bends (male)',
      'jack jump (male)',
      'run',
      'high knee against wall',
    ],
    intermediario: [
      'jack jump (male)',
      'mountain climber',
      'skater hops',
      'scissor jumps (male)',
      'semi squat jump (male)',
      'high knee against wall',
      'astride jumps (male)',
      'run (equipment)',
    ],
    avancado: [
      'burpee',
      'jack burpee',
      'star jump (male)',
      'push to run',
      'bear crawl',
      'walking high knees lunge',
      'mountain climber',
      'skater hops',
    ],
  },
  chest: {
    iniciante: [
      'push-up (wall)',
      'push-up (wall) v. 2',
      'kneeling push-up (male)',
      'incline push-up',
      'incline push-up (on box)',
      'isometric chest squeeze',
      'dynamic chest stretch (male)',
    ],
    intermediario: [
      'push-up',
      'wide hand push up',
      'shoulder tap push-up',
      'modified hindu push-up (male)',
      'push and pull bodyweight',
      'incline push-up',
      'kneeling push-up (male)',
      'incline push-up (on box)',
    ],
    avancado: [
      'archer push up',
      'clap push up',
      'plyo push up',
      'isometric wipers',
      'chest tap push-up (male)',
      'clock push-up',
      'drop push up',
      'superman push-up',
      'single arm push-up',
      'raise single arm push-up',
      'full planche push-up',
    ],
  },
  waist: {
    iniciante: [
      'quarter sit-up',
      'half sit-up (male)',
      'curl-up',
      'pelvic tilt',
      'dead bug',
      'knee touch crunch',
      'alternate heel touchers',
      'seated side crunch (wall)',
    ],
    intermediario: [
      'sit-up v. 2',
      '3/4 sit-up',
      'air bike',
      'russian twist',
      'lying elbow to knee',
      'reverse crunch',
      'cross body crunch',
      'side bridge v. 2',
      'front plank with twist',
    ],
    avancado: [
      'jackknife sit-up',
      'v-sit on floor',
      'l-sit on floor',
      'janda sit-up',
      'bottoms-up',
      'butt-ups',
      'cocoons',
      'push-up to side plank',
      'bridge - mountain climber (cross body)',
    ],
  },
  back: {
    iniciante: [
      'standing pelvic tilt',
      'lower back curl',
      'sphinx',
      'standing archer',
      'upper back stretch',
      'one arm against wall',
      'kneeling lat stretch',
    ],
    intermediario: [
      'elbow lift - reverse push-up',
      'scapula dips',
      'scapula push-up',
      'lower back curl',
      'upward facing dog',
      'standing archer',
      'push and pull bodyweight',
      'spine stretch',
    ],
    avancado: [
      'swimmer kicks v. 2 (male)',
      'elbow lift - reverse push-up',
      'scapula dips',
      'scapula push-up',
      'lower back curl',
      'upward facing dog',
      'standing archer',
      'two toe touch (male)',
    ],
  },
  'upper legs': {
    iniciante: [
      'potty squat with support',
      'low glute bridge on floor',
      'glute bridge march',
      'march sit (wall)',
      'pelvic tilt into bridge',
      'side hip abduction',
      'monster walk',
    ],
    intermediario: [
      'split squats',
      'forward lunge (male)',
      'walking lunge',
      'monster walk',
      'kick out sit',
      'squat to overhead reach',
      'single leg bridge with outstretched leg',
      'curtsey squat',
      'quads',
      'swimmer kicks v. 2 (male)',
    ],
    avancado: [
      'single leg squat (pistol) male',
      'one leg squat',
      'jump squat',
      'bodyweight drop jump squat',
      'lunge with jump',
      'sissy squat',
      'kick out sit',
      'self assisted inverse leg curl',
    ],
  },
  shoulders: {
    iniciante: [
      'push-up (wall)',
      'kneeling plank tap shoulder (male)',
      'posterior step to overhead reach',
      'scapula push-up',
      'one arm against wall',
      'kneeling push-up (male)',
      'chest and front of shoulder stretch',
    ],
    intermediario: [
      'pike-to-cobra push-up',
      'shoulder tap',
      'shoulder tap push-up',
      'decline push-up',
      'inchworm',
      'power point plank',
      'push-up plus',
      'bear crawl',
    ],
    avancado: [
      'handstand push-up',
      'handstand',
      'pike-to-cobra push-up',
      'spider crawl push up',
      'decline push-up',
      'archer push up',
      'lean planche',
      'stalder press',
    ],
  },
  'upper arms': {
    iniciante: [
      'triceps dips floor',
      'close-grip push-up (on knees)',
      'reverse dip',
      'modified push up to lower arms',
      'bodyweight side lying biceps curl',
      'biceps leg concentration curl',
      'wrist circles',
      'triceps stretch',
    ],
    intermediario: [
      'close-grip push-up',
      'triceps dips floor',
      'reverse dip',
      'triceps press',
      'bodyweight kneeling triceps extension',
      'biceps leg concentration curl',
      'push-up on lower arms',
      'bodyweight side lying biceps curl',
    ],
    avancado: [
      'diamond push-up',
      'body-up',
      'side push-up',
      'bodyweight kneeling triceps extension',
      'triceps press',
      'triceps dips floor',
      'close-grip push-up',
      'biceps leg concentration curl',
    ],
  },
  'lower legs': {
    iniciante: [
      'bodyweight standing calf raise',
      'standing calves',
      'ankle circles',
      'circles knee stretch',
      'seated calf stretch (male)',
      'calf stretch with hands against wall',
      'standing calves calf stretch',
    ],
    intermediario: [
      'bodyweight standing calf raise',
      'standing calves',
      'donkey calf raise',
      'standing calf raise (on a staircase)',
      'one leg floor calf raise',
      'ankle circles',
    ],
    avancado: [
      'one leg donkey calf raise',
      'one leg floor calf raise',
      'donkey calf raise',
      'standing calf raise (on a staircase)',
      'bodyweight standing calf raise',
      'standing calves',
    ],
  },
};

const FULL_BODY_CATEGORY_ROTATION: Exclude<CustomWorkoutCategory, 'full-body'>[] = [
  'cardio',
  'chest',
  'upper legs',
  'waist',
  'back',
  'shoulders',
  'upper arms',
  'lower legs',
];

function resolveCategoryExercises(
  allExercises: Exercise[],
  category: Exclude<CustomWorkoutCategory, 'full-body'>,
  level: CustomWorkoutLevel,
  variationSeed: number
): Exercise[] {
  const preferredNames = CURATED_POOLS[category][level] || [];
  const categoryAll = allExercises.filter((ex) => matchesExerciseCategory(ex, category));

  const byNameMap = new Map<string, Exercise>();
  for (const ex of allExercises) {
    byNameMap.set(ex.name.toLowerCase().trim(), ex);
  }

  const ordered: Exercise[] = [];
  const seenIds = new Set<string>();

  for (const name of preferredNames) {
    const match = byNameMap.get(name.toLowerCase().trim());
    if (match && !seenIds.has(String(match.id))) {
      ordered.push(match);
      seenIds.add(String(match.id));
    }
  }

  // Adiciona demais exercícios da categoria como complemento para rotação
  for (const ex of categoryAll) {
    if (!seenIds.has(String(ex.id))) {
      ordered.push(ex);
      seenIds.add(String(ex.id));
    }
  }

  if (ordered.length === 0) {
    return allExercises.slice(0, 6);
  }

  // Rotaciona de acordo com variationSeed mantendo foco nos principais da lista curada
  const poolSize = Math.max(ordered.length, 1);
  const rotated: Exercise[] = [];
  for (let i = 0; i < ordered.length; i++) {
    const idx = (i + variationSeed) % poolSize;
    rotated.push(ordered[idx]);
  }

  return rotated;
}

/**
 * Gera os dados completos de um treino personalizado com base no nível e grupo muscular alvo
 */
export function buildCustomWorkout(params: {
  level: CustomWorkoutLevel;
  category: CustomWorkoutCategory;
  locale?: 'pt-BR' | 'en';
  variationSeed?: number;
  existingWorkoutsCount?: number;
  availableExercises?: Exercise[];
}): Omit<Workout, 'id' | 'createdAt'> {
  const {
    level,
    category,
    locale = 'pt-BR',
    variationSeed = 0,
    existingWorkoutsCount = 0,
    availableExercises,
  } = params;

  const catalog =
    availableExercises && availableExercises.length > 0
      ? availableExercises
      : BUNDLED_EXERCISES.filter(isHomeFriendlyExercise);

  const levelMeta = LEVEL_PARAMETERS[level];
  const categoryMeta =
    CUSTOM_WORKOUT_CATEGORIES.find((c) => c.id === category) || CUSTOM_WORKOUT_CATEGORIES[0];

  const selectedExercises: Exercise[] = [];
  const usedIds = new Set<string>();

  if (category === 'full-body') {
    const targetCount = levelMeta.countFullBody;
    for (let i = 0; i < FULL_BODY_CATEGORY_ROTATION.length && selectedExercises.length < targetCount; i++) {
      const catKey = FULL_BODY_CATEGORY_ROTATION[(i + variationSeed) % FULL_BODY_CATEGORY_ROTATION.length];
      const candidates = resolveCategoryExercises(catalog, catKey, level, variationSeed + i);
      const picked = candidates.find((ex) => !usedIds.has(String(ex.id)));
      if (picked) {
        selectedExercises.push(picked);
        usedIds.add(String(picked.id));
      }
    }
  } else {
    const targetCount = levelMeta.countSingleCategory;
    const candidates = resolveCategoryExercises(catalog, category, level, variationSeed);
    for (const ex of candidates) {
      if (selectedExercises.length >= targetCount) break;
      if (!usedIds.has(String(ex.id))) {
        selectedExercises.push(ex);
        usedIds.add(String(ex.id));
      }
    }
  }

  const items: WorkoutItem[] = selectedExercises.map((exercise, idx) => {
    const isCardioOrCore =
      exercise.bodyPart === 'cardio' ||
      exercise.bodyPart === 'waist' ||
      exercise.bodyPart === 'lower legs';

    const plannedSets =
      level === 'intermediario' && idx < 2 ? 4 : levelMeta.sets;

    const targetReps = isCardioOrCore ? levelMeta.reps + 3 : levelMeta.reps;

    return {
      exercise,
      plannedSets,
      targetReps,
      restSeconds: levelMeta.restSeconds,
    };
  });

  const catLabel = locale === 'en' ? categoryMeta.labelEn : categoryMeta.labelPt;
  const lvlLabel = locale === 'en' ? levelMeta.labelEn : levelMeta.labelPt;
  const prefix = locale === 'en' ? 'Custom Workout' : 'Treino Personalizado';
  const suffixNumber = existingWorkoutsCount > 0 ? ` #${existingWorkoutsCount + 1}` : '';

  return {
    name: `${prefix}: ${catLabel} (${lvlLabel})${suffixNumber}`,
    defaultRestSeconds: levelMeta.restSeconds,
    items,
  };
}
