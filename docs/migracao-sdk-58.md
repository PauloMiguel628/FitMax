# Registro de Migração: Expo SDK 57 → Expo SDK 58 (FitMax)

## 1. Resumo Executivo
- **Resultado:** Migrado e verificado com sucesso para o **Expo SDK 58 (`~58.0.22`) / React Native `0.88.1` / React `19.3.0`** em ambiente local, mantendo 100% de compatibilidade com o **Expo Go SDK 58** (sem `prebuild`, sem pastas nativas `ios/` ou `android/`), sem alterações nas chaves ou formato dos dados persistidos e com os bundles de produção iOS e Android compilando sem erros.

---

## 2. Versões Antes (SDK 57) vs. Depois (SDK 58)

| Componente / Pacote | Antes (SDK 57) | Depois (SDK 58) |
| :--- | :--- | :--- |
| **Node.js** | `v22.16.0` | `v22.16.0` (>= 22.13 LTS) |
| **`expo`** | `~57.0.31` | `~58.0.22` |
| **`react` / `react-dom`** | `19.2.3` | `19.3.0` |
| **`react-native`** | `0.86.3` | `0.88.1` |
| **`expo-router`** | `~57.0.29` | `~58.0.29` |
| **`react-native-reanimated`** | `4.5.1` | `4.7.1` |
| **`react-native-worklets`** | `0.10.1` | `0.13.0` (deduplicado via `overrides`) |
| **`react-native-gesture-handler`** | `~2.32.0` | `~3.3.0` |
| **`react-native-safe-area-context`** | `~5.7.0` | `~5.10.1` |
| **`react-native-screens`** | `~4.26.0` (`4.26.2`) | `~4.30.1` |
| **`react-native-svg`** | `15.15.4` | `15.16.0` |
| **`expo-image`** | `~57.0.5` | `~58.0.18` |
| **`expo-audio`** | `~57.0.5` | `~58.0.11` |
| **`expo-asset`** | `~57.0.20` | `~58.0.19` |
| **`expo-haptics`** | `~57.0.3` | `~58.0.7` |
| **`expo-keep-awake`** | `~57.0.2` | `~58.0.3` |
| **`expo-image-picker`** | `~57.0.20` | `~58.0.10` |
| **`expo-linear-gradient`** | `~57.0.2` | `~58.0.3` |
| **`expo-font`** | `~57.0.4` | `~58.0.11` |
| **`expo-splash-screen`** | `~57.0.10` | `~58.0.12` |
| **`expo-status-bar`** | `~57.0.1` | `~58.0.4` |
| **`@types/react`** | `~19.2.4` | `~19.3.0` |
| **`eslint-config-expo`** | `~57.0.2` | `~58.0.4` |

---

## 3. Tabela Completa de Impacto e Ações Realizadas (Fases 1 a 7)

| Item (Seção 5) | Termo / API Pesquisada | Arquivos Afetados | Ação Realizada | Status Final |
| :--- | :--- | :--- | :--- | :--- |
| **5.A Pré-requisitos** | `node -v` (>= 22.13) | Ambiente local | `v22.16.0` validado | ✅ Concluído |
| **5.B RN 0.86 → 0.88** | `InteractionManager`, `Touchable`, `NativeMethods`, `ImageBackground`, `react-native/Libraries`, `react-native/src` | Nenhum (não usados) | Nenhuma ação necessária (app já usa `Pressable` e `View` + `expo-image`) | ✅ Não usado |
| **5.B RN 0.86 → 0.88** | `useColorScheme` (`null` return type) | `src/hooks/useAppTheme.ts` | Adicionado `useColorScheme()` com fallback explícito seguro para `'dark'` quando `null`/`undefined` | ✅ Concluído |
| **5.B RN 0.86 → 0.88** | `StatusBar` (`backgroundColor`, `translucent` removidos no RN 0.87/0.88) | `src/app/_layout.tsx`, `src/app/welcome.tsx` | Removidas as props obsoletas `backgroundColor` e `translucent` do `<StatusBar>` do React Native | ✅ Concluído |
| **5.B RN 0.86 → 0.88** | `<Modal` (`animated=` removido) | `profile.tsx`, `exercise-timer/[id].tsx`, `workout/new.tsx`, `workout/[id]/edit.tsx`, `workout/[id]/session.tsx`, `WeeklyInsightsSheet.tsx` | Nenhuma (todos usam `animationType="slide"` ou `"fade"`, sem prop `animated`) | ✅ Compatível |
| **5.C Expo Router 58** | Declaração explícita de `<Tabs.Screen>` | `src/app/(tabs)/_layout.tsx` | Já declara explicitamente as 5 abas (`index`, `workouts`, `timer`, `favorites`, `profile`) | ✅ Compatível |
| **5.C Expo Router 58** | Assinatura de `tabBar` (`emitter` e `navigateToTab`) | `src/components/ui/CustomTabBar.tsx` | Atualizado `CustomTabBarProps` para `Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0]`, usando `emitter.emit({ type: 'tabPress', ... })` e `navigateToTab(route.key)` | ✅ Concluído |
| **5.C Expo Router 58** | `usePreventRemove` na sessão de treino | `src/app/workout/[id]/session.tsx` | Adicionado `usePreventRemove` importado de `expo-router` com callback `({ repeat })` e `disablePrevention()` ao finalizar ou descartar sessão | ✅ Concluído |
| **5.C Expo Router 58** | `headerTransparent` no iOS 26+ | `src/app/_layout.tsx` | Todas as telas usam `headerShown: false` e cabeçalhos próprios com `useSafeAreaInsets()` | ✅ Compatível |
| **5.C Expo Router 58** | `web.output` em `app.json` | `app.json` | Definido `"web": { "output": "static", ... }` | ✅ Concluído |
| **5.D Animações/Gestos** | Cópia única de `react`, `react-native`, `react-native-reanimated`, `react-native-worklets` | `package.json` | Adicionado `"overrides": { "react-native-worklets": "$react-native-worklets" }` e rodado `npm dedupe` para unificar `0.13.0` | ✅ Concluído |
| **5.E Pacotes `expo-*`** | Todos os pacotes `expo-*` do projeto | `package.json` | Alinhados para as versões oficiais do SDK 58 (`npx expo install --check` e `npx expo-doctor@latest` 20/20 aprovados) | ✅ Concluído |
| **5.F Plataformas** | `Dimensions.get('window')` em nível de módulo | `welcome.tsx`, `category/[bodyPart].tsx`, `exercise/[id].tsx`, `WeightChart.tsx`, `BannerCarousel.tsx`, `CustomTabBar.tsx` | Substituído por `useWindowDimensions()` dentro de cada componente para suportar redimensionamento dinâmico de janela (iOS 27 / multi-janela) | ✅ Concluído |
| **Fase 6 Persistência** | Chaves e formato do `AsyncStorage` / `zustand/middleware` | `src/store/*.ts`, `scripts/test-calculations.js` | Confirmado `git diff pre-sdk-58 -- src/store/` vazio e adicionada suíte 10 de testes de persistência/reidratação | ✅ Concluído |

---

## 4. Comandos de Verificação Executados e Resultados (Fase 7)
1. **`npx tsc --noEmit`**: `0 erros`
2. **`npx expo lint`**: `0 erros` (5 avisos não-bloqueantes pré-existentes desde o SDK 57)
3. **`npx expo install --check`**: `Dependencies are up to date`
4. **`npx expo-doctor@latest`**: `20/20 checks passed. No issues detected!`
5. **`npm ls react react-native react-native-reanimated react-native-worklets`**: Cópia única de cada pacote (`19.3.0`, `0.88.1`, `4.7.1`, `0.13.0`).
6. **`node scripts/test-calculations.js`**: `10/10 suítes aprovadas`.
7. **`npx expo export --platform ios` & `npx expo export --platform android`**: Ambos os bundles Hermes (`.hbc`) e os 67 assets foram exportados sem erros; pasta `dist/` removida em seguida.
