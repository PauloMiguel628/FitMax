# Design Brief: FitMax — Pure Home Bodyweight Fitness

## 1. Identidade e Conceito do Produto
- **Nome do Aplicativo:** FitMax (Calisthenics & Pure Home Fitness)
- **Proposta de Valor:** Treinos de alta intensidade e calistenia exclusivamente com peso corporal, realizados em casa sem nenhum equipamento, máquina ou barra.
- **Personalidade Visual:** **Athletic-Editorial & Performance Tech**. O app combina o impacto tipográfico de revistas e marcas de alto desempenho esportivo (títulos em caixa alta marcantes, vermelho-carmim vibrante, alto contraste) com a fluidez de interfaces modernas (bento grid, cantos amplos `border-radius: 24-28px`, micro-interações táteis, anéis circulares de progresso e haptics em cada ação).

## 2. Sistema de Cores e Tokens
- **Cor Primária de Marca:** Carmine Red (`#FF2A55` / `#E63946`) — energia, foco, precisão e continuidade com a identidade de referência.
- **Cores de Apoio:**
  - Dark Mode (Padrão para telas imersivas/Boas-vindas):
    - Fundo base: `#0D0F12` (Obsidian Deep)
    - Fundo de superfície/cards: `#16191F`
    - Fundo de cartões elevados: `#212631`
    - Bordas e divisores: `rgba(255, 255, 255, 0.08)`
    - Texto Primário: `#FFFFFF`
    - Texto Secundário: `#94A3B8`
  - Light Mode (Padrão para listas limpas de exercícios e detalhe conforme prints de referência):
    - Fundo base: `#F8FAFC`
    - Fundo de superfície/cards: `#FFFFFF`
    - Fundo elevado / chips: `#F1F5F9`
    - Bordas: `#E2E8F0`
    - Texto Primário: `#0F172A`
    - Texto Secundário: `#64748B`
- **Cores Semânticas:**
  - Sucesso / Séries Concluídas: `#10B981` (Emerald)
  - Alerta / Atenção: `#F59E0B` (Amber)
  - Faixas de IMC (OMS):
    - Abaixo do peso: `#38BDF8` (Azul Celeste)
    - Peso normal: `#10B981` (Verde Esmeralda)
    - Sobrepeso: `#FBBF24` (Amarelo Âmbar)
    - Obesidade Grau I: `#FB923C` (Laranja)
    - Obesidade Grau II: `#F43F5E` (Carmim Claro)
    - Obesidade Grau III: `#BE123C` (Vinho / Carmim Escuro)

## 3. Tipografia
- **Display / Títulos:** *Outfit* ou *Plus Jakarta Sans* em pesos Bold e ExtraBold (800) com kerning ajustado (`letterSpacing: -0.5px`), permitindo reproduzir com perfeição o estilo do cabeçalho de referência:
  - "READY TO" em texto escuro neutro
  - "WORKOUT" em vermelho-carmim vibrante
- **Corpo / Legibilidade:** *Inter* / *Plus Jakarta Sans* (Regular 400, Medium 500, SemiBold 600) para instruções e metadados.
- **Números Display (Cronômetro e IMC):** Tipografia tabular mono-espaçada ou bold expressivo de alta escala (56pt a 64pt), garantindo visibilidade instantânea durante o treino em movimento.

## 4. Estrutura de Navegação e Abas
Barra de abas flutuante customizada com indicador de pílula animada via Reanimated:
1. **Início (Home):** Cabeçalho de impacto, carrossel de banners de motivação, bento grid de categorias de exercícios livres.
2. **Treinos:** Rotinas criadas pelo usuário, botão de criar treino, lista com séries planejadas e disparo de sessão.
3. **Cronômetro:** Seletor rápido de exercício ou cronômetro livre com anel SVG animado e animação do exercício em destaque.
4. **Favoritos:** Coleção dos exercícios favoritados com acesso imediato e snapshot offline.
5. **Perfil:** Cabeçalho com foto, descrição/bio personalizada e seletor de nível (`Iniciante`, `Intermediário`, `Avançado`), estatísticas de treinos, Calculadora Interativa de IMC, Evolução de Peso com gráfico SVG dinâmico (marcando data e hora de cada registro) e preferências de idioma.
6. **Abertura Temática (Splash & Ícone):** Identidade visual de abertura em Obsidian Deep (`#0D0F12`) com anel luminoso Carmine Red (`#FF2A55`) e emblema esportivo do FitMax.

## 5. Princípios de Movimento e Micro-interações
- **Feedback Háptico:** Diferentes intensidades (`ImpactFeedbackStyle.Light`, `Medium`, `Heavy` e `NotificationFeedbackType.Success`) ao favoritar, marcar séries, iniciar/pausar o timer e concluir treinos.
- **Entrada Escalonada (Stagger):** Cards da lista de exercícios entram com leve fade e translação vertical calculados pelo índice (`delay: index * 40ms`).
- **Animações dos Exercícios:** Renderizadas via `expo-image` em alta performance, com cache local, cantos arredondados, fundo suave e suporte a "reduzir movimento" pausando no primeiro frame se requisitado.
