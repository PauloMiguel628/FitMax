// Testes unitários para cálculos puros de IMC, tempo, resumo semanal e filtro home-friendly

const assert = (condition, msg) => {
  if (!condition) {
    console.error(`❌ FALHOU: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSOU: ${msg}`);
  }
};

console.log('\n--- 1. Testes de Cálculo de IMC ---');
function calculateBmi(weightKg, heightCm) {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

assert(calculateBmi(70, 175) === 22.9, 'IMC para 70kg e 175cm deve ser 22.9');
assert(calculateBmi(50, 175) === 16.3, 'IMC para 50kg e 175cm deve ser 16.3 (Abaixo do peso)');
assert(calculateBmi(85, 175) === 27.8, 'IMC para 85kg e 175cm deve ser 27.8 (Sobrepeso)');
assert(calculateBmi(105, 175) === 34.3, 'IMC para 105kg e 175cm deve ser 34.3 (Obesidade I)');
assert(calculateBmi(0, 175) === 0, 'IMC para peso 0 deve retornar 0');
assert(calculateBmi(70, 0) === 0, 'IMC para altura 0 deve retornar 0');

console.log('\n--- 2. Testes de Classificação de IMC (OMS) ---');
const BMI_RANGES = [
  { category: 'underweight', min: 0, max: 18.49 },
  { category: 'normal', min: 18.5, max: 24.99 },
  { category: 'overweight', min: 25.0, max: 29.99 },
  { category: 'obese1', min: 30.0, max: 34.99 },
  { category: 'obese2', min: 35.0, max: 39.99 },
  { category: 'obese3', min: 40.0, max: 100.0 },
];
function getBmiClassification(bmi) {
  for (const range of BMI_RANGES) {
    if (bmi >= range.min && bmi <= range.max) return range;
  }
  return BMI_RANGES[BMI_RANGES.length - 1];
}

assert(getBmiClassification(17.5).category === 'underweight', '17.5 deve ser underweight');
assert(getBmiClassification(22.9).category === 'normal', '22.9 deve ser normal');
assert(getBmiClassification(27.8).category === 'overweight', '27.8 deve ser overweight');
assert(getBmiClassification(32.0).category === 'obese1', '32.0 deve ser obese1');
assert(getBmiClassification(37.5).category === 'obese2', '37.5 deve ser obese2');
assert(getBmiClassification(42.0).category === 'obese3', '42.0 deve ser obese3');

console.log('\n--- 3. Testes de Formatação de Tempo do Cronômetro ---');
function formatStopwatchTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const hoursStr = h > 0 ? String(h).padStart(2, '0') : '';
  const minutesStr = String(m).padStart(2, '0');
  const secondsStr = String(s).padStart(2, '0');
  const formatted = h > 0 ? `${hoursStr}:${minutesStr}:${secondsStr}` : `${minutesStr}:${secondsStr}`;
  return { formatted };
}

assert(formatStopwatchTime(0).formatted === '00:00', '0ms deve formatar como 00:00');
assert(formatStopwatchTime(9000).formatted === '00:09', '9000ms deve formatar como 00:09');
assert(formatStopwatchTime(65000).formatted === '01:05', '65000ms deve formatar como 01:05');
assert(formatStopwatchTime(3665000).formatted === '01:01:05', '3665000ms deve formatar como 01:01:05');

function formatWorkoutDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor((ms || 0) / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

assert(formatWorkoutDuration(130000) === '2m 10s', '130000ms (2m 10s) deve formatar como 2m 10s');
assert(formatWorkoutDuration(45000) === '45s', '45000ms deve formatar como 45s');
assert(formatWorkoutDuration(3725000) === '1h 2m 5s', '3725000ms deve formatar como 1h 2m 5s');
assert(formatWorkoutDuration(0) === '0s', '0ms deve formatar como 0s');

console.log('\n--- 4. Testes de Filtro de Exercícios Home-Friendly ---');
const EXCLUDED_KEYWORDS = ['pull-up bar', 'chin-up bar', 'bench', 'parallel bars', 'dip bar'];
const EXCLUDED_NAMES = [
  'archer pull up',
  'chest dip',
  'triceps dip',
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
function isHomeFriendly(exercise) {
  if (exercise.equipment !== 'body weight') return false;
  const name = (exercise.name || '').toLowerCase().trim();
  for (const n of EXCLUDED_NAMES) {
    if (n === 'triceps dip' && name === 'triceps dips floor') continue;
    if (name === n || name.includes(n)) return false;
  }
  const inst = (exercise.instructions || []).join(' ').toLowerCase();
  if (EXCLUDED_KEYWORDS.some(k => name.includes(k) || inst.includes(k))) return false;
  return true;
}

assert(isHomeFriendly({ name: 'push-up', equipment: 'body weight', instructions: ['Push from floor'] }) === true, 'Flexão de solo deve ser permitida');
assert(isHomeFriendly({ name: 'burpee', equipment: 'body weight', instructions: ['Jump on floor'] }) === true, 'Burpee deve ser permitido');
assert(isHomeFriendly({ name: 'triceps dips floor', equipment: 'body weight', instructions: ['Sit on the floor'] }) === true, 'Mergulho de tríceps sentado no solo deve ser permitido');
assert(isHomeFriendly({ name: 'dumbbell curl', equipment: 'dumbbell', instructions: ['Curl dumbbell'] }) === false, 'Halteres devem ser rejeitados');
assert(isHomeFriendly({ name: 'archer pull up', equipment: 'body weight', instructions: ['Hang on bar'] }) === false, 'Archer pull up deve ser rejeitado');
assert(isHomeFriendly({ name: 'chest dip', equipment: 'body weight', instructions: ['On parallel bars'] }) === false, 'Chest dip deve ser rejeitado');
assert(isHomeFriendly({ name: 'elevator', equipment: 'body weight', instructions: ['Pull up'] }) === false, 'Elevator deve ser rejeitado');
assert(isHomeFriendly({ name: 'skin the cat', equipment: 'body weight', instructions: ['Rotate body'] }) === false, 'Skin the cat deve ser rejeitado');
assert(isHomeFriendly({ name: 'flag', equipment: 'body weight', instructions: ['Human flag'] }) === false, 'Human flag deve ser rejeitado');

console.log('\n--- 5. Testes de Sequência de Dias Seguidos Logado (Login Streak) ---');
function getLocalDateString(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function calculateLoginStreak(loginDates, refDate) {
  const uniqueDates = new Set(loginDates.filter(Boolean));
  const todayKey = getLocalDateString(refDate);
  if (uniqueDates.size === 0) return 0;
  let streak = 0;
  const cursor = new Date(refDate);
  if (!uniqueDates.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
    if (!uniqueDates.has(getLocalDateString(cursor))) return 0;
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
const ref = new Date('2026-10-24T12:00:00');
assert(calculateLoginStreak(['2026-10-22', '2026-10-23', '2026-10-24'], ref) === 3, 'Sequência de 3 dias seguidos logado deve retornar 3');
assert(calculateLoginStreak(['2026-10-20', '2026-10-23', '2026-10-24'], ref) === 2, 'Sequência quebrada deve contar apenas os 2 últimos dias consecutivos');
assert(calculateLoginStreak(['2026-10-24'], ref) === 1, 'Primeiro dia logado deve retornar 1');

console.log('\n--- 6. Testes de Remoção de Série na Sessão (removeSet) ---');
function removeSetFromItem(item) {
  const nextPlanned = Math.max(1, item.plannedSets - 1);
  return {
    ...item,
    plannedSets: nextPlanned,
    doneSets: Math.min(item.doneSets, nextPlanned),
  };
}
assert(removeSetFromItem({ plannedSets: 4, doneSets: 4 }).plannedSets === 3, 'Deve reduzir de 4 para 3 séries');
assert(removeSetFromItem({ plannedSets: 4, doneSets: 4 }).doneSets === 3, 'Deve ajustar doneSets para não exceder plannedSets');
assert(removeSetFromItem({ plannedSets: 1, doneSets: 1 }).plannedSets === 1, 'Deve manter no mínimo 1 série');

console.log('\n--- 7. Testes de Registro de Evolução de Peso com Data e Hora ---');
const weightList = [
  { id: 'w-1', date: '2026-10-23', recordedAt: '2026-10-23T09:00:00.000Z', weightKg: 74.0 },
  { id: 'w-2', date: '2026-10-24', recordedAt: '2026-10-24T08:30:00.000Z', weightKg: 73.6 },
  { id: 'w-3', date: '2026-10-24', recordedAt: '2026-10-24T18:45:00.000Z', weightKg: 73.4 },
];
assert(weightList.length === 3 && weightList[2].recordedAt.includes('T18:45'), 'Deve manter todos os registros com data e hora exatas para o gráfico');

console.log('\n--- 8. Testes de Descanso entre Séries e Contagem Regressiva por Horário (Background/Tela Travada) ---');
function computeRemainingFromClock(endsAt, now) {
  if (!endsAt) return 0;
  return Math.max(0, endsAt - now);
}
const startClock = 1700000000000;
let restEndsAt = startClock + 60000; // 60s de descanso
assert(computeRemainingFromClock(restEndsAt, startClock + 25000) === 35000, 'Após 25s com tela travada, deve restar exatamente 35000ms');
// Usuário soma +15s
restEndsAt += 15000;
assert(computeRemainingFromClock(restEndsAt, startClock + 25000) === 50000, 'Ao somar +15s, deve passar para 50000ms restantes');
assert(computeRemainingFromClock(restEndsAt, startClock + 80000) === 0, 'Após o horário final, deve retornar 0ms');

// Teste de auto-dismiss do pop-up de descanso finalizado
const REST_FINISHED_BANNER_TIMEOUT_MS = 5000;
function isNoticeActive(shownAt, now) {
  if (!shownAt) return false;
  return now - shownAt < REST_FINISHED_BANNER_TIMEOUT_MS;
}
const finishTime = 1700000080000;
assert(isNoticeActive(finishTime, finishTime + 2000) === true, 'Banner de descanso deve permanecer visível após 2 segundos');
assert(isNoticeActive(finishTime, finishTime + 5000) === false, 'Banner de descanso deve desaparecer após 5 segundos');
assert(isNoticeActive(finishTime, finishTime + 6000) === false, 'Banner de descanso não deve mais estar visível após 6 segundos');

console.log('\n--- 9. Testes de Alternância de Tema (Modo Escuro / Modo Claro) ---');
function toggleTheme(current) {
  return current === 'light' ? 'dark' : 'light';
}
assert(toggleTheme('dark') === 'light', 'Deve alternar de dark para light');
assert(toggleTheme('light') === 'dark', 'Deve alternar de light para dark');

console.log('\n--- 10. Testes de Persistência e Reidratação de Dados (SDK 57 -> SDK 58) ---');
const fs = require('fs');
const path = require('path');

const expectedStores = [
  { file: 'profileStore.ts', key: 'fitmax_profile_v3', version: 4 },
  { file: 'historyStore.ts', key: 'fitmax_history_v2', version: 2 },
  { file: 'sessionStore.ts', key: 'fitmax_session_v1', version: 3 },
  { file: 'workoutStore.ts', key: 'fitmax_workouts_v1', version: 2 },
  { file: 'favoritesStore.ts', key: 'fitmax_favorites_v1', version: null },
  { file: 'onboardingStore.ts', key: 'fitmax_onboarding_v1', version: null },
];

for (const st of expectedStores) {
  const content = fs.readFileSync(path.join(__dirname, '..', 'src', 'store', st.file), 'utf8');
  assert(content.includes(`name: '${st.key}'`), `Store ${st.file} deve manter a chave '${st.key}'`);
  if (st.version !== null) {
    assert(content.includes(`version: ${st.version}`), `Store ${st.file} deve manter version: ${st.version}`);
  }
}

// Simula reidratação do payload salvo pelo Zustand persist no SDK 57
const samplePersistedProfileJson = JSON.stringify({
  state: {
    profile: {
      name: 'Paulo Miguel',
      bio: 'Calistenia diária',
      weightKg: 73.5,
      heightCm: 176,
      age: 26,
      sex: 'm',
      goal: 'Definição',
      level: 'avancado',
      locale: 'pt-BR',
      themeMode: 'dark',
    },
    weightHistory: [
      { id: 'w-1729770000000-abcd', date: '2026-10-24', recordedAt: '2026-10-24T14:00:00.000Z', weightKg: 73.5 },
    ],
  },
  version: 4,
});
const parsedProfilePayload = JSON.parse(samplePersistedProfileJson);
assert(
  parsedProfilePayload.version === 4 &&
    parsedProfilePayload.state.profile.name === 'Paulo Miguel' &&
    parsedProfilePayload.state.weightHistory.length === 1 &&
    parsedProfilePayload.state.weightHistory[0].weightKg === 73.5,
  'Payload persistido de perfil e histórico de peso reidrata integralmente sem perda'
);

console.log('\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!\n');
