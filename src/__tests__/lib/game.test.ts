import {
  SESSION_VERSION,
  TOTAL_QUESTIONS,
  QUESTION_DISTRIBUTION,
  signSession,
  selectRunQuestions,
  getQuestionPoints,
  createRunSession,
  getCurrentQuestion,
  getCurrentAnswer,
  submitAnswer,
  advanceSession,
  setRunSound,
  setEmailState,
  formatScore,
  formatElapsedTime,
  buildResultsPayload,
  getCorrectCount,
  getWrongCount,
  getAnsweredCount,
  getTotalTimeSeconds,
  getTopMistakeTopics,
  useFiftyFiftyLifeline,
} from '@/lib/game';

describe('Game Utilities', () => {
  describe('Constants', () => {
    it('should have correct session version', () => {
      expect(SESSION_VERSION).toBe(1);
    });

    it('should have total questions set to 50', () => {
      expect(TOTAL_QUESTIONS).toBe(50);
    });

    it('should have correct question distribution', () => {
      const total = Object.values(QUESTION_DISTRIBUTION).reduce((a, b) => a + b, 0);
      expect(total).toBe(TOTAL_QUESTIONS);
      expect(QUESTION_DISTRIBUTION.facil).toBe(20);
      expect(QUESTION_DISTRIBUTION.medio).toBe(15);
      expect(QUESTION_DISTRIBUTION.dificil).toBe(15);
    });
  });

  describe('selectRunQuestions', () => {
    it('should select exactly 50 questions', () => {
      const questions = selectRunQuestions();
      expect(questions).toHaveLength(TOTAL_QUESTIONS);
    });

    it('should select questions with correct distribution', () => {
      const questions = selectRunQuestions();
      const easyCount = questions.filter((q) => q.difficulty === 'facil').length;
      const mediumCount = questions.filter((q) => q.difficulty === 'medio').length;
      const hardCount = questions.filter((q) => q.difficulty === 'dificil').length;

      expect(easyCount).toBe(20);
      expect(mediumCount).toBe(15);
      expect(hardCount).toBe(15);
    });

    it('should have unique question IDs', () => {
      const questions = selectRunQuestions();
      const ids = new Set(questions.map((q) => q.id));
      expect(ids.size).toBe(TOTAL_QUESTIONS);
    });

    it('should have 4 options per question', () => {
      const questions = selectRunQuestions();
      questions.forEach((q) => {
        expect(q.options).toHaveLength(4);
      });
    });
  });

  describe('getQuestionPoints', () => {
    it('should return correct points for early questions', () => {
      expect(getQuestionPoints(0)).toBe(25);
    });

    it('should return correct points for mid-range questions', () => {
      expect(getQuestionPoints(14)).toBe(500);
    });

    it('should return maximum points for final questions', () => {
      expect(getQuestionPoints(49)).toBe(1000000);
    });

    it('should increase points with question progress', () => {
      const points0 = getQuestionPoints(0);
      const points10 = getQuestionPoints(10);
      const points49 = getQuestionPoints(49);

      expect(points10).toBeGreaterThan(points0);
      expect(points49).toBeGreaterThan(points10);
    });
  });

  describe('createRunSession', () => {
    it('should create a valid session', () => {
      const session = createRunSession({ studentName: 'João Silva', guardianEmail: 'joao@email.pt' }, 'jogo', true);

      expect(session.mode).toBe('jogo');
      expect(session.status).toBe('active');
      expect(session.phase).toBe('question');
      expect(session.currentIndex).toBe(0);
      expect(session.answers).toHaveLength(0);
      expect(session.version).toBe(1);
    });

    it('should set correct integrity hash', () => {
      const session = createRunSession('Test', 'test@email.pt', 'treino');
      expect(session.integrity).toBeDefined();
      expect(typeof session.integrity).toBe('string');
    });

    it('should have 50 questions', () => {
      const session = createRunSession('Test', 'test@email.pt', 'exame');
      expect(session.questions).toHaveLength(50);
    });
  });

  describe('getCurrentQuestion', () => {
    it('should return first question initially', () => {
      const session = createRunSession('Test', 'test@email.pt', 'jogo');
      const question = getCurrentQuestion(session);

      expect(question).toBeDefined();
      expect(question?.id).toBe(session.questions[0].id);
    });

    it('should return null when index exceeds questions length', () => {
      const session = createRunSession('Test', 'test@email.pt', 'jogo');
      session.currentIndex = 100;

      const question = getCurrentQuestion(session);
      expect(question).toBeNull();
    });
  });

  describe('submitAnswer', () => {
    it('should record correct answer', () => {
      const session = createRunSession('Test', 'test@email.pt', 'jogo');
      const question = getCurrentQuestion(session);

      const updated = submitAnswer(session, question!.correctIndex);

      expect(updated.answers).toHaveLength(1);
      expect(updated.answers[0].isCorrect).toBe(true);
      expect(updated.answers[0].selectedIndex).toBe(question!.correctIndex);
    });

    it('should record incorrect answer', () => {
      const session = createRunSession('Test', 'test@email.pt', 'jogo');
      const incorrectIndex = session.questions[0].correctIndex === 0 ? 1 : 0;

      const updated = submitAnswer(session, incorrectIndex);

      expect(updated.answers[0].isCorrect).toBe(false);
    });

    it('should change phase to feedback after answer', () => {
      const session = createRunSession('Test', 'test@email.pt', 'jogo');

      const updated = submitAnswer(session, 0);

      expect(updated.phase).toBe('feedback');
    });

    it('should update score for correct answer', () => {
      const session = createRunSession('Test', 'test@email.pt', 'jogo');
      const question = getCurrentQuestion(session);

      const updated = submitAnswer(session, question!.correctIndex);

      expect(updated.score).toBeGreaterThan(0);
    });
  });

  describe('advanceSession', () => {
    it('should move to next question', () => {
      const session = createRunSession('Test', 'test@email.pt', 'jogo');
      const firstQuestion = getCurrentQuestion(session);

      let updated = submitAnswer(session, 0);
      updated = advanceSession(updated);

      const nextQuestion = getCurrentQuestion(updated);

      expect(nextQuestion?.id).not.toBe(firstQuestion?.id);
      expect(updated.currentIndex).toBe(1);
    });

    it('should change phase back to question', () => {
      const session = createRunSession('Test', 'test@email.pt', 'jogo');

      let updated = submitAnswer(session, 0);
      updated = advanceSession(updated);

      expect(updated.phase).toBe('question');
    });

    it('should advance to next question', () => {
      const session = createRunSession('Test', 'test@email.pt', 'jogo');
      const firstIndex = session.currentIndex;

      let updated = submitAnswer(session, 0);
      updated = advanceSession(updated);

      expect(updated.currentIndex).toBe(firstIndex + 1);
    });
  });

  describe('setRunSound', () => {
    it('should enable sound', () => {
      const session = createRunSession('Test', 'test@email.pt', 'jogo');
      const updated = setRunSound(session, true);

      expect(updated.soundEnabled).toBe(true);
    });

    it('should disable sound', () => {
      const session = createRunSession('Test', 'test@email.pt', 'jogo');
      const updated = setRunSound(session, false);

      expect(updated.soundEnabled).toBe(false);
    });
  });

  describe('setEmailState', () => {
    it('should set email status', () => {
      const session = createRunSession('Test', 'test@email.pt', 'jogo');
      const updated = setEmailState(session, 'sending');

      expect(updated.emailStatus).toBe('sending');
    });
  });

  describe('Score and Time Formatting', () => {
    it('should format score correctly', () => {
      const formattedTen = formatScore(10000);
      const formattedHundred = formatScore(100000);

      expect(formatScore(100)).toBe('100');
      expect(formattedTen).toMatch(/10[\s.]000/);
      expect(formattedHundred).toMatch(/100[\s.]000/);
    });

    it('should format elapsed time correctly', () => {
      expect(formatElapsedTime(30)).toContain('30s');
      expect(formatElapsedTime(120)).toContain('2m');
      expect(formatElapsedTime(3661)).toContain('1h');
    });
  });

  describe('Session Stats', () => {
    it('should count correct answers', () => {
      let session = createRunSession('Test', 'test@email.pt', 'jogo');
      const question = getCurrentQuestion(session);

      session = submitAnswer(session, question!.correctIndex);

      expect(getCorrectCount(session)).toBe(1);
    });

    it('should count wrong answers', () => {
      let session = createRunSession('Test', 'test@email.pt', 'jogo');
      const question = getCurrentQuestion(session);
      const incorrectIndex = question!.correctIndex === 0 ? 1 : 0;

      session = submitAnswer(session, incorrectIndex);

      expect(getWrongCount(session)).toBe(1);
    });

    it('should count answered questions', () => {
      let session = createRunSession('Test', 'test@email.pt', 'jogo');

      session = submitAnswer(session, 0);
      session = advanceSession(session);
      session = submitAnswer(session, 0);

      expect(getAnsweredCount(session)).toBe(2);
    });
  });

  describe('Mistake Topics', () => {
    it('should identify top mistake topics', () => {
      let session = createRunSession('Test', 'test@email.pt', 'jogo');
      const question = getCurrentQuestion(session);
      const incorrectIndex = question!.correctIndex === 0 ? 1 : 0;

      session = submitAnswer(session, incorrectIndex);

      const mistakes = getTopMistakeTopics(session);
      expect(mistakes).toBeDefined();
      expect(Array.isArray(mistakes)).toBe(true);
    });
  });

  describe('Cutthroat Mode', () => {
    it('should initialize cutthroat session with 0 wrong answers', () => {
      const session = createRunSession({ studentName: 'Test', guardianEmail: 'test@email.pt' }, 'cutthroat', true);

      expect(session.wrongAnswersCount).toBe(0);
      expect(session.lifelineState?.fiftyFiftyUsed).toBe(false);
    });

    it('should increment wrong answer count on incorrect answer', () => {
      let session = createRunSession({ studentName: 'Test', guardianEmail: 'test@email.pt' }, 'cutthroat', true);
      const question = getCurrentQuestion(session);
      const incorrectIndex = question!.correctIndex === 0 ? 1 : 0;

      session = submitAnswer(session, incorrectIndex);

      expect(session.wrongAnswersCount).toBe(1);
    });

    it('should not increment wrong count on correct answer', () => {
      let session = createRunSession({ studentName: 'Test', guardianEmail: 'test@email.pt' }, 'cutthroat', true);
      const question = getCurrentQuestion(session);

      session = submitAnswer(session, question!.correctIndex);

      expect(session.wrongAnswersCount).toBe(0);
    });

    it('should end session after 3 wrong answers', () => {
      let session = createRunSession({ studentName: 'Test', guardianEmail: 'test@email.pt' }, 'cutthroat', true);

      // First wrong answer
      let question = getCurrentQuestion(session);
      let incorrectIndex = question!.correctIndex === 0 ? 1 : 0;
      session = submitAnswer(session, incorrectIndex);
      expect(session.status).toBe('active');
      expect(session.wrongAnswersCount).toBe(1);
      session = advanceSession(session);

      // Second wrong answer
      question = getCurrentQuestion(session);
      incorrectIndex = question!.correctIndex === 0 ? 1 : 0;
      session = submitAnswer(session, incorrectIndex);
      expect(session.status).toBe('active');
      expect(session.wrongAnswersCount).toBe(2);
      session = advanceSession(session);

      // Third wrong answer - should end the session
      question = getCurrentQuestion(session);
      incorrectIndex = question!.correctIndex === 0 ? 1 : 0;
      session = submitAnswer(session, incorrectIndex);
      expect(session.status).toBe('completed');
      expect(session.wrongAnswersCount).toBe(3);
    });

    it('should use 50/50 lifeline correctly', () => {
      const session = createRunSession({ studentName: 'Test', guardianEmail: 'test@email.pt' }, 'cutthroat', true);
      const updatedSession = useFiftyFiftyLifeline(session);

      expect(updatedSession.lifelineState?.fiftyFiftyUsed).toBe(true);
      expect(updatedSession.cutthroatHiddenOptions).toHaveLength(2);
    });

    it('should not reuse 50/50 lifeline', () => {
      let session = createRunSession({ studentName: 'Test', guardianEmail: 'test@email.pt' }, 'cutthroat', true);

      session = useFiftyFiftyLifeline(session);
      const secondAttempt = useFiftyFiftyLifeline(session);

      expect(secondAttempt.cutthroatHiddenOptions).toEqual(session.cutthroatHiddenOptions);
    });

    it('should keep correct answer visible when using 50/50', () => {
      const session = createRunSession({ studentName: 'Test', guardianEmail: 'test@email.pt' }, 'cutthroat', true);
      const question = getCurrentQuestion(session);
      const updatedSession = useFiftyFiftyLifeline(session);

      expect(updatedSession.cutthroatHiddenOptions).toBeDefined();
      expect(updatedSession.cutthroatHiddenOptions).not.toContain(question!.correctIndex);
    });
  });
});
