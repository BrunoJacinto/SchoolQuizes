import { QUESTION_BANK } from "@/data/question-bank";
import type {
  AnswerRecord,
  Difficulty,
  GameMode,
  MissedQuestionSummary,
  Participant,
  Question,
  ResultsPayload,
  RunSession,
  Topic,
  TopicMistake,
} from "@/types/game";

export const SESSION_VERSION = 1;
export const TOTAL_QUESTIONS = 50;
export const QUESTION_DISTRIBUTION: Record<Difficulty, number> = {
  facil: 20,
  medio: 15,
  dificil: 15,
};

export const STORAGE_KEY = "milionario-5ano-run";
export const SOUND_STORAGE_KEY = "milionario-5ano-sound";

export const MODE_LABELS: Record<GameMode, string> = {
  jogo: "Modo Jogo",
  exame: "Modo Exame",
  treino: "Modo Treino",
  cutthroat: "Modo Cutthroat",
};

export const MODE_DESCRIPTIONS: Record<GameMode, string> = {
  jogo: "Progressão tipo concurso, com feedback visual e patamares de pontuação.",
  exame: "Sem explicações entre perguntas. No fim recebes apenas o resumo completo.",
  treino: "Feedback imediato e explicação pedagógica após cada resposta.",
  cutthroat: "Até 3 erros e sais do jogo. Tens 1 ajuda de 50/50 para gastar.",
};

export const PRIZE_LADDER = [
  25, 50, 75, 100, 125, 150, 175, 200, 225, 250,
  300, 350, 400, 450, 500, 600, 700, 800, 900, 1000,
  1200, 1400, 1600, 1800, 2000, 2500, 3000, 3500, 4000, 4500,
  5000, 6500, 8000, 9500, 11000, 14000, 17000, 20000, 25000, 30000,
  40000, 55000, 75000, 100000, 150000, 250000, 400000, 600000, 800000, 1000000,
] as const;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function hashString(input: string): string {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `v${(hash >>> 0).toString(16)}`;
}

function serializeSessionForIntegrity(session: Omit<RunSession, "integrity">): string {
  return JSON.stringify({
    version: session.version,
    participant: session.participant,
    mode: session.mode,
    questions: session.questions,
    currentIndex: session.currentIndex,
    currentQuestionStartedAt: session.currentQuestionStartedAt,
    answers: session.answers,
    score: session.score,
    startedAt: session.startedAt,
    completedAt: session.completedAt ?? null,
    status: session.status,
    phase: session.phase,
    emailStatus: session.emailStatus,
    emailError: session.emailError ?? null,
    soundEnabled: session.soundEnabled,
  });
}

export function signSession(session: Omit<RunSession, "integrity">): RunSession {
  return {
    ...session,
    integrity: hashString(serializeSessionForIntegrity(session)),
  };
}

function groupByTopic(questions: Question[]): Map<Topic, Question[]> {
  const buckets = new Map<Topic, Question[]>();

  for (const question of questions) {
    const existing = buckets.get(question.topic) ?? [];
    existing.push(question);
    buckets.set(question.topic, existing);
  }

  return buckets;
}

function pickQuestionsByDifficulty(difficulty: Difficulty, count: number): Question[] {
  const pool = QUESTION_BANK.filter((question) => question.difficulty === difficulty);
  const grouped = groupByTopic(shuffle(pool));
  const topics = shuffle([...grouped.keys()]);
  const selection: Question[] = [];

  while (selection.length < count) {
    const roundOrder = shuffle(topics.filter((topic) => (grouped.get(topic)?.length ?? 0) > 0));
    assert(roundOrder.length > 0, `Não há perguntas suficientes para ${difficulty}.`);

    for (const topic of roundOrder) {
      const topicQuestions = grouped.get(topic);

      if (!topicQuestions || topicQuestions.length === 0) {
        continue;
      }

      const nextQuestion = topicQuestions.shift();
      if (nextQuestion) {
        selection.push(nextQuestion);
      }

      if (selection.length === count) {
        break;
      }
    }
  }

  return selection;
}

export function selectRunQuestions(): Question[] {
  const selected = [
    ...pickQuestionsByDifficulty("facil", QUESTION_DISTRIBUTION.facil),
    ...pickQuestionsByDifficulty("medio", QUESTION_DISTRIBUTION.medio),
    ...pickQuestionsByDifficulty("dificil", QUESTION_DISTRIBUTION.dificil),
  ];

  assert(selected.length === TOTAL_QUESTIONS, "A run tem de ter exatamente 50 perguntas.");

  return clone(selected);
}

export function getQuestionPoints(index: number): number {
  return PRIZE_LADDER[index] ?? 0;
}

export function createRunSession(
  participant: Participant,
  mode: GameMode,
  soundEnabled: boolean,
  now = new Date(),
): RunSession {
  const isoDate = now.toISOString();

  return signSession({
    version: SESSION_VERSION,
    participant,
    mode,
    questions: selectRunQuestions(),
    currentIndex: 0,
    currentQuestionStartedAt: isoDate,
    answers: [],
    score: 0,
    startedAt: isoDate,
    completedAt: undefined,
    status: "active",
    phase: "question",
    emailStatus: "idle",
    emailError: undefined,
    soundEnabled,
    wrongAnswersCount: mode === "cutthroat" ? 0 : undefined,
    lifelineState: mode === "cutthroat" ? { fiftyFiftyUsed: false } : undefined,
    cutthroatHiddenOptions: mode === "cutthroat" ? [] : undefined,
  });
}

export function getCurrentQuestion(session: RunSession): Question | null {
  if (session.status !== "active") {
    return null;
  }

  return session.questions[session.currentIndex] ?? null;
}

export function getCurrentAnswer(session: RunSession): AnswerRecord | null {
  if (session.phase !== "feedback") {
    return null;
  }

  return session.answers[session.currentIndex] ?? null;
}

export function submitAnswer(session: RunSession, selectedIndex: number, now = new Date()): RunSession {
  assert(session.status === "active", "A sessão já terminou.");
  assert(session.phase === "question", "A resposta atual já foi submetida.");

  const question = getCurrentQuestion(session);
  assert(question, "Não existe pergunta atual.");
  assert(selectedIndex >= 0 && selectedIndex < 4, "Opção inválida.");

  const isCorrect = selectedIndex === question.correctIndex;
  const pointsAwarded = isCorrect ? getQuestionPoints(session.currentIndex) : 0;
  const answeredAt = now.toISOString();
  const timeSpentMs = Math.max(0, now.getTime() - new Date(session.currentQuestionStartedAt).getTime());

  const answerRecord: AnswerRecord = {
    questionId: question.id,
    selectedIndex,
    isCorrect,
    answeredAt,
    timeSpentMs,
    pointsAwarded,
  };

  const answers = [...session.answers, answerRecord];
  const isLastQuestion = session.currentIndex === session.questions.length - 1;

  // Cutthroat mode: track wrong answers
  const newWrongCount = session.wrongAnswersCount ?? 0;
  const isCutthroatLost = session.mode === "cutthroat" && !isCorrect && newWrongCount + 1 >= 3;
  const shouldComplete = isLastQuestion || isCutthroatLost;

  return signSession({
    ...session,
    answers,
    score: session.score + pointsAwarded,
    completedAt: shouldComplete ? answeredAt : undefined,
    status: shouldComplete ? "completed" : "active",
    phase: "feedback",
    wrongAnswersCount: session.mode === "cutthroat" ? newWrongCount + (isCorrect ? 0 : 1) : undefined,
    cutthroatHiddenOptions: session.mode === "cutthroat" ? [] : undefined,
  });
}

export function advanceSession(session: RunSession, now = new Date()): RunSession {
  assert(session.status === "active", "A sessão já terminou.");
  assert(session.phase === "feedback", "Não há pergunta para avançar.");
  assert(session.currentIndex < session.questions.length - 1, "Não é possível avançar além da última pergunta.");

  return signSession({
    ...session,
    currentIndex: session.currentIndex + 1,
    currentQuestionStartedAt: now.toISOString(),
    phase: "question",
  });
}

export function setRunSound(session: RunSession, soundEnabled: boolean): RunSession {
  return signSession({
    ...session,
    soundEnabled,
  });
}

export function setEmailState(
  session: RunSession,
  emailStatus: RunSession["emailStatus"],
  emailError?: string,
): RunSession {
  return signSession({
    ...session,
    emailStatus,
    emailError,
  });
}

export function useFiftyFiftyLifeline(session: RunSession): RunSession {
  if (session.mode !== "cutthroat" || !session.lifelineState) {
    return session;
  }

  if (session.lifelineState.fiftyFiftyUsed) {
    return session;
  }

  const currentQuestion = getCurrentQuestion(session);
  if (!currentQuestion) {
    return session;
  }

  const wrongIndices = [0, 1, 2, 3].filter((i) => i !== currentQuestion.correctIndex);
  const hiddenIndices = wrongIndices.slice(0, 2);

  return signSession({
    ...session,
    lifelineState: { fiftyFiftyUsed: true },
    cutthroatHiddenOptions: hiddenIndices,
  });
}

export function formatScore(score: number): string {
  return new Intl.NumberFormat("pt-PT").format(score);
}

export function formatElapsedTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  }

  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export function getTotalTimeSeconds(session: RunSession): number {
  const endDate = session.completedAt ? new Date(session.completedAt) : new Date();
  return Math.max(0, Math.round((endDate.getTime() - new Date(session.startedAt).getTime()) / 1000));
}

export function getAnsweredCount(session: RunSession): number {
  return session.answers.length;
}

export function getCorrectCount(session: RunSession): number {
  return session.answers.filter((answer) => answer.isCorrect).length;
}

export function getWrongCount(session: RunSession): number {
  return session.answers.filter((answer) => !answer.isCorrect).length;
}

export function getTopMistakeTopics(session: RunSession): TopicMistake[] {
  const topicCounts = new Map<Topic, number>();

  session.answers.forEach((answer, index) => {
    if (answer.isCorrect) {
      return;
    }

    const topic = session.questions[index]?.topic;
    if (!topic) {
      return;
    }

    topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
  });

  return [...topicCounts.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);
}

export function getMissedQuestions(session: RunSession): MissedQuestionSummary[] {
  return session.answers.flatMap((answer, index) => {
    if (answer.isCorrect) {
      return [];
    }

    const question = session.questions[index];

    return [
      {
        id: question.id,
        topic: question.topic,
        prompt: question.prompt,
        selectedAnswer: question.options[answer.selectedIndex] ?? "Sem resposta",
        correctAnswer: question.options[question.correctIndex],
        explanation: question.explanation,
      },
    ];
  });
}

export function buildResultsPayload(session: RunSession): ResultsPayload {
  // Session can complete before all questions are answered in two cases:
  // 1. Cutthroat mode: after 3 wrong answers
  // 2. User quits early: when clicking "Quit Game" button
  assert(session.status === "completed", "A sessão ainda não terminou.");
  assert(session.completedAt, "Falta a data de conclusão.");

  return {
    participant: session.participant,
    mode: session.mode,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    totalScore: session.score,
    correctCount: getCorrectCount(session),
    wrongCount: getWrongCount(session),
    totalTimeSeconds: getTotalTimeSeconds(session),
    topMistakeTopics: getTopMistakeTopics(session),
    missedQuestions: getMissedQuestions(session),
  };
}

export function validateRunSession(session: unknown): { valid: true; session: RunSession } | { valid: false; reason: string } {
  if (!session || typeof session !== "object") {
    return { valid: false, reason: "A sessão local não existe ou está vazia." };
  }

  const candidate = session as RunSession;

  if (candidate.version !== SESSION_VERSION) {
    return { valid: false, reason: "A versão da sessão local já não é compatível." };
  }

  if (!Array.isArray(candidate.questions) || candidate.questions.length !== TOTAL_QUESTIONS) {
    return { valid: false, reason: "A lista de perguntas da sessão está incompleta." };
  }

  if (!Array.isArray(candidate.answers)) {
    return { valid: false, reason: "As respostas guardadas ficaram inválidas." };
  }

  if (candidate.currentIndex < 0 || candidate.currentIndex >= TOTAL_QUESTIONS) {
    return { valid: false, reason: "O índice atual da sessão está fora dos limites." };
  }

  if (candidate.status === "active" && candidate.phase === "question" && candidate.answers.length !== candidate.currentIndex) {
    return { valid: false, reason: "A ordem da sessão ficou inconsistente." };
  }

  if (
    candidate.status === "active" &&
    candidate.phase === "feedback" &&
    candidate.answers.length !== candidate.currentIndex + 1
  ) {
    return { valid: false, reason: "A pergunta atual não coincide com a última resposta guardada." };
  }

  if (candidate.status === "completed" && candidate.answers.length !== TOTAL_QUESTIONS) {
    return { valid: false, reason: "A sessão concluída não tem as 50 respostas." };
  }

  for (let index = 0; index < candidate.answers.length; index += 1) {
    const answer = candidate.answers[index];
    const question = candidate.questions[index];

    if (answer.questionId !== question.id) {
      return { valid: false, reason: "A ordem das respostas já não corresponde às perguntas sorteadas." };
    }

    if (answer.selectedIndex < 0 || answer.selectedIndex > 3) {
      return { valid: false, reason: "Foi encontrada uma resposta com opção inválida." };
    }
  }

  const expectedScore = candidate.answers.reduce((total, answer) => total + answer.pointsAwarded, 0);
  if (expectedScore !== candidate.score) {
    return { valid: false, reason: "A pontuação guardada não bate certo com as respostas." };
  }

  const { integrity: _integrity, ...unsignedSession } = candidate;
  const integrity = hashString(serializeSessionForIntegrity(unsignedSession));

  if (integrity !== candidate.integrity) {
    return { valid: false, reason: "A assinatura local da sessão não corresponde ao conteúdo guardado." };
  }

  return { valid: true, session: candidate };
}
