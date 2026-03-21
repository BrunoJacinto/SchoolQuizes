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

- Banco validado com **300 perguntas**.
- Distribuição do banco: **100 fáceis, 100 médias, 100 difíceis**.
- Cada run sorteia **50 perguntas exatas**:
  - 20 fáceis
  - 15 médias
  - 15 difíceis
- Três modos:
  - `jogo`
  - `exame`
  - `treino`
- Progresso linear sem voltar atrás.
- Recuperação automática de sessão interrompida.
- Pontuação por patamares visíveis.
- Envio final de resultados por email.
- Som opcional com toggle.

## Tópicos incluídos

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

## Estrutura

```text
src/
  app/
    api/results/route.ts      # endpoint interno de envio de resultados
    globals.css               # base visual global
    layout.tsx                # layout e metadata
    page.tsx                  # entrada principal
  components/
    millionaire-app.tsx       # fluxo completo do jogo
    millionaire-app.module.css
  data/
    question-bank.ts          # geração e validação das 300 perguntas
  lib/
    email.ts                  # Resend / SMTP
    game.ts                   # seleção, pontuação, integridade e resumo
    storage.ts                # persistência local
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
- junta sempre:
  - 20 fáceis
  - 15 médias
  - 15 difíceis

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
- estado da run
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

## Estado de verificação

No momento desta entrega, a validação esperada é:

- `npm run lint`
- `npm run build`

## Observações

- `NEXT_PUBLIC_TOTAL_QUESTIONS` está preparado para configuração visual, mas a lógica de jogo desta app fixa a run em 50 perguntas, conforme os requisitos.
- O banco de perguntas é gerado por TypeScript e validado à carga para garantir contagens, unicidade de IDs e 4 opções por pergunta.
