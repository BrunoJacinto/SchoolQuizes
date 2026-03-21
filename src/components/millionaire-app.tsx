"use client";

import { startTransition, useEffect, useEffectEvent, useRef, useState } from "react";
import { useLanguage } from "@/contexts/language-context";

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
  useFiftyFiftyLifeline,
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
  const { language, setLanguage, t } = useLanguage();
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
    setToast(t("nav.backWarning"));
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
        throw new Error(payload.message ?? t("email.failedToSend"));
      }

      setSession((current) => (current ? setEmailState(current, "sent") : current));
      setToast(t("email.sentSuccess"));
    } catch (error) {
      const message = error instanceof Error ? error.message : t("email.sendFailed");
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
      setToast(t("nav.sessionRecovered"));
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

  useEffect(() => {
    if (!session || session.status !== "active") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      const optionMap: { [key: string]: number } = {
        A: 0,
        B: 1,
        C: 2,
        D: 3,
      };

      if (!(key in optionMap)) {
        return;
      }

      event.preventDefault();
      const selectedIndex = optionMap[key];

      if (session.phase === "question") {
        // Submit the answer with the selected option
        const updatedSession = submitAnswer(session, selectedIndex);
        const latestAnswer = updatedSession.answers[updatedSession.answers.length - 1];
        playFeedbackSound(latestAnswer?.isCorrect ? "correct" : "wrong");
        startTransition(() => {
          setSession(updatedSession);
        });
      } else if (session.phase === "feedback") {
        // Advance to next question
        playFeedbackSound("advance");
        startTransition(() => {
          setSession(advanceSession(session));
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [session]);

  function handleStartRun() {
    const trimmedName = studentName.trim();
    const trimmedEmail = guardianEmail.trim();

    if (!trimmedName) {
      setFormError(t("form.error.nameEmpty"));
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setFormError(t("form.error.emailInvalid2"));
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
        <div className={styles.loadingPanel}>{t("game.loading")}</div>
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
          <img src="/quemquersemilionario.png" alt={t('app.title')} className={styles.logo} />
          <p className={styles.schoolLabel}>{t('app.school')}</p>
          <h1 className={styles.title}>{t('app.title')}</h1>
          <p className={styles.subtitle}>
            {t('app.subtitle')}
          </p>
        </div>

        <div className={styles.headerControls}>
          <button type="button" className={styles.languageToggle} onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}>
            {language === 'pt' ? 'EN' : 'PT'}
          </button>
          <button type="button" className={styles.soundToggle} onClick={handleSoundToggle}>
            {t(activeSound ? 'button.sound.on' : 'button.sound.off')}
          </button>
        </div>
      </header>

      {!session ? (
        <section className={styles.heroGrid}>
          <div className={styles.heroCard}>
            <p className={styles.kicker}>{t('hero.kicker')}</p>
            <h2 className={styles.heroTitle}>{t('hero.title')}</h2>
            <p className={styles.heroText}>
              {t('hero.text')}
            </p>

            <div className={styles.formGrid}>
              <label className={styles.inputBlock}>
                <span>{t('form.studentName')}</span>
                <input
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                  placeholder={t('form.studentNamePlaceholder')}
                />
              </label>

              <label className={styles.inputBlock}>
                <span>{t('form.guardianEmail')}</span>
                <input
                  type="email"
                  value={guardianEmail}
                  onChange={(event) => setGuardianEmail(event.target.value)}
                  placeholder={t('form.guardianEmailPlaceholder')}
                />
              </label>
            </div>

            <p className={styles.formHint}>{t('app.formHint')}</p>

            {formError ? <p className={styles.errorText}>{formError}</p> : null}
            {invalidReason ? (
              <div className={styles.warningCard}>
                <strong>{t('form.sessionInvalid')}</strong>
                <p>{invalidReason}</p>
                <button type="button" className={styles.secondaryButton} onClick={handleRestart}>
                  {t('form.clearSession')}
                </button>
              </div>
            ) : null}

            <div className={styles.modeGrid}>
              {(["jogo", "exame", "treino", "cutthroat"] as const).map((mode) => (
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
                {t('hero.startButton')}
              </button>
            </div>
          </div>

          <aside className={styles.sideCard}>
            <h3>{t('sidebar.title')}</h3>
            <ul className={styles.infoList}>
              <li>{t('sidebar.item1')}</li>
              <li>{t('sidebar.item2')}</li>
              <li>{t('sidebar.item3')}</li>
              <li>{t('sidebar.item4')}</li>
            </ul>
          </aside>
        </section>
      ) : null}

      {session ? (
        <section className={styles.gameLayout}>
          <aside className={styles.ladderCard}>
            <div className={styles.ladderHeader}>
              <div>
                <p className={styles.smallLabel}>{t('game.milestones')}</p>
                <h3>{t('game.ladder')}</h3>
              </div>
              <p className={styles.scorePill}>{formatScore(session.score)} {t('game.points')}</p>
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
                    <p className={styles.smallLabel}>{t(`mode.${session.mode}`)}</p>
                    <h2 className={styles.questionCounter}>
                      {t('game.questionCounter')} {session.currentIndex + 1} {t('game.of')} {TOTAL_QUESTIONS}
                    </h2>
                  </div>
                  <div className={styles.statsRow}>
                    <span>{getCorrectCount(session)} {t('game.correct.lower')}</span>
                    <span>{getWrongCount(session)} {t('game.wrong.lower')}</span>
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

                    {session.mode === "cutthroat" && (
                      <div className={styles.cutthroatInfo}>
                        <div className={styles.errorCounter}>
                          {t('cutthroat.errorLabel')}: {session.wrongAnswersCount ?? 0}/3
                        </div>
                        <button
                          type="button"
                          className={styles.lifelineButton}
                          onClick={() => {
                            startTransition(() => {
                              setSession(useFiftyFiftyLifeline(session));
                            });
                          }}
                          disabled={
                            session.phase !== "question" ||
                            session.lifelineState?.fiftyFiftyUsed ||
                            selectedOption !== null
                          }
                        >
                          {session.lifelineState?.fiftyFiftyUsed ? t('button.used50') : t('button.use50')}
                        </button>
                      </div>
                    )}

                    <div className={styles.optionsGrid}>
                      {currentQuestion.options.map((option, index) => {
                        const isHidden = session.cutthroatHiddenOptions?.includes(index) ?? false;
                        if (isHidden) return null;

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
                          {currentAnswer.isCorrect ? t('feedback.correctAnswer') : t('feedback.wrongAnswer')}
                        </p>

                        {session.mode !== "exame" ? (
                          <p className={styles.explanationText}>{currentQuestion.explanation}</p>
                        ) : (
                          <p className={styles.explanationText}>
                            {t('feedback.examMode')}
                          </p>
                        )}

                        <button type="button" className={styles.primaryButton} onClick={handleAdvance}>
                          {t('nextButton')}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={handleSubmitAnswer}
                        disabled={selectedOption === null}
                      >
                        {t('confirmButton')}
                      </button>
                    )}
                  </article>
                ) : null}
              </>
            ) : (
              <section className={styles.summaryPanel}>
                <div className={styles.summaryHeader}>
                  <div>
                    <p className={styles.smallLabel}>{t('results.runCompleted')}</p>
                    <h2>{t('results.studentSummary')}</h2>
                  </div>
                  <button type="button" className={styles.secondaryButton} onClick={handleRestart}>
                    {t('results.newGame')}
                  </button>
                </div>

                <div className={styles.summaryGrid}>
                  <div className={styles.summaryStat}>
                    <span>{t('results.score')}</span>
                    <strong>{formatScore(session.score)}</strong>
                  </div>
                  <div className={styles.summaryStat}>
                    <span>{t('results.correctAnswers')}</span>
                    <strong>{getCorrectCount(session)}</strong>
                  </div>
                  <div className={styles.summaryStat}>
                    <span>{t('results.wrongAnswers')}</span>
                    <strong>{getWrongCount(session)}</strong>
                  </div>
                  <div className={styles.summaryStat}>
                    <span>{t('results.totalTime')}</span>
                    <strong>{formatElapsedTime(getTotalTimeSeconds(session))}</strong>
                  </div>
                </div>

                <div className={styles.emailCard}>
                  <div>
                    <p className={styles.smallLabel}>{t('results.emailSection')}</p>
                    <h3>{session.participant.guardianEmail}</h3>
                    <p className={styles.emailStatus}>
                      {session.emailStatus === "sending" && t('email.sending')}
                      {session.emailStatus === "sent" && t('email.sent')}
                      {session.emailStatus === "error" && session.emailError}
                    </p>
                  </div>

                  {session.emailStatus === "error" ? (
                    <button type="button" className={styles.secondaryButton} onClick={handleRetryEmail}>
                      {t('results.retryEmail')}
                    </button>
                  ) : null}
                </div>

                <div className={styles.summaryMeta}>
                  <span>{t('results.student')}: {session.participant.studentName}</span>
                  <span>{t('results.mode')}: {t(`mode.${session.mode}`)}</span>
                  <span>{t('results.started')}: {formatDateTime(session.startedAt)}</span>
                  <span>{t('results.finished')}: {formatDateTime(session.completedAt)}</span>
                </div>

                <div className={styles.summaryColumns}>
                  <div className={styles.summaryBlock}>
                    <h3>{t('results.topicsMistakes')}</h3>
                    <ul className={styles.infoList}>
                      {getTopMistakeTopics(session).length > 0 ? (
                        getTopMistakeTopics(session).map((item) => (
                          <li key={item.topic}>
                            {item.topic}: {item.count}
                          </li>
                        ))
                      ) : (
                        <li>{t('results.noErrors')}</li>
                      )}
                    </ul>
                  </div>

                  <div className={styles.summaryBlock}>
                    <h3>{t('results.missedQuestions')}</h3>
                    <div className={styles.missedList}>
                      {buildResultsPayload(session).missedQuestions.length > 0 ? (
                        buildResultsPayload(session).missedQuestions.map((item) => (
                          <article key={item.id} className={styles.missedCard}>
                            <strong>{item.prompt}</strong>
                            <p>{t('results.yourAnswer')}: {item.selectedAnswer}</p>
                            <p>{t('results.correctAnswer')}: {item.correctAnswer}</p>
                            <p>{item.explanation}</p>
                          </article>
                        ))
                      ) : (
                        <p>{t('results.noMissed')}</p>
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

      <footer className={styles.footer}>
        <p>
          {t('footer.credit')}{" "}
          <a href="https://www.linkedin.com/in/brunojacinto/" target="_blank" rel="noopener noreferrer">
            Bruno Jacinto
          </a>
        </p>
      </footer>
    </main>
  );
}
