import { Exercise } from '@/types';
import { BUNDLED_EXERCISES } from '@/services/bundledExercises';
import { EXERCISE_INSTRUCTIONS_PT } from './exerciseInstructionsPt';

const BUNDLED_INSTRUCTIONS_EN_BY_ID: Record<string, string[]> = Object.fromEntries(
  BUNDLED_EXERCISES.map((ex) => [String(ex.id).padStart(4, '0'), ex.instructions])
);

/**
 * Dicionário completo de tradução de todos os 226 exercícios do catálogo para Português
 */
export const EXERCISE_NAME_TRANSLATIONS: Record<string, string> = {
  // Todos os 226 exercícios do catálogo (bundledExercises.ts)
  '3/4 sit-up': 'Abdominal 3/4',
  '45° side bend': 'Inclinação Lateral de Tronco 45°',
  'air bike': 'Abdominal Bicicleta no Ar',
  'all fours squad stretch': 'Alongamento de Quadríceps em 4 Apoios',
  'alternate heel touchers': 'Toque Alternado nos Calcanhares',
  'ankle circles': 'Rotação Circular de Tornozelos',
  'archer push up': 'Flexão Arqueiro',
  'arms apart circular toe touch (male)': 'Toque Circular nos Pés com Braços Abertos',
  'arms overhead full sit-up (male)': 'Abdominal Completo com Braços Acima da Cabeça',
  'astride jumps (male)': 'Saltos Laterais Afastados (Astride)',
  'back and forth step': 'Passo Dinâmico Frente e Trás',
  'back pec stretch': 'Alongamento de Peitoral e Costas',
  'backward jump': 'Salto para Trás',
  'balance board': 'Equilíbrio Unilateral Estático',
  'basic toe touch (male)': 'Toque Básico na Ponta dos Pés',
  'bear crawl': 'Caminhada do Urso',
  'bent knee lying twist (male)': 'Torção Lombar Deitado com Joelhos Flexionados',
  'bodyweight drop jump squat': 'Agachamento com Salto e Queda Rápida',
  'bodyweight incline side plank': 'Prancha Lateral Inclinada',
  'bodyweight kneeling triceps extension': 'Extensão de Tríceps Ajoelhado',
  'bodyweight side lying biceps curl': 'Rosca Bíceps Deitado de Lado na Coxa',
  'bodyweight squatting row (with towel)': 'Remada em Agachamento Isométrico',
  'bodyweight standing calf raise': 'Elevação de Panturrilha em Pé',
  'bodyweight standing close-grip row': 'Remada em Pé com Pegada Fechada',
  'bodyweight standing one arm row (with towel)': 'Remada Unilateral em Pé',
  'bodyweight standing row': 'Remada Corporal em Pé',
  'bodyweight standing row (with towel)': 'Remada Corporal Bilateral em Pé',
  'bottoms-up': 'Elevação de Quadril no Solo (Bottoms-Up)',
  'bridge - mountain climber (cross body)': 'Ponte com Escalador Cruzado',
  'burpee': 'Burpee Completo',
  'butt-ups': 'Elevação de Quadril em Prancha',
  'butterfly yoga pose': 'Postura da Borboleta (Alongamento)',
  'calf push stretch with hands against wall': 'Alongamento de Panturrilha Empurrando a Parede',
  'calf stretch with hands against wall': 'Alongamento de Panturrilha na Parede',
  'captains chair straight leg raise': 'Elevação de Pernas Estendidas',
  'chair leg extended stretch': 'Alongamento de Perna Estendida Sentado',
  'chest and front of shoulder stretch': 'Alongamento de Peitoral e Ombro Frontal',
  'chest tap push-up (male)': 'Flexão Explosiva com Toque no Peito',
  'circles knee stretch': 'Rotação Circular de Joelhos',
  'clock push-up': 'Flexão Relógio',
  'close-grip push-up': 'Flexão com Pegada Fechada',
  'close-grip push-up (on knees)': 'Flexão Fechada com Joelhos Apoiados',
  'cocoons': 'Abdominal Casulo (Cocoon)',
  'crab twist toe touch': 'Toque Alternado nos Pés em Ponte (Caranguejo)',
  'cross body crunch': 'Abdominal Cruzado',
  'crunch (hands overhead)': 'Abdominal Crunch com Braços Acima da Cabeça',
  'crunch floor': 'Abdominal Supra no Solo',
  'curl-up': 'Abdominal Curto (Curl-Up)',
  'curtsey squat': 'Agachamento Reverência (Cortesia)',
  'dead bug': 'Inseto Morto (Dead Bug)',
  'decline push-up': 'Flexão Declinada',
  'diamond push-up': 'Flexão Diamante',
  'donkey calf raise': 'Elevação de Panturrilha Inclinada',
  'drop push up': 'Flexão com Queda Explosiva',
  'dynamic chest stretch (male)': 'Alongamento Dinâmico de Peitoral',
  'elbow lift - reverse push-up': 'Flexão Reversa com Apoio de Cotovelos',
  'elbow-to-knee': 'Abdominal Cotovelo no Joelho',
  'elevator': 'Elevação Invertida de Tronco (Elevator)',
  'flag': 'Bandeira Humana (Human Flag)',
  'flexion leg sit up (bent knee)': 'Abdominal com Flexão de Pernas (Joelho Dobrado)',
  'flexion leg sit up (straight arm)': 'Abdominal com Flexão de Pernas e Braços Estendidos',
  'flutter kicks': 'Pernada Alternada de Bruços (Flutter Kicks)',
  'forward jump': 'Salto Horizontal para Frente',
  'forward lunge (male)': 'Avanço Frontal (Afundo)',
  'frog crunch': 'Abdominal Sapo (Frog Crunch)',
  'frog planche': 'Prancha Sapo Isométrica (Frog Planche)',
  'front plank with twist': 'Prancha Frontal com Rotação de Tronco',
  'full maltese': 'Prancha Maltês Completa',
  'full planche': 'Planche Completa Isométrica',
  'full planche push-up': 'Flexão em Planche Completa',
  'gironda sternum chin': 'Puxada Esterno (Gironda)',
  'glute bridge march': 'Ponte de Glúteos com Marcha Alternada',
  'glute-ham raise': 'Elevação de Glúteos e Posteriores',
  'groin crunch': 'Abdominal com Elevação de Pernas Juntas',
  'half knee bends (male)': 'Meio Agachamento Unilateral Alternado',
  'half sit-up (male)': 'Meio Abdominal no Solo',
  'hamstring stretch': 'Alongamento de Posteriores de Coxa',
  'hands clasped circular toe touch (male)': 'Toque Circular nos Pés com Mãos Entrelaçadas',
  'hands reversed clasped circular toe touch (male)': 'Toque Circular nos Pés com Mãos Invertidas',
  'handstand': 'Parada de Mãos (Bananeira)',
  'handstand push-up': 'Flexão na Parada de Mãos',
  'high knee against wall': 'Corrida com Joelhos Altos na Parede',
  'hip raise (bent knee)': 'Elevação Pélvica com Joelhos Flexionados',
  'hug keens to chest': 'Abraço de Joelhos ao Peito',
  'inchworm': 'Caminhada Minhoca (Inchworm)',
  'inchworm v. 2': 'Caminhada Minhoca Avançada',
  'incline push-up (on box)': 'Flexão Inclinada em Apoio Elevado',
  'iron cross stretch': 'Alongamento Cruz de Ferro no Solo',
  'isometric chest squeeze': 'Contração Isométrica de Peitoral',
  'jack burpee': 'Burpee com Polichinelo',
  'jack jump (male)': 'Salto Canivete com Toque nos Pés',
  'jackknife sit-up': 'Abdominal Canivete (Jackknife)',
  'janda sit-up': 'Abdominal Janda',
  'jump squat': 'Agachamento com Salto',
  'jump squat v. 2': 'Agachamento Explosivo com Salto',
  'knee touch crunch': 'Abdominal com Toque nos Joelhos',
  'kneeling lat stretch': 'Alongamento de Dorsais Ajoelhado',
  'kneeling plank tap shoulder (male)': 'Prancha Ajoelhada com Toque no Ombro',
  'kneeling push-up (male)': 'Flexão de Braços Ajoelhada',
  'l-sit on floor': 'Esquadro L-Sit no Solo',
  'lean planche': 'Inclinação Frontal em Planche',
  'left hook. boxing': 'Cruzado de Esquerda (Boxe Sombra)',
  'leg up hamstring stretch': 'Alongamento de Posterior com Perna Elevada',
  'low glute bridge on floor': 'Ponte de Glúteos Baixa no Solo',
  'lower back curl': 'Extensão Lombar no Solo',
  'lunge with jump': 'Afundo Alternado com Salto',
  'lunge with twist': 'Afundo com Rotação de Tronco',
  'lying (side) quads stretch': 'Alongamento de Quadríceps Deitado de Lado',
  'lying elbow to knee': 'Abdominal Deitado Cotovelo ao Joelho',
  'lying leg-hip raise': 'Elevação de Pernas e Quadril Deitado',
  'march sit (wall)': 'Cadeira na Parede com Marcha Alternada',
  'modified hindu push-up (male)': 'Flexão Hindu Modificada',
  'modified push up to lower arms': 'Flexão Modificada para os Antebraços',
  'mountain climber': 'Escalador no Solo (Mountain Climber)',
  'negative crunch': 'Abdominal Excêntrico (Negativo)',
  'oblique crunch v. 2': 'Abdominal Oblíquo Alternado',
  'oblique crunches floor': 'Abdominal Oblíquo no Solo',
  'one arm against wall': 'Alongamento Unilateral de Dorsal na Parede',
  'one arm towel row': 'Remada Unilateral com Apoio',
  'one leg donkey calf raise': 'Elevação de Panturrilha Unilateral Inclinada',
  'one leg floor calf raise': 'Elevação de Panturrilha Unilateral no Solo',
  'one leg squat': 'Agachamento Unilateral com Apoio Traseiro',
  'outside leg kick push-up': 'Flexão com Chute Lateral',
  'overhead triceps stretch': 'Alongamento de Tríceps Acima da Cabeça',
  'pelvic tilt': 'Inclinação Pélvica no Solo',
  'pelvic tilt into bridge': 'Inclinação Pélvica com Elevação em Ponte',
  'pike-to-cobra push-up': 'Flexão Pike para Postura da Cobra',
  'posterior step to overhead reach': 'Passo Recuado com Alcance Acima da Cabeça',
  'potty squat': 'Agachamento Profundo Livre',
  'potty squat with support': 'Agachamento Profundo com Apoio',
  'power point plank': 'Prancha com Alcance Frontal de Braço',
  'prisoner half sit-up (male)': 'Meio Abdominal Prisioneiro',
  'push and pull bodyweight': 'Empurre e Puxada Dinâmica em Pé',
  'push to run': 'Impulso de Corrida com Joelho Alto',
  'push-up': 'Flexão de Braço Tradicional',
  'push-up (wall)': 'Flexão de Braço na Parede',
  'push-up (wall) v. 2': 'Flexão Inclinada na Parede',
  'push-up inside leg kick': 'Flexão com Chute Cruzado',
  'push-up on lower arms': 'Flexão nos Antebraços',
  'push-up plus': 'Flexão Plus (Protração Escapular)',
  'push-up to side plank': 'Flexão com Transição para Prancha Lateral',
  'quads': 'Extensão Reversa de Quadríceps Ajoelhado',
  'quarter sit-up': 'Abdominal Curto (1/4)',
  'quick feet v. 2': 'Passos Rápidos no Lugar (Quick Feet)',
  'raise single arm push-up': 'Flexão com Elevação de Braço Unilateral',
  'rear decline bridge': 'Ponte Invertida de Mãos e Pés',
  'rear deltoid stretch': 'Alongamento de Deltoide Posterior',
  'reverse crunch': 'Abdominal Invertido',
  'reverse plank with leg lift': 'Prancha Invertida com Elevação de Perna',
  'rocking frog stretch': 'Alongamento Sapo com Balanço',
  'run': 'Corrida Estacionária',
  'run (equipment)': 'Corrida Estacionária Contínua',
  'runners stretch': 'Alongamento do Corredor',
  'russian twist': 'Giro Russo (Russian Twist)',
  'scapula dips': 'Mergulho Escapular',
  'scapula push-up': 'Flexão Escapular',
  'scissor jumps (male)': 'Saltos Tesoura Alternados',
  'seated glute stretch': 'Alongamento de Glúteos Sentado',
  'seated lower back stretch': 'Alongamento Lombar Sentado',
  'seated piriformis stretch': 'Alongamento de Piriforme Sentado',
  'seated side crunch (wall)': 'Abdominal Lateral Sentado na Parede',
  'seated wide angle pose sequence': 'Alongamento Sentado com Pernas Afastadas',
  'self assisted inverse leg curl': 'Flexão Nórdica Reversa de Posteriores',
  'self assisted inverse leg curl (on floor)': 'Flexão Nórdica Assistida no Solo',
  'semi squat jump (male)': 'Salto com Meio Agachamento',
  'short stride run': 'Corrida de Passadas Curtas',
  'shoulder tap': 'Prancha com Toque Alternado nos Ombros',
  'shoulder tap push-up': 'Flexão com Toque nos Ombros',
  'side bridge hip abduction': 'Prancha Lateral com Abdução de Quadril',
  'side bridge v. 2': 'Prancha Lateral Isométrica',
  'side hip abduction': 'Abdução Lateral de Quadril no Solo',
  'side lying floor stretch': 'Alongamento Lateral no Solo',
  'side lying hip adduction (male)': 'Adução de Quadril Deitado de Lado',
  'side plank hip adduction': 'Prancha Lateral com Adução de Quadril',
  'side push-up': 'Flexão Lateral Unilateral',
  'side wrist pull stretch': 'Alongamento Lateral de Punho e Antebraço',
  'side-to-side toe touch (male)': 'Toque Alternado nos Pés Lado a Lado',
  'single arm push-up': 'Flexão de Braço Unilateral',
  'single leg bridge with outstretched leg': 'Ponte Unilateral com Perna Estendida',
  'single leg platform slide': 'Deslizamento Unilateral de Calcanhar no Solo',
  'single leg squat (pistol) male': 'Agachamento Unilateral (Pistol Squat)',
  'sissy squat': 'Agachamento Sissy',
  'sit-up v. 2': 'Abdominal Tradicional Completo',
  'sit-up with arms on chest': 'Abdominal com Braços Cruzados no Peito',
  'skater hops': 'Saltos Laterais Patinador',
  'ski step': 'Passo de Esqui Lateral',
  'skin the cat': 'Giro Corporal Completo',
  'sphinx': 'Postura da Esfinge (Extensão Lombar)',
  'spider crawl push up': 'Flexão Homem-Aranha',
  'spine stretch': 'Alongamento de Coluna Sentado',
  'spine twist': 'Rotação de Coluna Sentado',
  'split squats': 'Agachamento Afundo Estático (Split Squat)',
  'squat to overhead reach': 'Agachamento com Alcance Acima da Cabeça',
  'squat to overhead reach with twist': 'Agachamento com Alcance e Giro de Tronco',
  'stalder press': 'Elevação Stalder para Parada de Mãos',
  'standing archer': 'Rotação de Tronco Arqueiro em Pé',
  'standing calf raise (on a staircase)': 'Elevação de Panturrilha no Degrau',
  'standing calves': 'Elevação de Panturrilhas em Pé',
  'standing calves calf stretch': 'Alongamento de Panturrilha no Degrau',
  'standing lateral stretch': 'Alongamento Lateral de Tronco em Pé',
  'standing pelvic tilt': 'Inclinação Pélvica em Pé',
  'standing single leg curl': 'Flexão de Joelho Unilateral em Pé',
  'star jump (male)': 'Salto Estrela Explosivo',
  'straddle maltese': 'Prancha Maltês com Pernas Afastadas',
  'straddle planche': 'Planche com Pernas Afastadas',
  'straight leg outer hip abductor': 'Abdução de Quadril em Pé com Perna Estendida',
  'superman push-up': 'Flexão Pliométrica Superman',
  'swimmer kicks v. 2 (male)': 'Pernada de Nadador no Solo (Superman)',
  'swing 360': 'Balanço Dinâmico com Giro (Swing 360°)',
  'triceps press': 'Extensão de Tríceps Inclinado no Apoio',
  'triceps stretch': 'Alongamento de Tríceps',
  'tuck crunch': 'Abdominal Agrupado (Tuck Crunch)',
  'twist hip lift': 'Elevação de Quadril Cruzada com Giro',
  'twisted leg raise': 'Elevação de Pernas com Rotação de Quadril',
  'twisted leg raise (female)': 'Elevação de Joelhos com Rotação Lateral',
  'two toe touch (male)': 'Toque Simultâneo na Ponta dos Pés',
  'upper back stretch': 'Alongamento da Parte Superior das Costas',
  'upward facing dog': 'Postura do Cachorro Olhando para Cima',
  'v-sit on floor': 'Abdominal Isométrico em V (V-Sit)',
  'walking high knees lunge': 'Avanço Caminhando com Elevação de Joelho',
  'walking lunge': 'Avanço Caminhando (Passada)',
  'wheel run': 'Corrida com Ciclo Circular (Wheel Run)',
  'wide hand push up': 'Flexão de Braços com Pegada Aberta',
  'wind sprints': 'Abdominal Pedalada Aérea (Wind Sprints)',
  'world greatest stretch': 'Alongamento Dinâmico em Afundo e Pirâmide',
  'wrist circles': 'Rotação Circular de Punhos',

  // Variações extras e apelidos comuns
  'push up': 'Flexão de Braço Tradicional',
  'plank': 'Prancha Isométrica Frontal',
  'side plank': 'Prancha Lateral',
  'sit-up': 'Abdominal Completo',
  'squat': 'Agachamento Livre',
  'air squat': 'Agachamento Livre',
  'wall sit': 'Cadeira Isométrica na Parede',
  'glute bridge': 'Ponte de Glúteos',
  'jumping jack': 'Polichinelo',
  'high knees': 'Corrida com Joelhos Altos',
  'butt kicks': 'Corrida Calcanhar no Glúteo',
};

/**
 * Mapeamento de nome em inglês (lowercase) -> ID do exercício em bundledExercises
 * para permitir busca rápida das instruções traduzidas mesmo quando apenas o nome ou texto está disponível.
 */
export const EXERCISE_NAME_TO_ID: Record<string, string> = {
  '3/4 sit-up': '0001',
  '45° side bend': '0002',
  'air bike': '0003',
  'all fours squad stretch': '1512',
  'alternate heel touchers': '0006',
  'ankle circles': '1368',
  'archer push up': '3294',
  'arms apart circular toe touch (male)': '3214',
  'arms overhead full sit-up (male)': '3204',
  'astride jumps (male)': '3220',
  'back and forth step': '3672',
  'back pec stretch': '1405',
  'backward jump': '1473',
  'balance board': '0020',
  'basic toe touch (male)': '3212',
  'bear crawl': '3360',
  'bent knee lying twist (male)': '3639',
  'bodyweight drop jump squat': '3543',
  'bodyweight incline side plank': '3544',
  'bodyweight kneeling triceps extension': '1771',
  'bodyweight side lying biceps curl': '1769',
  'bodyweight squatting row (with towel)': '3167',
  'bodyweight standing calf raise': '1373',
  'bodyweight standing close-grip row': '3158',
  'bodyweight standing one arm row (with towel)': '3161',
  'bodyweight standing row': '3166',
  'bodyweight standing row (with towel)': '3165',
  'bottoms-up': '0138',
  'bridge - mountain climber (cross body)': '2466',
  'burpee': '1160',
  'butt-ups': '0870',
  'butterfly yoga pose': '1494',
  'calf push stretch with hands against wall': '1407',
  'calf stretch with hands against wall': '1377',
  'captains chair straight leg raise': '2963',
  'chair leg extended stretch': '1548',
  'chest and front of shoulder stretch': '1271',
  'chest tap push-up (male)': '3216',
  'circles knee stretch': '0257',
  'clock push-up': '0258',
  'close-grip push-up': '0259',
  'close-grip push-up (on knees)': '2398',
  'cocoons': '0260',
  'crab twist toe touch': '1468',
  'cross body crunch': '0262',
  'crunch (hands overhead)': '0267',
  'crunch floor': '0274',
  'curl-up': '3016',
  'curtsey squat': '3769',
  'dead bug': '0276',
  'decline push-up': '0279',
  'diamond push-up': '0283',
  'donkey calf raise': '0284',
  'drop push up': '1275',
  'dynamic chest stretch (male)': '1167',
  'elbow lift - reverse push-up': '1772',
  'elbow-to-knee': '0443',
  'elevator': '3292',
  'flag': '3303',
  'flexion leg sit up (bent knee)': '0456',
  'flexion leg sit up (straight arm)': '0457',
  'flutter kicks': '0459',
  'forward jump': '1472',
  'forward lunge (male)': '3470',
  'frog crunch': '2429',
  'frog planche': '3301',
  'front plank with twist': '0464',
  'full maltese': '3315',
  'full planche': '3299',
  'full planche push-up': '3327',
  'gironda sternum chin': '0466',
  'glute bridge march': '3561',
  'glute-ham raise': '3193',
  'groin crunch': '0469',
  'half knee bends (male)': '3221',
  'half sit-up (male)': '3202',
  'hamstring stretch': '1511',
  'hands clasped circular toe touch (male)': '3218',
  'hands reversed clasped circular toe touch (male)': '3215',
  'handstand': '3302',
  'handstand push-up': '0471',
  'high knee against wall': '3636',
  'hip raise (bent knee)': '0484',
  'hug keens to chest': '1418',
  'inchworm': '1471',
  'inchworm v. 2': '3698',
  'incline push-up (on box)': '3785',
  'iron cross stretch': '1419',
  'isometric chest squeeze': '1297',
  'jack burpee': '0501',
  'jack jump (male)': '3224',
  'jackknife sit-up': '0507',
  'janda sit-up': '0508',
  'jump squat': '0514',
  'jump squat v. 2': '0513',
  'knee touch crunch': '3640',
  'kneeling lat stretch': '1346',
  'kneeling plank tap shoulder (male)': '3239',
  'kneeling push-up (male)': '3211',
  'l-sit on floor': '3419',
  'lean planche': '3300',
  'left hook. boxing': '2271',
  'leg up hamstring stretch': '1576',
  'low glute bridge on floor': '3013',
  'lower back curl': '1352',
  'lunge with jump': '3582',
  'lunge with twist': '1688',
  'lying (side) quads stretch': '0613',
  'lying elbow to knee': '2312',
  'lying leg-hip raise': '0865',
  'march sit (wall)': '0624',
  'modified hindu push-up (male)': '3217',
  'modified push up to lower arms': '1421',
  'mountain climber': '0630',
  'negative crunch': '0634',
  'oblique crunch v. 2': '1495',
  'oblique crunches floor': '0635',
  'one arm against wall': '1355',
  'one arm towel row': '1773',
  'one leg donkey calf raise': '1386',
  'one leg floor calf raise': '1387',
  'one leg squat': '1476',
  'outside leg kick push-up': '0642',
  'overhead triceps stretch': '0643',
  'pelvic tilt': '3147',
  'pelvic tilt into bridge': '1422',
  'pike-to-cobra push-up': '3662',
  'posterior step to overhead reach': '1687',
  'potty squat': '3119',
  'potty squat with support': '3132',
  'power point plank': '3665',
  'prisoner half sit-up (male)': '3203',
  'push and pull bodyweight': '1689',
  'push to run': '3638',
  'push-up': '0662',
  'push-up (wall)': '0659',
  'push-up (wall) v. 2': '0658',
  'push-up inside leg kick': '0661',
  'push-up on lower arms': '1467',
  'push-up plus': '3145',
  'push-up to side plank': '0664',
  'quads': '3533',
  'quarter sit-up': '3201',
  'quick feet v. 2': '3552',
  'raise single arm push-up': '0666',
  'rear decline bridge': '0668',
  'rear deltoid stretch': '0669',
  'reverse crunch': '0872',
  'reverse plank with leg lift': '3663',
  'rocking frog stretch': '2571',
  'run': '0685',
  'run (equipment)': '0684',
  'runners stretch': '1585',
  'russian twist': '0687',
  'scapula dips': '3012',
  'scapula push-up': '3021',
  'scissor jumps (male)': '3219',
  'seated glute stretch': '1424',
  'seated lower back stretch': '0690',
  'seated piriformis stretch': '2567',
  'seated side crunch (wall)': '0691',
  'seated wide angle pose sequence': '1587',
  'self assisted inverse leg curl': '1766',
  'self assisted inverse leg curl (on floor)': '0696',
  'semi squat jump (male)': '3222',
  'short stride run': '3656',
  'shoulder tap': '3699',
  'shoulder tap push-up': '0699',
  'side bridge hip abduction': '1774',
  'side bridge v. 2': '0705',
  'side hip abduction': '0710',
  'side lying floor stretch': '1358',
  'side lying hip adduction (male)': '3667',
  'side plank hip adduction': '1775',
  'side push-up': '0717',
  'side wrist pull stretch': '0721',
  'side-to-side toe touch (male)': '3213',
  'single arm push-up': '0725',
  'single leg bridge with outstretched leg': '3645',
  'single leg platform slide': '0730',
  'single leg squat (pistol) male': '1759',
  'sissy squat': '1489',
  'sit-up v. 2': '0735',
  'sit-up with arms on chest': '3679',
  'skater hops': '3361',
  'ski step': '3671',
  'skin the cat': '3304',
  'sphinx': '1362',
  'spider crawl push up': '0778',
  'spine stretch': '1363',
  'spine twist': '2329',
  'split squats': '2368',
  'squat to overhead reach': '1685',
  'squat to overhead reach with twist': '1686',
  'stalder press': '3291',
  'standing archer': '3669',
  'standing calf raise (on a staircase)': '1490',
  'standing calves': '1397',
  'standing calves calf stretch': '1398',
  'standing lateral stretch': '0794',
  'standing pelvic tilt': '1364',
  'standing single leg curl': '0795',
  'star jump (male)': '3223',
  'straddle maltese': '3314',
  'straddle planche': '3298',
  'straight leg outer hip abductor': '1427',
  'superman push-up': '0803',
  'swimmer kicks v. 2 (male)': '3433',
  'swing 360': '3318',
  'triceps press': '0816',
  'triceps stretch': '0817',
  'tuck crunch': '0871',
  'twist hip lift': '1466',
  'twisted leg raise': '2802',
  'twisted leg raise (female)': '2801',
  'two toe touch (male)': '3231',
  'upper back stretch': '1365',
  'upward facing dog': '1366',
  'v-sit on floor': '3420',
  'walking high knees lunge': '3655',
  'walking lunge': '1460',
  'wheel run': '3637',
  'wide hand push up': '1311',
  'wind sprints': '0858',
  'world greatest stretch': '1604',
  'wrist circles': '1428',
};

/**
 * Tradução completa de todos os Músculos Alvo e Músculos Secundários
 */
export const TARGET_TRANSLATIONS: Record<string, string> = {
  abs: 'Abdômen',
  abdominals: 'Abdominais',
  'lower abs': 'Abdômen Inferior',
  obliques: 'Oblíquos',
  core: 'Core',
  pectorals: 'Peitoral',
  chest: 'Peitoral',
  glutes: 'Glúteos',
  quads: 'Quadríceps',
  quadriceps: 'Quadríceps',
  hamstrings: 'Posteriores de Coxa',
  lats: 'Dorsais (Costas)',
  back: 'Costas',
  'upper back': 'Parte Superior das Costas',
  'lower back': 'Lombar',
  spine: 'Coluna / Lombar',
  rhomboids: 'Romboides',
  traps: 'Trapézio',
  trapezius: 'Trapézio',
  triceps: 'Tríceps',
  biceps: 'Bíceps',
  calves: 'Panturrilhas',
  delts: 'Deltoides (Ombros)',
  deltoids: 'Deltoides (Ombros)',
  'rear deltoids': 'Deltoides Posteriores',
  shoulders: 'Ombros',
  'serratus anterior': 'Serrátil Anterior',
  'cardiovascular system': 'Sistema Cardiovascular',
  cardio: 'Cardiovascular',
  adductors: 'Adutores da Coxa',
  abductors: 'Abdutores do Quadril',
  'inner thighs': 'Parte Interna da Coxa',
  groin: 'Virilha / Adutores',
  'hip flexors': 'Flexores do Quadril',
  forearms: 'Antebraços',
  wrists: 'Punhos',
  hands: 'Mãos',
  ankles: 'Tornozelos',
  'ankle stabilizers': 'Estabilizadores do Tornozelo',
  feet: 'Pés',
  waist: 'Abdômen & Core',
  'upper legs': 'Pernas & Coxas',
  'lower legs': 'Panturrilhas',
  'upper arms': 'Braços (Tríceps/Bíceps)',
};

/**
 * Divide instruções em frases individuais para exibição limpa passo a passo
 */
export function splitIntoSteps(instructions: string[]): string[] {
  if (!Array.isArray(instructions)) return [];
  const steps: string[] = [];
  for (const item of instructions) {
    if (!item) continue;
    const parts = item
      .split(/(?<=\.)\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    steps.push(...parts);
  }
  return steps;
}

/**
 * Traduz uma frase de instrução em inglês para português (fallback para frases avulsas)
 */
export function translateInstruction(instruction: string): string {
  if (!instruction) return '';

  let translated = instruction
    .replace(/Lie flat on your back with your knees bent and feet flat on the (?:ground|floor)\.?/gi, 'Deite-se de costas com os joelhos flexionados e os pés apoiados no chão.')
    .replace(/Place your hands behind your head with your elbows pointing outwards\.?/gi, 'Posicione as mãos atrás da cabeça com os cotovelos voltados para fora.')
    .replace(/Repeat for the desired number of repetitions\.?/gi, 'Repita pelo número desejado de repetições.')
    .replace(/Continue alternating sides for the desired number of repetitions\.?/gi, 'Continue alternando os lados pelo número desejado de repetições.')
    .replace(/Pause for a moment at the top, then slowly lower your (?:upper )?body back down to the starting position\.?/gi, 'Pause por um momento no topo e desça o corpo lentamente de volta à posição inicial.')
    .replace(/Pause for a moment at the bottom, then slowly return to the starting position\.?/gi, 'Pause por um instante na base e retorne lentamente à posição inicial.')
    .replace(/Stand with your feet shoulder-width apart\.?/gi, 'Fique de pé com os pés afastados na largura dos ombros.')
    .replace(/Sit on the (?:ground|floor) with your legs extended in front of you\.?/gi, 'Sente-se no chão com as pernas estendidas à sua frente.')
    .replace(/Repeat on the other side\.?/gi, 'Repita para o outro lado.')
    .replace(/Repeat with the other leg\.?/gi, 'Repita o movimento com a outra perna.')
    .replace(/Hold the stretch for (\d+-\d+) seconds\.?/gi, 'Segure o alongamento por $1 segundos.');

  return translated;
}

export function capitalizeTitle(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => {
      if (!word) return '';
      if (word.includes('-')) {
        return word
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join('-');
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

const EXERCISE_NAME_EN_OVERRIDES: Record<string, string> = {
  'all fours squad stretch': 'All Fours Quad Stretch',
  'bodyweight side lying biceps curl': 'Side-Lying Thigh Biceps Curl',
  'elevator': 'Inverted Ring Elevator Pull',
  'flutter kicks': 'Prone Glute Flutter Kicks',
  'half knee bends (male)': 'Single-Leg Half Knee Bends',
  'hug keens to chest': 'Lying Knees to Chest Stretch',
  'jack jump (male)': 'Straddle Toe-Touch Jump (Jack Jump)',
  'one arm against wall': 'Wall One-Arm Lat Stretch',
  'power point plank': 'Forearm Plank with Forward Reach',
  'push and pull bodyweight': 'Standing Dynamic Push and Pull',
  'push to run': 'Explosive Knee-Drive Run',
  'quads': 'Kneeling Reverse Quad Extension',
  'rear decline bridge': 'Reverse Tabletop Bridge',
  'side hip abduction': 'Side-Lying Hip Abduction',
  'single leg platform slide': 'Supine Single-Leg Heel Slide',
  'stalder press': 'Stalder Press to Handstand',
  'straight leg outer hip abductor': 'Standing Straight-Leg Hip Abduction',
  'swing 360': 'Dynamic Bar Swing 360°',
  'triceps press': 'Incline Bodyweight Triceps Press',
  'wheel run': 'High-Knee Circular Wheel Run',
  'wind sprints': 'Hanging Air Bicycle Sprints',
};

const LEGACY_PT_NAME_TO_KEY: Record<string, string> = {
  'rosca bíceps deitado de lado': 'bodyweight side lying biceps curl',
  'flexão elevador': 'elevator',
  'chutes tesoura alternados (flutter kicks)': 'flutter kicks',
  'meio agachamento dinâmico': 'half knee bends (male)',
  'polichinelo tradicional': 'jack jump (male)',
  'empurre isométrico unilateral na parede': 'one arm against wall',
  'agachamento unilateral': 'one leg squat',
  'prancha dinâmica (mãos e antebraços)': 'power point plank',
  'flexão com empurre e puxada corporal': 'push and pull bodyweight',
  'flexão seguida de corrida em prancha': 'push to run',
  'agachamento focado em quadríceps': 'quads',
  'ponte declinada posterior': 'rear decline bridge',
  'flexão de posteriores deslizante no solo': 'self assisted inverse leg curl (on floor)',
  'abdução lateral de quadril em pé': 'side hip abduction',
  'deslizamento unilateral de perna': 'single leg platform slide',
  'agachamento com pressão de braços': 'stalder press',
  'alongamento de panturrilha em pé': 'standing calves calf stretch',
  'abdução de quadril com perna estendida': 'straight leg outer hip abductor',
  'flexão superman': 'superman push-up',
  'giro dinâmico de braços e tronco 360°': 'swing 360',
  'extensão de tríceps corporal': 'triceps press',
  'elevação de quadril com giro lateral': 'twist hip lift',
  'extensão abdominal no solo': 'wheel run',
  'tiros de corrida rápida (sprint)': 'wind sprints',
  'alongamento global completo': 'world greatest stretch',
};

/**
 * Retorna o nome localizado do exercício (100% em Português quando pt-BR, 100% em Inglês quando en)
 */
export function getLocalizedExerciseName(name: string, locale: 'pt-BR' | 'en' = 'pt-BR'): string {
  if (!name) return '';
  const rawKey = name.toLowerCase().trim();
  const key = LEGACY_PT_NAME_TO_KEY[rawKey] || rawKey;

  if (locale === 'en') {
    if (EXERCISE_NAME_EN_OVERRIDES[key]) {
      return EXERCISE_NAME_EN_OVERRIDES[key];
    }
    for (const [eng, pt] of Object.entries(EXERCISE_NAME_TRANSLATIONS)) {
      if (pt.toLowerCase() === key) {
        if (EXERCISE_NAME_EN_OVERRIDES[eng]) {
          return EXERCISE_NAME_EN_OVERRIDES[eng];
        }
        return capitalizeTitle(eng.replace(/\((?:male|female)\)/gi, '').trim());
      }
    }
    return capitalizeTitle(key.replace(/\((?:male|female)\)/gi, '').trim());
  }

  // Busca exata no dicionário completo dos 226 exercícios
  if (EXERCISE_NAME_TRANSLATIONS[key]) {
    return EXERCISE_NAME_TRANSLATIONS[key];
  }

  // Busca sem sufixo (male)/(female) caso venha sem ele
  const cleanedKey = key.replace(/\s*\((?:male|female)\)/gi, '').trim();
  if (EXERCISE_NAME_TRANSLATIONS[cleanedKey]) {
    return EXERCISE_NAME_TRANSLATIONS[cleanedKey];
  }
  if (EXERCISE_NAME_TRANSLATIONS[`${cleanedKey} (male)`]) {
    return EXERCISE_NAME_TRANSLATIONS[`${cleanedKey} (male)`];
  }

  // Fallback seguro por palavras inteiras
  return name
    .replace(/\bpush-up\b/gi, 'Flexão')
    .replace(/\bpush up\b/gi, 'Flexão')
    .replace(/\bsit-up\b/gi, 'Abdominal')
    .replace(/\bsquat\b/gi, 'Agachamento')
    .replace(/\bburpee\b/gi, 'Burpee')
    .replace(/\bplank\b/gi, 'Prancha')
    .replace(/\blunge\b/gi, 'Afundo')
    .replace(/\bbridge\b/gi, 'Ponte')
    .replace(/\bcrunch\b/gi, 'Abdominal')
    .replace(/\bstretch\b/gi, 'Alongamento')
    .replace(/\((?:male|female)\)/gi, '')
    .trim();
}

/**
 * Retorna o músculo alvo ou secundário localizado
 */
export function getLocalizedTarget(target: string, locale: 'pt-BR' | 'en' = 'pt-BR'): string {
  if (!target) return '';
  const key = target.toLowerCase().trim();

  if (locale === 'en') {
    for (const [eng, pt] of Object.entries(TARGET_TRANSLATIONS)) {
      if (pt.toLowerCase() === key) {
        return capitalizeTitle(eng);
      }
    }
    return capitalizeTitle(target);
  }

  return TARGET_TRANSLATIONS[key] || capitalizeTitle(target);
}

/**
 * Retorna o equipamento localizado
 */
export function getLocalizedEquipment(equipment?: string, locale: 'pt-BR' | 'en' = 'pt-BR'): string {
  if (locale === 'en') {
    return 'Body Weight';
  }
  return 'Peso Corporal';
}

/**
 * Retorna o nome do treino traduzido
 */
export function getLocalizedWorkoutName(name: string, locale: 'pt-BR' | 'en' = 'pt-BR'): string {
  if (!name) return '';
  if (locale === 'en') {
    return name
      .replace(/Queima Rápida & Core em Casa/gi, 'Quick Burn & Core at Home')
      .replace(/Força de Membros Inferiores/gi, 'Lower Body Strength')
      .replace(/Treino Personalizado:/gi, 'Custom Workout:')
      .replace(/Full-Body \(Corpo Inteiro\)/gi, 'Full-Body (Whole Body)')
      .replace(/Peitoral/gi, 'Chest')
      .replace(/Abdômen & Core/gi, 'Abs & Core')
      .replace(/Abdômen e Core/gi, 'Abs & Core')
      .replace(/Costas/gi, 'Back')
      .replace(/Pernas & Glúteos/gi, 'Legs & Glutes')
      .replace(/Pernas e Glúteos/gi, 'Legs & Glutes')
      .replace(/Ombros/gi, 'Shoulders')
      .replace(/Braços/gi, 'Arms')
      .replace(/Panturrilhas/gi, 'Calves')
      .replace(/\(Iniciante\)/gi, '(Beginner)')
      .replace(/\(Intermediário\)/gi, '(Intermediate)')
      .replace(/\(Avançado\)/gi, '(Advanced)')
      .replace(/\(Cópia\)/gi, '(Copy)');
  }
  return name
    .replace(/Quick Burn & Core at Home/gi, 'Queima Rápida & Core em Casa')
    .replace(/Lower Body Strength/gi, 'Força de Membros Inferiores')
    .replace(/Custom Workout:/gi, 'Treino Personalizado:')
    .replace(/Full-Body \(Whole Body\)/gi, 'Full-Body (Corpo Inteiro)')
    .replace(/Chest/gi, 'Peitoral')
    .replace(/Abs & Core/gi, 'Abdômen & Core')
    .replace(/Back/gi, 'Costas')
    .replace(/Legs & Glutes/gi, 'Pernas & Glúteos')
    .replace(/Shoulders/gi, 'Ombros')
    .replace(/Arms/gi, 'Braços')
    .replace(/Calves/gi, 'Panturrilhas')
    .replace(/\(Beginner\)/gi, '(Iniciante)')
    .replace(/\(Intermediate\)/gi, '(Intermediário)')
    .replace(/\(Advanced\)/gi, '(Avançado)')
    .replace(/\(Copy\)/gi, '(Cópia)');
}

/**
 * Retorna as instruções localizadas passo a passo
 */
export function getLocalizedInstructions(
  instructions: string[],
  locale: 'pt-BR' | 'en' = 'pt-BR',
  exerciseId?: string,
  exerciseName?: string
): string[] {
  const paddedId = exerciseId ? String(exerciseId).padStart(4, '0') : undefined;
  const rawNameKey = exerciseName ? exerciseName.toLowerCase().trim() : '';
  const normalizedNameKey = LEGACY_PT_NAME_TO_KEY[rawNameKey] || rawNameKey;
  const resolvedId =
    paddedId || (normalizedNameKey ? EXERCISE_NAME_TO_ID[normalizedNameKey] : undefined);

  if (locale === 'en') {
    if (resolvedId && BUNDLED_INSTRUCTIONS_EN_BY_ID[resolvedId]) {
      return splitIntoSteps(BUNDLED_INSTRUCTIONS_EN_BY_ID[resolvedId]);
    }
    return splitIntoSteps(instructions);
  }

  // 1. Busca direta pelo ID do exercício no dicionário curado dos 226 exercícios
  if (exerciseId && EXERCISE_INSTRUCTIONS_PT[String(exerciseId)]) {
    return EXERCISE_INSTRUCTIONS_PT[String(exerciseId)];
  }
  if (resolvedId && EXERCISE_INSTRUCTIONS_PT[resolvedId]) {
    return EXERCISE_INSTRUCTIONS_PT[resolvedId];
  }

  // 2. Fallback: divide em passos e traduz cada frase
  return splitIntoSteps(instructions).map(translateInstruction);
}

/**
 * Retorna o exercício com todos os campos 100% adaptados para o idioma ativo
 */
export function localizeExercise(exercise: Exercise, locale: 'pt-BR' | 'en' = 'pt-BR'): Exercise {
  return {
    ...exercise,
    name: getLocalizedExerciseName(exercise.name, locale),
    target: getLocalizedTarget(exercise.target, locale),
    secondaryMuscles: (exercise.secondaryMuscles || []).map((m) => getLocalizedTarget(m, locale)),
    equipment: getLocalizedEquipment(exercise.equipment, locale),
    instructions: getLocalizedInstructions(
      exercise.instructions,
      locale,
      String(exercise.id),
      exercise.name
    ),
  };
}
