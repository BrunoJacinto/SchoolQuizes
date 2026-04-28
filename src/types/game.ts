export const TOPICS = [
  "Frações equivalentes",
  "Simplificação de frações",
  "Percentagens",
  "Comparação de números decimais",
  "Arredondamentos e aproximações",
  "Comparação de frações",
  "Adição e subtração de frações",
  "Multiplicação de número natural por fração",
  "Multiplicação de decimais",
  "Divisão de decimais",
] as const;

export const DIFFICULTIES = ["facil", "medio", "dificil"] as const;
export const GAME_MODES = ["jogo", "exame", "treino", "cutthroat"] as const;

export type Topic = string;
export type Difficulty = (typeof DIFFICULTIES)[number];
export type GameMode = (typeof GAME_MODES)[number];

export type LifelineState = {
  fiftyFiftyUsed: boolean;
};

export type BarChartData = {
  type: "bar";
  title?: string;
  labels: string[];
  values: number[];
  yUnit?: string;
};

export type GroupedBarChartData = {
  type: "grouped-bar";
  title?: string;
  labels: string[];
  series: Array<{ name: string; values: number[] }>;
};

export type ChartData = BarChartData | GroupedBarChartData;

export type Question = {
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  prompt: string;
  promptEN?: string;
  options: [string, string, string, string];
  optionsEN?: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  explanationEN?: string;
  chartData?: ChartData;
};

export type Participant = {
  studentName: string;
  guardianEmail: string;
};

export type RunStatus = "active" | "completed";
export type RunPhase = "question" | "feedback";
export type EmailStatus = "idle" | "sending" | "sent" | "error";

export type AnswerRecord = {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  answeredAt: string;
  timeSpentMs: number;
  pointsAwarded: number;
};

export type RunSession = {
  version: number;
  integrity: string;
  participant: Participant;
  mode: GameMode;
  questions: Question[];
  currentIndex: number;
  currentQuestionStartedAt: string;
  answers: AnswerRecord[];
  score: number;
  startedAt: string;
  completedAt?: string;
  status: RunStatus;
  phase: RunPhase;
  emailStatus: EmailStatus;
  emailError?: string;
  soundEnabled: boolean;
  wrongAnswersCount?: number;
  lifelineState?: LifelineState;
  cutthroatHiddenOptions?: number[];
};

export type TopicMistake = {
  topic: Topic;
  count: number;
};

export type MissedQuestionSummary = {
  id: string;
  topic: Topic;
  prompt: string;
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
};

export type ResultsPayload = {
  participant: Participant;
  mode: GameMode;
  startedAt: string;
  completedAt: string;
  totalScore: number;
  correctCount: number;
  wrongCount: number;
  totalTimeSeconds: number;
  topMistakeTopics: TopicMistake[];
  missedQuestions: MissedQuestionSummary[];
};
