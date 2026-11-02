# FitMax — Pure Home Bodyweight Fitness

Aplicativo mobile de alta performance construído em React Native + Expo (SDK 57), focado exclusivamente em treinos com peso do corpo (**calistenia e exercícios sem equipamento nem máquinas para fazer em casa**).

---

## ⚡ Guia Rápido para Iniciantes (Como Rodar o App)

### 1. Pré-requisitos
- **Node.js**: Versão 20 ou superior instalada ([nodejs.org](https://nodejs.org/)).
- **Celular Físico**:
  - **Android**: Instale o aplicativo **Expo Go** pela Google Play Store.
  - **iOS (iPhone)**: Instale o aplicativo **Expo Go** pela Apple App Store.
- Certifique-se de que o computador e o celular estão conectados na **mesma rede Wi-Fi**.

---

### 2. Passo a Passo de Execução

#### Pelo Terminal:

```bash
# 1. Acesse a pasta do projeto
cd FitMax

# 2. Instale as dependências
npm install

# 3. Inicie o servidor Expo
npx expo start
```

#### No Celular:
- **No Android**: Abra o aplicativo **Expo Go** e toque em **"Scan QR code"**, apontando para o QR Code exibido no terminal.
- **No iPhone**: Abra o aplicativo nativo da **Câmera**, aponte para o QR Code no terminal e toque na notificação amarela que sugere abrir no **Expo Go**.

---

### 3. Solução de Problemas Comuns

- **Celular e Computador em Redes Wi-Fi Diferentes ou Bloqueio de Firewall:**
  Use o modo túnel do Expo:
  ```bash
  npx expo start --tunnel
  ```
- **Limpeza de Cache do Metro Bundler:**
  Se notar qualquer inconsistência ao trocar dependências ou variáveis de ambiente:
  ```bash
  npx expo start -c
  ```
- **Execução no Windows com Script Execution Policy:**
  No Windows PowerShell, caso o comando `npm` apresente bloqueio de script:
  ```powershell
  npm.cmd install
  npx.cmd expo start
  ```

---

### 4. Configuração de Chave de API (Opcional)

O FitMax já vem com um catálogo curado de mais de **220 exercícios sem equipamento** com animações anatômicas funcionais e CDN global embutida. O app funciona 100% offline sem nenhuma chave.

Caso você queira conectar a API ao vivo do RapidAPI ExerciseDB:
1. Acesse [RapidAPI - ExerciseDB](https://rapidapi.com/justin-WFFormat/api/exercisedb).
2. Crie uma conta gratuita e assine o plano Basic.
3. Copie sua chave (`X-RapidAPI-Key`).
4. Crie um arquivo chamado `.env` na raiz do projeto:
   ```env
   EXPO_PUBLIC_RAPIDAPI_KEY=sua_chave_aqui
   ```
5. Reinicie o servidor limpando o cache: `npx expo start -c`.

---

## 🏗️ Arquitetura e Bibliotecas Utilizadas

- **Expo SDK 57** + React 19 + React Native 0.86 (compatibilidade total Expo Go).
- **Expo Router**: Roteamento baseado em arquivos com abas customizadas e modais fluidos.
- **Zustand + AsyncStorage**: Gerenciamento de estado reativo com persistência offline total (perfil, favoritos, treinos customizados, sessões ativas e histórico).
- **React Native Reanimated + Gesture Handler**: Animações a 60 fps na thread de UI nativa, pílula deslizante nas abas e feedback de toque.
- **Expo Image**: Reprodução otimizada de GIFs/WebPs anatômicos em loop com cache inteligente em memória e disco.
- **Expo Haptics**: Feedback tátil de precisão ao favoritar, marcar séries e usar o cronômetro.
- **Expo Keep Awake**: Mantém a tela acesa durante a execução do cronômetro e sessões de treino.
- **React Native SVG**: Medidor animado de IMC por faixas da OMS, anéis de contagem regressiva e gráfico de evolução de peso.
- **Expo Google Fonts**: Tipografia esportiva com *Outfit* (display) e *Plus Jakarta Sans* (legibilidade).

---

## 🧪 Testes Unitários dos Cálculos

Para validar os cálculos puros de IMC, formatação de tempo e regras do filtro home-friendly:

```bash
node scripts/test-calculations.js
```
