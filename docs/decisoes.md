# Registro de Decisões Técnicas e de Produto: FitMax

## 1. Fonte de Dados e Animações dos Exercícios
- **Modelo de Dados Escolhido:** Padrão ExerciseDB (`id`, `name`, `bodyPart`, `equipment`, `target`, `secondaryMuscles`, `instructions`, `gifUrl`).
- **Resiliência e Funcionamento Offline-First:**
  - O app foi projetado com uma base curada offline de alta qualidade integrada diretamente no projeto (`services/bundledExercises.ts`), contendo dezenas de exercícios populares e rigorosamente filtrados sem equipamento com animações animadas demonstrativas em CDN confiável e estável.
  - O app suporta consumo dinâmico via API (ExerciseDB via RapidAPI) quando a variável de ambiente `EXPO_PUBLIC_RAPIDAPI_KEY` estiver configurada no arquivo `.env`.
  - **Aviso sobre variáveis `EXPO_PUBLIC_*`:** Variáveis prefixadas com `EXPO_PUBLIC_` são embutidas no bundle JavaScript do cliente Expo e podem ser inspecionadas em produção. Para produção estrita de nível enterprise, recomenda-se um proxy BFF; para o protótipo e uso individual no Expo Go, o modelo `.env` com `EXPO_PUBLIC_` atende aos requisitos do projeto com total isolamento.
  - **Garantia de Não-Ruptura:** Se a API externa estiver fora do ar, sem internet, ou sem chave configurada, o app faz fallback instantâneo e transparente para o catálogo local embutido, garantindo que o usuário nunca encontre tela quebrada.

## 2. Filtro Rigoroso para Exercícios Sem Equipamento (Home-Friendly)
- **Critério Principal:** O campo `equipment` deve ser estritamente igual a `"body weight"`.
- **Filtro de Exclusão Adicional (`config/home-friendly.ts`):**
  - Na base original da ExerciseDB, a etiqueta `"body weight"` inclui exercícios que dependem de equipamentos fixos de calistenia ou academia, como barra de tração fixa (*pull-up bar*), banco (*bench*), barras paralelas (*parallel bars / dip station*), argolas (*gymnastic rings*) ou caixas de salto (*box/plyo box*).
  - Foi implementado um analisador que varre o nome do exercício e a lista de instruções por termos proibidos: `pull-up bar`, `chin-up bar`, `bench`, `parallel bar`, `dip bar`, `dip station`, `gymnastic rings`, `suspension`, `pullup`, `barbell`, `dumbbell`, `machine`.
  - **Exercícios Permitidos:** Apenas movimentos que utilizam o peso corporal exclusivo sobre o chão, com apoio de parede (*wall*) ou espaço livre (flexões/push-ups, agachamentos/squats, pranchas/planks, burpees, abdominais/crunches, lunges, mountain climbers, pontes/glute bridges, polichinelos/jumping jacks, etc.).
  - **Quantificação de Exclusão:** No catálogo da base, de 325 exercícios classificados originalmente como `body weight`, o filtro estrito identificou e removeu exatamente **97 exercícios** que exigiam estruturas externas (como barras de tração, barras paralelas de mergulho, bancos de academia, caixas de salto ou suspensão TRX). Restaram **228 exercícios 100% livres e executáveis em casa** no chão ou contra a parede.
  - **Tratamento de Categorias com Menos de 6 Exercícios:**
    - `neck` (2 exercícios), `lower arms` (3 exercícios) e `shoulders` (2 exercícios) ficaram abaixo da cláusula de corte de 6 exercícios.
    - Decisão tomada: `neck` e `lower arms` foram ocultados do grid principal de categorias para preservar a densidade de conteúdo de alta qualidade; os exercícios de ombros livres (deltoides) foram integrados ao grupo de empurrar/tronco superior (`chest` / `upper arms`).
    - As 7 categorias ativas no app possuem ampla variedade: `waist` (67), `upper legs` (61), `back` (25), `chest` (23), `cardio` (21), `upper arms` (13) e `lower legs` (11). Todas superam com folga a meta de 6 exercícios.

## 3. Correção de Bugs da Referência Visual
- No vídeo de referência (Tela 0), o texto dizia `"Best Wroktouts For you"`. No FitMax, o texto foi corrigido para `"Best Workouts For you"`.
- Na Tela 2 do vídeo de referência, a categoria dizia `"back exercises"`, mas listava exercícios de cardio (`astride jumps`, `burpee`). No FitMax, cada categoria filtra e exibe estritamente os exercícios correspondentes àquela parte do corpo.

## 4. Botão de Sino na Home (Resumo da Semana Salvo + Dias Seguidos Logado)
- O aplicativo de referência possui um ícone de sino abaixo do avatar, implementado como o **Resumo da Semana** (`WeeklyInsightsSheet`).
- Todas as informações do resumo semanal, incluindo a lista de datas em que o usuário acessou o app (`loginDates`) e o snapshot do resumo semanal (`savedWeeklySummary`), são salvas automaticamente via Zustand `persist` (`fitmax_history_v2`, `version: 2`, com função `migrate`).
- Ao abrir o app ou tocar no sino, o dia atual (em fuso horário local `YYYY-MM-DD`) é contabilizado em `loginDates` e a sequência de **Dias Seguidos Logado** (`loginStreakDays`) é calculada e exibida em destaque ao lado dos treinos concluídos e do tempo ativo.

## 5. Cronômetro de Alta Precisão
- Para evitar drift decorrente do congelamento de threads ou suspensão em segundo plano, o cronômetro não acumula `+1` a cada intervalo de tempo. Ele registra o timestamp inicial (`Date.now()`) e calcula o delta em tempo real (`Date.now() - startTime + accumulatedPausedTime`).
- A tela permanece ativa durante a contagem utilizando `expo-keep-awake`.

## 6. Internacionalização Completa (i18n Bidirecional PT-BR / EN)
- Toda a interface gráfica, botões, modais, alertas, títulos e unidades estão traduzidos em `src/i18n/pt-BR.ts` (padrão) e `src/i18n/en.ts`.
- Todos os **226 exercícios embutidos** possuem tradução completa de nomes, músculos-alvo, músculos secundários (`src/utils/exerciseLocalization.ts`) e instruções passo a passo em português (`src/utils/exerciseInstructionsPt.ts`), alternando instantaneamente conforme o idioma selecionado pelo usuário.

## 7. Evolução deste Ciclo (Seção 5A Customizada)
1. **Resumo da Semana com Persistência e Dias Seguidos Logado:** Adicionados `loginDates`, `savedWeeklySummary` e `recordLoginToday()` em `src/store/historyStore.ts` com `version: 2` e `migrate`, exibindo a sequência de dias seguidos logado e gráfico diário diferenciado (dias logados vs. dias com treino concluído) em `src/components/ui/WeeklyInsightsSheet.tsx`.
2. **Ícone e Visual de Abertura Temáticos:** Gerados novos assets PNG em `assets/images/` (`icon.png`, `splash-icon.png`, `android-icon-foreground.png`, `android-icon-background.png`, `android-icon-monochrome.png`, `favicon.png`) com fundo Obsidian Deep (`#0D0F12`) e emblema de haltere/calistenia em Carmine Red (`#FF2A55`), configurados em `app.json` e acompanhados de tela de abertura temática em `src/app/_layout.tsx`.
3. **Deletar Série na Área de Treino:** Implementada a ação `removeSet(exerciseId)` em `src/store/sessionStore.ts` (`version: 2` com `migrate`) e o botão **Deletar série** (`t.sessionRemoveSet`) em `src/app/workout/[id]/session.tsx`, mantendo o mínimo seguro de 1 série por exercício.
4. **Evolução de Peso com Data, Hora e Gráfico Real:** Cada registro em `WeightEntry` agora armazena `recordedAt` (ISO timestamp com data e hora exatas). `addWeightEntry` em `src/store/profileStore.ts` (`version: 2` com `migrate`) preserva o histórico cronológico completo de pesagens para que todas as alterações apareçam imediatamente na curva SVG (`src/components/charts/WeightChart.tsx`) com valores em `kg`, variação acumulada e rótulos de data e hora.
5. **Atalho para Histórico de Treinos na Aba de Treinos:** Adicionado card de atalho em destaque e botão rápido no cabeçalho de `src/app/(tabs)/workouts.tsx` levando diretamente para `/history`.
6. **Nível do Usuário e Descrição (Bio) no Perfil:** Adicionado o campo `bio` ao tipo `Profile`, seletor interativo de nível (`Iniciante`, `Intermediário`, `Avançado`) e campo de descrição pessoal no cabeçalho e formulário de edição em `src/app/(tabs)/profile.tsx`.
7. **Alternância entre Modo Escuro e Modo Claro (`themeMode`):** Persistido em `useProfileStore` (`version: 3` com `migrate`) e consumido globalmente via `useAppTheme`, com botão rápido (Sol/Lua) no cabeçalho da Home (`src/components/ui/Header.tsx`) e seletor dedicado na tela de Perfil (`src/app/(tabs)/profile.tsx`).
8. **Descanso entre Séries (Cálculo por Horário em 2º Plano/Tela Travada):** Configurável por treino (`defaultRestSeconds`) e por exercício (`restSeconds`) em `src/app/workout/new.tsx`, `src/app/workout/[id]/edit.tsx` e `src/app/workout/[id]/session.tsx`. Ao marcar uma série como feita, grava o timestamp absoluto `restEndsAt = Date.now() + durationMs` em `useSessionStore` (`version: 3`) e sincroniza com `AppState`, exibindo `TimerRing` animado, botões de `+15 s` e `Pular descanso`, e disparando haptics + som curto ao terminar.
9. **Modo Contagem Regressiva por Exercício (`useCountdown` + `expo-audio`):** Implementado o hook `src/hooks/useCountdown.ts` e o utilitário `src/utils/sound.ts` utilizando `createAudioPlayer` do pacote oficial `expo-audio` (SDK 58) com assets WAV locais offline (`assets/sounds/beep-start.wav` e `beep-finish.wav`) e `expo-haptics`, disponível tanto na tela de cronômetro do exercício (`src/app/exercise-timer/[id].tsx`) quanto durante a sessão de treino (`src/app/workout/[id]/session.tsx`).

## 8. Migração Completa: Expo SDK 57 → Expo SDK 58
1. **Runtime e Stack Atualizados (SDK 58):**
   - `expo`: `~57.0.31` → `~58.0.22`
   - `react` / `react-dom`: `19.2.3` → `19.3.0`
   - `react-native`: `0.86.3` → `0.88.1`
   - `expo-router`: `~57.0.29` → `~58.0.29`
   - `react-native-reanimated`: `4.5.1` → `4.7.1`
   - `react-native-worklets`: `0.10.1` → `0.13.0` (com `overrides` na raiz do `package.json` garantindo cópia única em toda a árvore)
   - `react-native-gesture-handler`: `~2.32.0` → `~3.3.0`
   - `expo-image`: `~57.0.5` → `~58.0.18`
2. **Decisões Técnicas da Migração:**
   - **TypeScript Estrito (React Native 0.88):** Zero uso de `any`, `@ts-ignore` ou flag de adiamento (`react-native-legacy-deep-imports`). As props removidas `backgroundColor` e `translucent` do `StatusBar` do React Native foram removidas em `src/app/_layout.tsx` e `src/app/welcome.tsx`.
   - **Expo Router 58 (`CustomTabBar` e `usePreventRemove`):** A barra de abas customizada (`src/components/ui/CustomTabBar.tsx`) foi atualizada para a nova assinatura do React Navigation v8 / `standard-navigation` no `expo-router@58.0.29` (`emitter.emit` e `navigateToTab(route.key)`). Na sessão de treino (`src/app/workout/[id]/session.tsx`), foi integrado o hook `usePreventRemove` de `expo-router` com `{ repeat }` e `disablePrevention()`.
   - **Janelas Redimensionáveis (iOS 27 / Android Multi-Janela):** Todas as leituras estáticas `Dimensions.get('window')` em nível de módulo foram migradas para `useWindowDimensions()` dentro dos componentes.
   - **Android R8 e `compileSdkVersion`:** No SDK 58, o R8 vem habilitado por padrão em builds de release Android (não afeta o Expo Go, apenas futuros builds de loja). Não há pin manual de `compileSdkVersion`.
   - **Integridade dos Dados Persistidos:** Nenhuma chave, `name`, `version` ou função `migrate` dos 6 stores Zustand (`src/store/*.ts`) foi alterada (`git diff pre-sdk-58 -- src/store/` vazio).
   - **Dívida Técnica / Itens Adiados:** Nenhuma dívida técnica de código foi introduzida (não foi necessário usar `enableLegacyHeaderAppearance()` nem flag de tipos legados).
