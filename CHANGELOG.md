# Changelog

## [2.1.0] — 2026-04-30

### Correcções ao banco de perguntas
- Removidos **20 pares de opções matematicamente equivalentes** no banco de Estatística.  
  Exemplos: `"1/3"` e `"3/9"` na mesma pergunta; `"Ambas A e B"` como única resposta correcta quando A e B eram individualmente correctas.  
  Cada pergunta tem agora exactamente uma resposta correcta — seleccionar uma fracção equivalente à solução já não é marcado como erro.
- Perguntas afectadas: `fr-f-14`, `fr-f-20`, `fr-f-23`, `gb-m-14`, `gb-d-21`, `gb-d-27`, `gbj-m-15`, `gbj-m-26`, `gbj-d-12`, `gbj-d-14`, `gbj-d-19`, `gbj-d-20`, `gbj-d-24`, `gbj-d-25`, `gbj-d-26`, `pb-f-24`, `pb-m-20`, `pb-m-21`, `pb-d-11`, `pb-d-16`.
- Contagem corrigida na página inicial: banco de Estatística mostra agora "630 perguntas" (era "210").

### Interface
- Removido padrão de texto com gradiente CSS na página inicial (substituído por cor sólida `#fffaf0`).
- Adicionados efeitos de luz ambiente (spotlight glows) à página inicial, alinhando o tom visual com o ecrã de jogo.
- Cards da página inicial com tratamento de fundo em gradiente, contentor para ícone e estado de hover com sombra.
- Barra de progresso animada: a largura transita agora a 400 ms em vez de saltar instantaneamente.
- Estilos `:focus-visible` adicionados a todos os elementos interactivos (botões, modos, opções, ajuda 50/50).
- Cursor normalizado nos cards de opção após resposta (deixa de mostrar ponteiro quando desactivados).
- `.headerControls` e `.languageToggle` adicionados ao CSS — o botão de idioma estava sem estilo.

---

## [2.0.0] — 2026-04-29

### Novo banco — Estatística e Probabilidades
- 630 perguntas independentes (210 fáceis · 210 médias · 210 difíceis).
- 7 tópicos: Valores aproximados, Características quantitativas/qualitativas, Frequências, Gráficos de barras, Gráficos de barras justapostas, Moda e média, Probabilidades.
- Gráficos SVG integrados em perguntas visuais (barras simples e justapostas).

### Modo Cutthroat
- Distribuição de dificuldade mais exigente: 10 fáceis / 20 médias / 20 difíceis.
- O jogo termina ao 3.º erro.
- Ajuda 50/50 disponível uma vez por run.
- Botão "Quit Game" funcional — gera resumo e envia email mesmo a meio da run.

### Seletor de tema
- Página inicial com escolha entre Matemática e Estatística antes de começar.

### Infraestrutura multilingue
- Campos `promptEN`, `optionsEN`, `explanationEN` adicionados ao tipo `Question`.
- Toggle PT/EN no cabeçalho.

### Qualidade do banco
- Removidos hints de total desnecessários em perguntas médias/difíceis.
- Corrigidas dezenas de perguntas com opções equivalentes ou `correctIndex` errado.

---

## [1.0.0] — 2026-04-10

- Versão inicial: banco de Matemática (300 perguntas, 10 tópicos).
- Quatro modos de jogo: Jogo, Exame, Treino, Cutthroat.
- Persistência de sessão via `localStorage`.
- Envio de resultados por email (Resend / SMTP).
- Som opcional via Web Audio API.
