import { Exercise } from '@/types';

/**
 * Palavras proibidas no nome ou nas instruções do exercício que indicam uso de
 * equipamentos fixos como barra fixa, paralelas, banco, argolas ou caixas de salto.
 */
export const EXCLUDED_EQUIPMENT_KEYWORDS: string[] = [
  'pull-up bar',
  'pull up bar',
  'chin-up bar',
  'chin up bar',
  'pull-up',
  'pull up',
  'chin-up',
  'chin up',
  'parallel bar',
  'parallel bars',
  'dip bar',
  'dip bars',
  'dip station',
  'bench',
  'gymnastic ring',
  'gymnastic rings',
  'suspension',
  'trx',
  'cable',
  'barbell',
  'dumbbell',
  'kettlebell',
  'band',
  'resistance band',
  'rope',
  'jump rope',
  'foam roller',
  'medicine ball',
  'stability ball',
  'swiss ball',
  'exercise ball',
  'smith machine',
  'treadmill',
  'elliptical',
  'stationary bike',
  'rower',
];

/**
 * Nomes específicos de exercícios da ExerciseDB conhecidos por exigirem barra, banco ou estrutura externa
 */
export const EXCLUDED_EXERCISE_NAMES: string[] = [
  'archer pull up',
  'assisted pull-up',
  'chest dip',
  'triceps dip',
  'bench dip',
  'hanging leg raise',
  'muscle up',
  'muscle-up',
  'ring dip',
  'inverted row',
  'bar muscle-up',
  'elevator',
  'skin the cat',
  '45° side bend',
  'flag',
  'balance board',
  'bodyweight standing row (with towel)',
  'glute-ham raise',
  'captains chair straight leg raise',
  'bodyweight standing one arm row (with towel)',
  'bodyweight standing row',
  'bodyweight standing close-grip row',
  'bodyweight squatting row (with towel)',
  'twisted leg raise (female)',
  'twisted leg raise',
  'one arm towel row',
  'swing 360',
  'wind sprints',
  'gironda sternum chin',
];

/**
 * Avalia se o exercício pode ser executado em casa usando exclusivamente
 * o próprio peso do corpo, o chão ou uma parede de apoio.
 */
export function isHomeFriendlyExercise(exercise: Exercise): boolean {
  // 1. O equipamento declarado DEVE ser body weight
  const eq = (exercise.equipment || '').toLowerCase().trim();
  if (eq !== 'body weight') {
    return false;
  }

  const nameLower = (exercise.name || '').toLowerCase().trim();

  // 2. Checa exclusão direta por nome
  for (const excluded of EXCLUDED_EXERCISE_NAMES) {
    if (excluded === 'triceps dip' && nameLower === 'triceps dips floor') {
      continue;
    }
    if (nameLower === excluded || nameLower.includes(excluded)) {
      return false;
    }
  }

  // 3. Checa palavras-chave proibidas no nome
  for (const keyword of EXCLUDED_EQUIPMENT_KEYWORDS) {
    if (nameLower.includes(keyword)) {
      return false;
    }
  }

  // 4. Checa palavras-chave proibidas no texto das instruções
  if (Array.isArray(exercise.instructions)) {
    const fullInstructions = exercise.instructions.join(' ').toLowerCase();
    for (const keyword of EXCLUDED_EQUIPMENT_KEYWORDS) {
      if (fullInstructions.includes(keyword)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Verifica se um exercício pertence ou ativa a categoria selecionada.
 * Para 'shoulders' (ombros), inclui tanto os exercícios com bodyPart === 'shoulders'
 * quanto aqueles que ativam deltoides/ombros diretamente ou como musculatura sinergista.
 */
export function matchesExerciseCategory(exercise: Exercise, category: string): boolean {
  const cat = (category || '').toLowerCase().trim();
  if (!cat || cat === 'all') return true;

  const part = (exercise.bodyPart || '').toLowerCase().trim();
  if (part === cat) return true;

  if (cat === 'shoulders') {
    const target = (exercise.target || '').toLowerCase();
    if (target.includes('delt') || target.includes('shoulder')) {
      return true;
    }
    if (
      Array.isArray(exercise.secondaryMuscles) &&
      exercise.secondaryMuscles.some((m) => {
        const ml = m.toLowerCase();
        return ml.includes('shoulder') || ml.includes('delt');
      })
    ) {
      return true;
    }
  }

  if (cat === 'back') {
    const target = (exercise.target || '').toLowerCase();
    if (
      target.includes('back') ||
      target.includes('lat') ||
      target.includes('trap') ||
      target.includes('rhomboid') ||
      target.includes('spine')
    ) {
      return true;
    }
    if (
      Array.isArray(exercise.secondaryMuscles) &&
      exercise.secondaryMuscles.some((m) => {
        const ml = m.toLowerCase();
        return (
          ml.includes('upper back') ||
          ml.includes('lat') ||
          ml.includes('rhomboid') ||
          ml.includes('trap')
        );
      })
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Categorias permitidas que possuem exercícios suficientes (> 6)
 * após a aplicação do filtro estrito de peso corporal livre.
 */
export const ACTIVE_CATEGORIES = [
  'cardio',
  'chest',
  'waist',
  'back',
  'upper legs',
  'shoulders',
  'upper arms',
  'lower legs',
] as const;

export type ActiveCategory = typeof ACTIVE_CATEGORIES[number];

/**
 * Mapeamento e capas Unsplash de alta qualidade para as categorias
 */
export const CATEGORY_METADATA: Record<
  string,
  {
    displayNamePt: string;
    displayNameEn: string;
    coverUrl: string;
    descriptionPt: string;
    descriptionEn: string;
  }
> = {
  cardio: {
    displayNamePt: 'Cardio',
    displayNameEn: 'Cardio',
    coverUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    descriptionPt: 'Exercícios dinâmicos de alta queima calórica e condicionamento',
    descriptionEn: 'High-calorie burn and cardiovascular stamina exercises',
  },
  chest: {
    displayNamePt: 'Peitoral',
    displayNameEn: 'Chest',
    coverUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80',
    descriptionPt: 'Variações de flexões para peitoral, potência e empurre',
    descriptionEn: 'Push-up variations for pectoral strength and pressing power',
  },
  waist: {
    displayNamePt: 'Abdômen & Core',
    displayNameEn: 'Abs & Core',
    coverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
    descriptionPt: 'Fortalecimento do core, abdômen e estabilidade lombar',
    descriptionEn: 'Core strengthening, abdominal definition, and lumbar stability',
  },
  back: {
    displayNamePt: 'Costas',
    displayNameEn: 'Back',
    coverUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80',
    descriptionPt: 'Movimentos de solo para postura, deltoides posteriores e eretores',
    descriptionEn: 'Floor movements for posture, posterior delts, and spine health',
  },
  'upper legs': {
    displayNamePt: 'Pernas & Glúteos',
    displayNameEn: 'Legs & Glutes',
    coverUrl: 'https://images.unsplash.com/photo-1649887974297-4be052375a67?auto=format&fit=crop&w=800&q=80',
    descriptionPt: 'Agachamentos, passadas e impulsos para pernas e glúteos',
    descriptionEn: 'Squats, lunges, and plyometrics for quads, hamstrings, and glutes',
  },
  shoulders: {
    displayNamePt: 'Ombros',
    displayNameEn: 'Shoulders',
    coverUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=800&q=80',
    descriptionPt: 'Pike push-ups e exercícios de solo para deltoides',
    descriptionEn: 'Pike push-ups and floor progressions for shoulder strength',
  },
  'upper arms': {
    displayNamePt: 'Braços',
    displayNameEn: 'Arms',
    coverUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    descriptionPt: 'Mergulhos no chão, flexões diamante e isometrias para braços',
    descriptionEn: 'Floor dips, close-grip push-ups, and arm isometric holds',
  },
  'lower legs': {
    displayNamePt: 'Panturrilhas',
    displayNameEn: 'Calves',
    coverUrl: 'https://images.unsplash.com/photo-1777911045174-37d19edb0c02?auto=format&fit=crop&w=800&q=80',
    descriptionPt: 'Elevações de panturrilha e saltos leves para tornozelos',
    descriptionEn: 'Calf raises and ankle stability drills on the floor',
  },
};
