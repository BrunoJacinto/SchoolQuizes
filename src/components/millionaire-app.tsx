"use client";

import { startTransition, useEffect, useEffectEvent, useRef, useState } from "react";

import {
  advanceSession,
  buildResultsPayload,
  createRunSession,
  formatElapsedTime,
  formatScore,
  getAnsweredCount,
  getCorrectCount,
  getCurrentAnswer,
  getCurrentQuestion,
  getQuestionPoints,
  getTopMistakeTopics,
  getTotalTimeSeconds,
  getWrongCount,
  MODE_DESCRIPTIONS,
  MODE_LABELS,
  PRIZE_LADDER,
  setEmailState,
  setRunSound,
  submitAnswer,
  TOTAL_QUESTIONS,
} from "@/lib/game";
import {
  clearRunSession,
  loadRunSession,
  loadSoundPreference,
  saveRunSession,
  saveSoundPreference,
} from "@/lib/storage";
import type { GameMode, RunSession } from "@/types/game";

import styles from "./millionaire-app.module.css";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Quem Quer Ser Milionário? 5.º Ano";
const SCHOOL_NAME = process.env.NEXT_PUBLIC_SCHOOL_NAME ?? "Escola Conde de Oeiras";
const DEFAULT_SOUND_ENABLED = process.env.NEXT_PUBLIC_ENABLE_SOUND !== "false";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatDateTime(value?: string): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getOptionState(session: RunSession, optionIndex: number): "idle" | "selected" | "correct" | "wrong" {
  if (session.phase !== "feedback" && session.status !== "completed") {
    return "idle";
  }

  const answer = getCurrentAnswer(session);
  const question = getCurrentQuestion(session);

  if (!answer || !question) {
    return "idle";
  }

  if (optionIndex === question.correctIndex) {
    return "correct";
  }

  if (optionIndex === answer.selectedIndex && !answer.isCorrect) {
    return "wrong";
  }

  return "selected";
}

export function MillionaireApp() {
  const [session, setSession] = useState<RunSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalidReason, setInvalidReason] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [selectedMode, setSelectedMode] = useState<GameMode>("jogo");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(DEFAULT_SOUND_ENABLED);
  const audioContextRef = useRef<AudioContext | null>(null);

  const currentQuestion = session ? getCurrentQuestion(session) : null;
  const currentAnswer = session ? getCurrentAnswer(session) : null;
  const answeredCount = session ? getAnsweredCount(session) : 0;
  const progressPercent = session ? (answeredCount / TOTAL_QUESTIONS) * 100 : 0;

  function playFeedbackSound(tone: "correct" | "wrong" | "advance") {
    const enabled = session?.soundEnabled ?? soundEnabled;

    if (!enabled || typeof window === "undefined") {
      return;
    }

    const AudioContextClass =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    const context = audioContextRef.current;
    const now = context.currentTime;
    const profiles: Record<typeof tone, number[]> = {
      correct: [523.25, 659.25, 783.99],
      wrong: [392, 329.63],
      advance: [440, 587.33],
    };

    profiles[tone].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.type = tone === "wrong" ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.0001, now + index * 0.11);
      gainNode.gain.exponentialRampToValueAtTime(0.04, now + index * 0.11 + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.11 + 0.16);
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start(now + index * 0.11);
      oscillator.stop(now + index * 0.11 + 0.18);
    });
  }

  const handlePopState = useEffectEvent(() => {
    if (!session || session.status !== "active") {
      return;
    }

    window.history.pushState({ locked: true }, "", window.location.href);
    setToast("Durante uma run não podes voltar para perguntas anteriores.");
  });

  const handleBeforeUnload = useEffectEvent((event: BeforeUnloadEvent) => {
    if (!session || session.status !== "active") {
      return;
    }

    event.preventDefault();
    event.returnValue = "";
  });

  async function sendResultsEmail(completedSession: RunSession) {
    setSession((current) => (current ? setEmailState(current, "sending") : current));

    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildResultsPayload(completedSession)),
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Não foi possível enviar o email.");
      }

      setSession((current) => (current ? setEmailState(current, "sent") : current));
      setToast("Resultado enviado por email com sucesso.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falhou o envio do email.";
      setSession((current) => (current ? setEmailState(current, "error", message) : current));
      setToast(message);
    }
  }

  useEffect(() => {
    const persistedSound = loadSoundPreference(DEFAULT_SOUND_ENABLED);
    const loadedSession = loadRunSession();

    setSoundEnabled(persistedSound);

    if (loadedSession.status === "ready") {
      setSession(loadedSession.session);
      setStudentName(loadedSession.session.participant.studentName);
      setGuardianEmail(loadedSession.session.participant.guardianEmail);
      setSelectedMode(loadedSession.session.mode);
      setToast("Sessão recuperada a partir do navegador.");
    }

    if (loadedSession.status === "invalid") {
      setInvalidReason(loadedSession.reason);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    saveSoundPreference(session?.soundEnabled ?? soundEnabled);
  }, [session?.soundEnabled, soundEnabled]);

  useEffect(() => {
    if (!session) {
      return;
    }

    saveRunSession(session);
  }, [session]);

  useEffect(() => {
    if (!session || session.status !== "active") {
      return;
    }

    window.history.pushState({ locked: true }, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    if (session.phase === "question") {
      setSelectedOption(null);
      return;
    }

    const answer = getCurrentAnswer(session);
    setSelectedOption(answer?.selectedIndex ?? null);
  }, [session]);

  useEffect(() => {
    if (!session || session.status !== "completed" || session.emailStatus !== "idle") {
      return;
    }

    void sendResultsEmail(session);
  }, [session]);

  function handleStartRun() {
    const trimmedName = studentName.trim();
    const trimmedEmail = guardianEmail.trim();

    if (!trimmedName) {
      setFormError("Indica o nome do aluno antes de começar.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setFormError("Indica um email válido do pai ou encarregado de educação.");
      return;
    }

    setFormError(null);
    setInvalidReason(null);
    clearRunSession();

    startTransition(() => {
      setSession(createRunSession({ studentName: trimmedName, guardianEmail: trimmedEmail }, selectedMode, soundEnabled));
    });
  }

  function handleSubmitAnswer() {
    if (!session || session.status !== "active" || session.phase !== "question" || selectedOption === null) {
      return;
    }

    const updatedSession = submitAnswer(session, selectedOption);
    const latestAnswer = updatedSession.answers[updatedSession.answers.length - 1];
    playFeedbackSound(latestAnswer?.isCorrect ? "correct" : "wrong");

    startTransition(() => {
      setSession(updatedSession);
    });
  }

  function handleAdvance() {
    if (!session || session.status !== "active" || session.phase !== "feedback") {
      return;
    }

    playFeedbackSound("advance");
    startTransition(() => {
      setSession(advanceSession(session));
    });
  }

  function handleRestart() {
    clearRunSession();
    setSession(null);
    setInvalidReason(null);
    setSelectedOption(null);
    setFormError(null);
    setToast(null);
  }

  function handleRetryEmail() {
    if (!session || session.status !== "completed") {
      return;
    }

    void sendResultsEmail(session);
  }

  function handleSoundToggle() {
    const nextValue = !(session?.soundEnabled ?? soundEnabled);

    if (session) {
      setSession(setRunSound(session, nextValue));
      return;
    }

    setSoundEnabled(nextValue);
  }

  const activeSound = session?.soundEnabled ?? soundEnabled;

  if (loading) {
    return (
      <main className={styles.appShell}>
        <div className={styles.loadingPanel}>A preparar o palco matemático...</div>
      </main>
    );
  }

  return (
    <main className={styles.appShell}>
      <div className={styles.spotlightLeft} />
      <div className={styles.spotlightRight} />
      <div className={styles.stageGlow} />

      <header className={styles.header}>
        <div>
          <p className={styles.schoolLabel}>{SCHOOL_NAME}</p>
          <h1 className={styles.title}>{APP_NAME}</h1>
          <p className={styles.subtitle}>
            Concurso de treino para Matemática do 5.º ano, com progressão em 50 perguntas e recuperação automática da
            sessão.
          </p>
        </div>

        <button type="button" className={styles.soundToggle} onClick={handleSoundToggle}>
          Som: {activeSound ? "ligado" : "desligado"}
        </button>
      </header>

      {!session ? (
        <section className={styles.heroGrid}>
          <div className={styles.heroCard}>
            <p className={styles.kicker}>Treino escolar com ambiente de concurso</p>
            <h2 className={styles.heroTitle}>Escolhe o modo, introduz os dados e começa a tua run.</h2>
            <p className={styles.heroText}>
              As 50 perguntas são sorteadas apenas no início, ficam guardadas no navegador e o resultado final é enviado
              para o email do encarregado de educação.
            </p>

            <div className={styles.formGrid}>
              <label className={styles.inputBlock}>
                <span>Nome do aluno</span>
                <input
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                  placeholder="Ex.: Mariana Silva"
                />
              </label>

              <label className={styles.inputBlock}>
                <span>Email do pai ou encarregado de educação</span>
                <input
                  type="email"
                  value={guardianEmail}
                  onChange={(event) => setGuardianEmail(event.target.value)}
                  placeholder="encarregado@email.pt"
                />
              </label>
            </div>

            <p className={styles.formHint}>O email é obrigatório, porque o resumo final será enviado para esse endereço.</p>

            {formError ? <p className={styles.errorText}>{formError}</p> : null}
            {invalidReason ? (
              <div className={styles.warningCard}>
                <strong>Sessão local inconsistente</strong>
                <p>{invalidReason}</p>
                <button type="button" className={styles.secondaryButton} onClick={handleRestart}>
                  Limpar sessão local
                </button>
              </div>
            ) : null}

            <div className={styles.modeGrid}>
              {(["jogo", "exame", "treino"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`${styles.modeCard} ${selectedMode === mode ? styles.modeCardActive : ""}`}
                  onClick={() => setSelectedMode(mode)}
                >
                  <span className={styles.modeTitle}>{MODE_LABELS[mode]}</span>
                  <span className={styles.modeText}>{MODE_DESCRIPTIONS[mode]}</span>
                </button>
              ))}
            </div>

            <div className={styles.actionRow}>
              <button type="button" className={styles.primaryButton} onClick={handleStartRun}>
                Começar run de 50 perguntas
              </button>
            </div>
          </div>

          <aside className={styles.sideCard}>
            <h3>Como funciona</h3>
            <ul className={styles.infoList}>
              <li>50 perguntas por run: 20 fáceis, 15 médias e 15 difíceis.</li>
              <li>Sem repetição dentro da mesma run e sem voltar atrás durante o jogo.</li>
              <li>Progresso guardado em `localStorage` para recuperar após refresh ou fecho.</li>
              <li>Resumo final com pontos, erros por tópico e perguntas falhadas.</li>
            </ul>
          </aside>
        </section>
      ) : null}

      {session ? (
        <section className={styles.gameLayout}>
          <aside className={styles.ladderCard}>
            <div className={styles.ladderHeader}>
              <div>
                <p className={styles.smallLabel}>Patamares</p>
                <h3>Escada do concurso</h3>
              </div>
              <p className={styles.scorePill}>{formatScore(session.score)} pontos</p>
            </div>

            <div className={styles.ladderList}>
              {PRIZE_LADDER.map((value, index) => {
                const answer = session.answers[index];
                const isCurrent = session.status === "active" && session.currentIndex === index;
                const stateClass = answer
                  ? answer.isCorrect
                    ? styles.ladderWon
                    : styles.ladderLost
                  : isCurrent
                    ? styles.ladderCurrent
                    : styles.ladderPending;

                return (
                  <div key={value + index} className={`${styles.ladderItem} ${stateClass}`}>
                    <span>#{index + 1}</span>
                    <strong>{formatScore(value)}</strong>
                  </div>
                );
              })}
            </div>
          </aside>

          <div className={styles.mainCard}>
            {session.status === "active" ? (
              <>
                <div className={styles.statusRow}>
                  <div>
                    <p className={styles.smallLabel}>{MODE_LABELS[session.mode]}</p>
                    <h2 className={styles.questionCounter}>
                      Pergunta {session.currentIndex + 1} de {TOTAL_QUESTIONS}
                    </h2>
                  </div>
                  <div className={styles.statsRow}>
                    <span>{getCorrectCount(session)} certas</span>
                    <span>{getWrongCount(session)} erradas</span>
                  </div>
                </div>

                <div className={styles.progressTrack} aria-hidden="true">
                  <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
                </div>

                {currentQuestion ? (
                  <article className={styles.questionPanel}>
                    <div className={styles.topicBadge}>
                      <span>{currentQuestion.topic}</span>
                      <span>{currentQuestion.difficulty}</span>
                      <span>{formatScore(getQuestionPoints(session.currentIndex))} pts</span>
                    </div>
                    <h3 className={styles.questionText}>{currentQuestion.prompt}</h3>

                    <div className={styles.optionsGrid}>
                      {currentQuestion.options.map((option, index) => {
                        const state =
                          session.phase === "question"
                            ? selectedOption === index
                              ? "selected"
                              : "idle"
                            : getOptionState(session, index);

                        return (
                          <button
                            key={`${currentQuestion.id}-${option}`}
                            type="button"
                            className={`${styles.optionCard} ${styles[`option${state[0].toUpperCase()}${state.slice(1)}`]}`}
                            onClick={() => (session.phase === "question" ? setSelectedOption(index) : undefined)}
                            disabled={session.phase !== "question"}
                          >
                            <span className={styles.optionLetter}>{String.fromCharCode(65 + index)}</span>
                            <span>{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    {session.phase === "feedback" && currentAnswer ? (
                      <div className={styles.feedbackPanel}>
                        <p className={currentAnswer.isCorrect ? styles.successText : styles.errorText}>
                          {currentAnswer.isCorrect ? "Resposta correta." : "Resposta incorreta."}
                        </p>

                        {session.mode !== "exame" ? (
                          <p className={styles.explanationText}>{currentQuestion.explanation}</p>
                        ) : (
                          <p className={styles.explanationText}>
                            Resposta registada. No modo exame as explicações aparecem apenas no resumo final.
                          </p>
                        )}

                        <button type="button" className={styles.primaryButton} onClick={handleAdvance}>
                          Pergunta seguinte
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={handleSubmitAnswer}
                        disabled={selectedOption === null}
                      >
                        Confirmar resposta
                      </button>
                    )}
                  </article>
                ) : null}
              </>
            ) : (
              <section className={styles.summaryPanel}>
                <div className={styles.summaryHeader}>
                  <div>
                    <p className={styles.smallLabel}>Run concluída</p>
                    <h2>Resumo final do aluno</h2>
                  </div>
                  <button type="button" className={styles.secondaryButton} onClick={handleRestart}>
                    Novo jogo
                  </button>
                </div>

                <div className={styles.summaryGrid}>
                  <div className={styles.summaryStat}>
                    <span>Pontuação</span>
                    <strong>{formatScore(session.score)}</strong>
                  </div>
                  <div className={styles.summaryStat}>
                    <span>Respostas certas</span>
                    <strong>{getCorrectCount(session)}</strong>
                  </div>
                  <div className={styles.summaryStat}>
                    <span>Respostas erradas</span>
                    <strong>{getWrongCount(session)}</strong>
                  </div>
                  <div className={styles.summaryStat}>
                    <span>Tempo total</span>
                    <strong>{formatElapsedTime(getTotalTimeSeconds(session))}</strong>
                  </div>
                </div>

                <div className={styles.emailCard}>
                  <div>
                    <p className={styles.smallLabel}>Envio de resultados</p>
                    <h3>{session.participant.guardianEmail}</h3>
                    <p className={styles.emailStatus}>
                      {session.emailStatus === "sending" && "A enviar email final..."}
                      {session.emailStatus === "sent" && "Email enviado com sucesso."}
                      {session.emailStatus === "error" && session.emailError}
                    </p>
                  </div>

                  {session.emailStatus === "error" ? (
                    <button type="button" className={styles.secondaryButton} onClick={handleRetryEmail}>
                      Tentar novamente
                    </button>
                  ) : null}
                </div>

                <div className={styles.summaryMeta}>
                  <span>Aluno: {session.participant.studentName}</span>
                  <span>Modo: {MODE_LABELS[session.mode]}</span>
                  <span>Início: {formatDateTime(session.startedAt)}</span>
                  <span>Fim: {formatDateTime(session.completedAt)}</span>
                </div>

                <div className={styles.summaryColumns}>
                  <div className={styles.summaryBlock}>
                    <h3>Tópicos com mais erros</h3>
                    <ul className={styles.infoList}>
                      {getTopMistakeTopics(session).length > 0 ? (
                        getTopMistakeTopics(session).map((item) => (
                          <li key={item.topic}>
                            {item.topic}: {item.count}
                          </li>
                        ))
                      ) : (
                        <li>Sem erros. Excelente run.</li>
                      )}
                    </ul>
                  </div>

                  <div className={styles.summaryBlock}>
                    <h3>Perguntas falhadas</h3>
                    <div className={styles.missedList}>
                      {buildResultsPayload(session).missedQuestions.length > 0 ? (
                        buildResultsPayload(session).missedQuestions.map((item) => (
                          <article key={item.id} className={styles.missedCard}>
                            <strong>{item.prompt}</strong>
                            <p>Respondido: {item.selectedAnswer}</p>
                            <p>Correto: {item.correctAnswer}</p>
                            <p>{item.explanation}</p>
                          </article>
                        ))
                      ) : (
                        <p>Nenhuma pergunta falhada nesta run.</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </section>
      ) : null}

      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </main>
  );
}
