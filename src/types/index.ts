export type Exercise = {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
  gifUrl: string;
};

export type Profile = {
  name: string;
  bio?: string;
  photoUri?: string;
  weightKg?: number;
  heightCm?: number;
  age?: number;
  sex?: 'f' | 'm' | 'outro';
  goal?: string;
  level?: 'iniciante' | 'intermediario' | 'avancado' | 'beginner' | 'intermediate' | 'advanced';
  locale: 'pt-BR' | 'en';
  themeMode?: 'dark' | 'light';
};

export type WeightEntry = {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  recordedAt?: string; // Full ISO timestamp with date and time
  weightKg: number;
};

export type WorkoutItem = {
  exercise: Exercise;
  plannedSets: number;
  targetReps?: number;
  restSeconds?: number;
  targetDurationSeconds?: number;
};

export type Workout = {
  id: string;
  name: string;
  createdAt: string;
  defaultRestSeconds?: number;
  items: WorkoutItem[];
};

export type SessionItem = {
  exerciseId: string;
  plannedSets: number;
  doneSets: number;
  elapsedMs: number;
  restSeconds?: number;
  targetDurationSeconds?: number;
};

export type Session = {
  id: string;
  workoutId: string;
  workoutName: string;
  startedAt: number;
  currentIndex: number;
  defaultRestSeconds?: number;
  restEndsAt?: number | null;
  restTotalMs?: number;
  items: SessionItem[];
  snapshots: Record<string, Exercise>; // snapshot of exercises for offline session resilience
};

export type HistoryEntry = {
  id: string;
  workoutName: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  items: SessionItem[];
  exercisesSnapshot?: Record<string, Exercise>;
};

export type BmiClassification = {
  category: 'underweight' | 'normal' | 'overweight' | 'obese1' | 'obese2' | 'obese3';
  labelKey: string;
  color: string;
  min: number;
  max: number;
};

export type WeeklySummary = {
  workoutsCount: number;
  totalDurationMs: number;
  streakDays: number;
  loginStreakDays: number;
  totalLoginDaysWeek: number;
  dailyCounts: { day: string; date: string; count: number; loggedIn: boolean }[];
};
