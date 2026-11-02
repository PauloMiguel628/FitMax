# Registro de Migração: Expo SDK 57 → Expo SDK 58 (FitMax)

## Fase 0 — Backup e Linha de Base (SDK 57)

### 1. Ambiente e Backup Confirmados
- **Node.js:** `v22.16.0` (Atende ao requisito do SDK 58 / React Native 0.87+: linha par `>= 22.13.0`).
- **npm:** `10.9.2`
- **Git Branch de trabalho:** `migracao-sdk-58`
- **Git Tag de snapshot pré-migração:** `pre-sdk-58`
- **Backup completo em diretório externo (sem `node_modules`):** `C:\Users\pauli\Downloads\fitness-app-backup-sdk57` (`package.json` verificado: `True`).

### 2. Árvore de Dependências no SDK 57 (`npm ls --depth=0`)
```text
fitmax@1.0.0
+-- @expo-google-fonts/outfit@0.4.3
+-- @expo-google-fonts/plus-jakarta-sans@0.4.2
+-- @expo/ui@57.0.26
+-- @expo/vector-icons@15.1.1
+-- @react-native-async-storage/async-storage@2.2.0
+-- @types/react@19.2.18
+-- eslint-config-expo@57.0.2
+-- eslint@9.39.5
+-- expo-asset@57.0.20
+-- expo-audio@57.0.5
+-- expo-constants@57.0.22
+-- expo-device@57.0.2
+-- expo-font@57.0.4
+-- expo-glass-effect@57.0.4
+-- expo-haptics@57.0.3
+-- expo-image-picker@57.0.20
+-- expo-image@57.0.5
+-- expo-keep-awake@57.0.2
+-- expo-linear-gradient@57.0.2
+-- expo-linking@57.0.13
+-- expo-router@57.0.29
+-- expo-splash-screen@57.0.10
+-- expo-status-bar@57.0.1
+-- expo-symbols@57.0.3
+-- expo-system-ui@57.0.4
+-- expo-web-browser@57.0.3
+-- expo@57.0.31
+-- react-dom@19.2.3
+-- react-native-gesture-handler@2.32.0
+-- react-native-reanimated@4.5.1
+-- react-native-safe-area-context@5.7.0
+-- react-native-screens@4.26.2
+-- react-native-svg@15.15.4
+-- react-native-web@0.21.4
+-- react-native-worklets@0.10.1
+-- react-native@0.86.3
+-- react@19.2.3
+-- typescript@6.0.3
`-- zustand@5.0.15
```

### 3. Resultado da Linha de Base no SDK 57
- **`npx tsc --noEmit`:** `0 erros`
- **`npx expo-doctor@latest`:** `21/21 checks passed. No issues detected!`
- **`npx expo install --check`:** `Dependencies are up to date`
- **`npx expo lint`:** `0 errors, 6 warnings` (avisos pré-existentes no SDK 57: `react-hooks/exhaustive-deps` em `welcome.tsx`, `CustomTabBar.tsx`, `Skeleton.tsx` e imports não usados em `BannerCarousel.tsx` e `Skeleton.tsx`).
- **Testes automatizados (`node scripts/test-calculations.js`):** `9/9 suítes passaram (100%)`.

---

## Fase 1 — Pesquisa e Mapeamento de Impacto (Seção 5)

### 1. Tabela de Varredura de Termos e Pontos de Atenção

| Item (Seção 5) | Termo / API Pesquisada | Arquivos Afetados | Ação Necessária | Status |
| :--- | :--- | :--- | :--- | :--- |
| **5.A Pré-requisitos** | `node -v` (>= 22.13) | Ambiente local | Nenhuma (`v22.16.0` já instalado e compatível) | Concluído |
| **5.B RN 0.86 → 0.88** | `InteractionManager` | Nenhum (não usado) | Nenhuma | Não usado |
| **5.B RN 0.86 → 0.88** | `Touchable` | Nenhum (não usado; app usa `Pressable`) | Nenhuma | Não usado |
| **5.B RN 0.86 → 0.88** | `NativeMethods` | Nenhum (não usado) | Nenhuma | Não usado |
| **5.B RN 0.86 → 0.88** | `ImageBackground` | Nenhum (não usado; app já usa `View` + `expo-image` com `position: 'absolute'`) | Nenhuma | Não usado |
| **5.B RN 0.86 → 0.88** | `useColorScheme` | `src/hooks/useAppTheme.ts` | Garantir fallback explícito caso valor seja `null`/`undefined` (`'dark'`) | Verificado |
| **5.B RN 0.86 → 0.88** | `StatusBar` (`backgroundColor`, `translucent`) | `src/app/_layout.tsx`, `src/app/welcome.tsx` | Remover props obsoletas `backgroundColor` e `translucent` do `StatusBar` do React Native (ou usar `expo-status-bar`) | Planejado (Fase 3) |
| **5.B RN 0.86 → 0.88** | `<Modal` (`animated=`) | `profile.tsx`, `exercise-timer/[id].tsx`, `workout/new.tsx`, `workout/[id]/edit.tsx`, `workout/[id]/session.tsx`, `WeeklyInsightsSheet.tsx` | Nenhuma (todos já usam `animationType="slide"` ou `"fade"`, sem prop `animated`) | Compatível |
| **5.B RN 0.86 → 0.88** | `react-native/Libraries` / `react-native/src` | Nenhum (não usado) | Nenhuma | Não usado |
| **5.C Expo Router** | Declaração explícita de `<Tabs.Screen>` | `src/app/(tabs)/_layout.tsx` | Já declara explicitamente as 5 abas (`index`, `workouts`, `timer`, `favorites`, `profile`) | Compatível |
| **5.C Expo Router** | `headerTransparent` no iOS 26+ | `src/app/_layout.tsx` | Todas as rotas usam `headerShown: false` e headers próprios com `useSafeAreaInsets()` | Compatível |
| **5.C Expo Router** | `initialRouteName`, `initialParams`, `redirect`, `freezeOnBlur`, `beforeRemove`, `navigationKey`, `withLayoutContext`, `expo-router/react-navigation`, `unstable-native-tabs`, `NavigatorScreenParams`, `navigation.dispatch`, `useNavigation` | Nenhum (não usados) | Nenhuma | Não usado |
| **5.C Expo Router** | `usePreventRemove` | `src/app/workout/[id]/session.tsx` | O app usa confirmação explícita no botão de descartar (`Alert.alert`); podemos adicionar também `usePreventRemove` / `BackHandler` seguro ou validar navegação de saída | Planejado (Fase 4) |
| **5.C Expo Router** | `useLocalSearchParams` e hrefs completos | `category/[bodyPart].tsx`, `exercise/[id].tsx`, `exercise-timer/[id].tsx`, `workout/[id]/edit.tsx`, `workout/summary.tsx` | Já usam `router.push({ pathname, params })` com parâmetros explícitos | Compatível |
| **5.C Expo Router** | `web.output` em `app.json` | `app.json` | Alterar `"output": "server"` para `"output": "static"` conforme item 5.C | Planejado (Fase 2) |
| **5.D Animações/Gestos** | `Gesture.`, `GestureDetector`, `useAnimatedGestureHandler` | Nenhum (app usa `GestureHandlerRootView` + `Animated` de `react-native-reanimated`) | Verificar compatibilidade de `GestureHandlerRootView` no RNGH atualizado pelo SDK 58 | Planejado (Fase 5) |
| **5.D Animações/Gestos** | `useSharedValue`, `useAnimatedStyle`, `withSpring`, `withTiming`, `withSequence`, `withRepeat` | `welcome.tsx`, `exercise/[id].tsx`, `exercise-timer/[id].tsx`, `ExerciseCard.tsx`, `Button.tsx`, `CategoryCard.tsx`, `CustomTabBar.tsx`, `Skeleton.tsx` | Validar com a versão de `react-native-reanimated` e `react-native-worklets` instalada pelo SDK 58 e confirmar cópia única | Planejado (Fase 5) |
| **5.E Pacotes `expo-*`** | `expo-image`, `expo-haptics`, `expo-keep-awake`, `expo-image-picker`, `expo-linear-gradient`, `expo-font`, `expo-audio`, `expo-asset`, `expo-splash-screen`, `expo-status-bar` | Projeto inteiro | Alinhar versões via `npx expo install expo@^58.0.0 --fix` e validar tipos/APIs | Planejado (Fase 2) |
| **5.F Plataformas** | `Dimensions.get('window')` em nível de módulo | `category/[bodyPart].tsx`, `exercise/[id].tsx`, `welcome.tsx`, `WeightChart.tsx`, `BannerCarousel.tsx`, `CustomTabBar.tsx` | Substituir `Dimensions.get('window')` de nível de módulo por `useWindowDimensions()` dentro dos componentes para suportar janelas redimensionáveis (iOS 27 / multi-janela) | Planejado (Fase 3/5) |
| **5.F Plataformas** | Pastas nativas `ios/` e `android/` | Raiz do projeto | Não existem (projeto 100% CNG / Expo Go). Não rodar `prebuild`. | Compatível |

### 2. Verificação de Dependências de Terceiros para Expo Go SDK 58
- `zustand` (`^5.0.15`): Puro JS/TS, 100% compatível com React 19 e Expo Go SDK 58.
- `@react-native-async-storage/async-storage`: Módulo nativo incluído no Expo Go; versão alinhada via `npx expo install`.
- `react-native-reanimated`, `react-native-worklets`, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens`, `react-native-svg`: Todos fazem parte do conjunto nativo do Expo Go e serão alinhados automaticamente pelo `npx expo install expo@^58.0.0 --fix`.
