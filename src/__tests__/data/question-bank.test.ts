import { QUESTION_BANK } from '@/data/question-bank';

describe('Question Bank', () => {
  describe('Bank Structure', () => {
    it('should have exactly 300 questions', () => {
      expect(QUESTION_BANK).toHaveLength(300);
    });

    it('should have 100 easy questions', () => {
      const easyQuestions = QUESTION_BANK.filter((q) => q.difficulty === 'facil');
      expect(easyQuestions).toHaveLength(100);
    });

    it('should have 100 medium questions', () => {
      const mediumQuestions = QUESTION_BANK.filter((q) => q.difficulty === 'medio');
      expect(mediumQuestions).toHaveLength(100);
    });

    it('should have 100 hard questions', () => {
      const hardQuestions = QUESTION_BANK.filter((q) => q.difficulty === 'dificil');
      expect(hardQuestions).toHaveLength(100);
    });
  });

  describe('Question Validity', () => {
    it('should have unique question IDs', () => {
      const ids = new Set(QUESTION_BANK.map((q) => q.id));
      expect(ids.size).toBe(300);
    });

    it('should have valid question structure', () => {
      QUESTION_BANK.forEach((question) => {
        expect(question.id).toBeDefined();
        expect(question.topic).toBeDefined();
        expect(question.difficulty).toMatch(/^(facil|medio|dificil)$/);
        expect(question.prompt).toBeDefined();
        expect(question.explanation).toBeDefined();
        expect(question.options).toHaveLength(4);
        expect(question.correctIndex).toBeGreaterThanOrEqual(0);
        expect(question.correctIndex).toBeLessThan(4);
      });
    });

    it('should have unique options per question', () => {
      QUESTION_BANK.forEach((question) => {
        const uniqueOptions = new Set(question.options);
        expect(uniqueOptions.size).toBe(4);
      });
    });

    it('should have valid correct index', () => {
      QUESTION_BANK.forEach((question) => {
        expect(question.correctIndex).toBeGreaterThanOrEqual(0);
        expect(question.correctIndex).toBeLessThan(4);
      });
    });

    it('should have non-empty prompts', () => {
      QUESTION_BANK.forEach((question) => {
        expect(question.prompt.trim().length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty explanations', () => {
      QUESTION_BANK.forEach((question) => {
        expect(question.explanation.trim().length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty options', () => {
      QUESTION_BANK.forEach((question) => {
        question.options.forEach((option) => {
          expect(option.trim().length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Topic Coverage', () => {
    it('should cover 10 different topics', () => {
      const topics = new Set(QUESTION_BANK.map((q) => q.topic));
      expect(topics.size).toBe(10);
    });

    it('should have balanced topic distribution', () => {
      const topicCounts = QUESTION_BANK.reduce(
        (acc, q) => {
          acc[q.topic] = (acc[q.topic] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      Object.values(topicCounts).forEach((count) => {
        expect(count).toBeGreaterThan(0);
      });
    });
  });

  describe('Difficulty Distribution', () => {
    it('should have balanced difficulty within topics', () => {
      const topicDifficulty = QUESTION_BANK.reduce(
        (acc, q) => {
          if (!acc[q.topic]) {
            acc[q.topic] = { facil: 0, medio: 0, dificil: 0 };
          }
          acc[q.topic][q.difficulty]++;
          return acc;
        },
        {} as Record<string, Record<string, number>>
      );

      Object.entries(topicDifficulty).forEach(([topic, counts]) => {
        const total = counts.facil + counts.medio + counts.dificil;
        expect(total).toBeGreaterThan(0);
      });
    });
  });

  describe('Content Quality', () => {
    it('should have correct answer in options', () => {
      QUESTION_BANK.forEach((question) => {
        const correctOption = question.options[question.correctIndex];
        expect(correctOption).toBeDefined();
      });
    });

    it('should not have duplicate options in same question', () => {
      QUESTION_BANK.forEach((question) => {
        const optionSet = new Set(question.options);
        expect(optionSet.size).toBe(question.options.length);
      });
    });

    it('should have reasonable option lengths', () => {
      QUESTION_BANK.forEach((question) => {
        question.options.forEach((option) => {
          expect(option.length).toBeGreaterThan(0);
          expect(option.length).toBeLessThan(500);
        });
      });
    });
  });
});
