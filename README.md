# Quem Quer Ser Milionário? . 5.º Ano . Escola Conde de Oeiras

Aplicação web em **Next.js 16 + TypeScript** para treino de Matemática do 5.º ano, com progressão inspirada num concurso televisivo, 50 perguntas por run, persistência local e envio final de resultados por email.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript strict
- CSS Modules + CSS global
- Resend como opção preferencial de email
- Nodemailer como alternativa SMTP
- `localStorage` para persistência do run

## Funcionalidades principais

- **Dois bancos de perguntas independentes:**
  - **Matemática (Frações e Decimais):** 300 perguntas (100 fáceis, 100 médias, 100 difíceis)
  - **Estatística:** 630 perguntas (210 fáceis, 210 médias, 210 difíceis)
- Seleção do tema na página inicial antes de começar.
- Cada run sorteia **50 perguntas exatas** com distribuição por dificuldade:
  - Modo normal: 20 fáceis, 15 médias, 15 difíceis
  - Modo Cutthroat: 10 fáceis, 20 médias, 20 difíceis
- **Quatro modos de jogo:**
  - `jogo` — progressão tipo concurso com feedback visual e patamares de pontuação
  - `exame` — sem explicações entre perguntas; só o resumo no fim
  - `treino` — feedback imediato e explicação pedagógica após cada resposta
  - `cutthroat` — máximo de 3 erros; 1 ajuda 50/50 disponível
- Progresso linear sem voltar atrás.
- Recuperação automática de sessão interrompida.
- Pontuação por patamares visíveis.
- Envio final de resultados por email ao encarregado de educação.
- Som opcional com toggle.
- Gráficos SVG integrados nas perguntas de estatística (barras simples e barras justapostas).

## Tópicos — Matemática (Frações e Decimais)

1. Frações equivalentes
2. Simplificação de frações
3. Percentagens
4. Comparação de números decimais
5. Arredondamentos e aproximações
6. Comparação de frações
7. Adição e subtração de frações
8. Multiplicação de número natural por fração
9. Multiplicação de decimais
10. Divisão de decimais

## Tópicos — Estatística

1. Valores aproximados
2. Características quantitativas e qualitativas
3. Frequências absoluta e relativa
4. Gráficos de barras
5. Gráficos de barras justapostas
6. Moda e média
7. Probabilidades

## Modo Cutthroat

- Distribuição mais exigente: 10 fáceis / 20 médias / 20 difíceis.
- O jogo termina ao 3.º erro (não é necessário completar as 50 perguntas).
- Existe uma ajuda 50/50 que elimina 2 opções erradas — usável uma vez por run.
- É possível desistir a meio (Quit Game) e receber igualmente o resumo e o email.

## Estrutura

```text
src/
  app/
    api/results/route.ts           # endpoint interno de envio de resultados
    globals.css                    # base visual global
    layout.tsx                     # layout e metadata
    page.tsx                       # entrada principal com seletor de tema
  components/
    millionaire-app.tsx            # fluxo completo do jogo
    millionaire-app.module.css
    chart-renderer.tsx             # gráficos SVG (bar / grouped-bar)
    chart-renderer.module.css
  data/
    question-bank.ts               # banco de Matemática (300 perguntas)
    question-bank-statistics.ts    # banco de Estatística (630 perguntas)
  lib/
    email.ts                       # Resend / SMTP
    game.ts                        # seleção, pontuação, integridade e resumo
    storage.ts                     # persistência local
  types/
    game.ts
```

## Como correr localmente

```bash
npm install
npm run dev
```

Depois abre `http://localhost:3000`.

## Variáveis de ambiente

Cria um `.env` local com base em `.env.example`.

Exemplo:

```env
RESEND_API_KEY=...
MAIL_FROM=onboarding@resend.dev

NEXT_PUBLIC_APP_NAME=Quem Quer Ser Milionário? 5.º Ano
NEXT_PUBLIC_SCHOOL_NAME=Escola Conde de Oeiras
NEXT_PUBLIC_TOTAL_QUESTIONS=50
NEXT_PUBLIC_ENABLE_SOUND=true
```

Alternativa SMTP:

```env
SMTP_HOST=smtp.exemplo.pt
SMTP_PORT=587
SMTP_USER=utilizador
SMTP_PASS=segredo
MAIL_FROM=noreply@dominio.pt
```

Notas:

- Se `RESEND_API_KEY` existir, a app usa Resend.
- Se não existir, tenta SMTP via Nodemailer.
- `MAIL_FROM` é obrigatório em ambos os casos.
- Em teste, `onboarding@resend.dev` funciona bem com Resend.

## Envio de resultados

No fim da run, a app envia automaticamente um email para o encarregado de educação com:

- nome do aluno
- email do encarregado
- data/hora de início e fim
- pontuação total
- número de respostas certas e erradas
- tempo total
- tópicos com mais erros
- lista das perguntas falhadas, resposta dada, resposta correta e explicação

Se o envio falhar, o utilizador vê uma mensagem clara e pode tentar novamente.

## Como funciona o sorteio das 50 perguntas

O sorteio é feito apenas quando a run começa.

Lógica:

- separa o banco por dificuldade
- embaralha cada conjunto
- seleciona por rondas entre tópicos para evitar concentração excessiva no mesmo tema
- junta com distribuição definida pelo modo (ver acima)

Depois disso, a lista sorteada fica guardada em `localStorage`. Ao atualizar a página, a app recupera exatamente essa mesma lista em vez de voltar a sortear.

## Persistência local

O `localStorage` guarda:

- nome do aluno
- email do encarregado
- modo escolhido
- lista das 50 perguntas sorteadas
- índice atual
- respostas dadas
- pontuação
- estado da run (incluindo erros no modo Cutthroat e estado da ajuda 50/50)
- hora de início
- hora da pergunta atual
- estado do envio de email
- preferência de som

## Anti-batota

A app aplica medidas razoáveis contra batota casual no browser:

- não existem URLs separadas por pergunta
- a progressão é linear
- não é possível editar respostas anteriores pela interface
- o botão voltar do browser é intercetado durante a run
- a sessão ativa é assinada com um hash local de integridade
- se o estado recuperado for incoerente, a app força reinício seguro

Importante:

- isto **não** é segurança forte de servidor
- um utilizador com conhecimentos técnicos pode sempre manipular estado local no browser
- o objetivo é reduzir batota casual, não garantir inviolabilidade

## Deploy em Vercel

1. Faz push do repositório para GitHub.
2. Importa o projeto na Vercel.
3. Adiciona as mesmas variáveis de ambiente do `.env`.
4. Faz deploy.

Com a configuração atual, a app fica pronta para Vercel sem backend externo.

## Comandos úteis

```bash
npm run dev
npm run lint
npm run build
```

## Qualidade do banco de perguntas

O banco de estatística passa por validação automática que verifica:

- unicidade de todos os IDs
- exactamente 4 opções por pergunta
- `correctIndex` entre 0 e 3
- ausência de opções duplicadas ou matematicamente equivalentes (ex: 3/6 e 1/2)

Perguntas que apresentam intencionalmente duas opções equivalentes (tipo "Ambas") estão marcadas como excepções explícitas.
