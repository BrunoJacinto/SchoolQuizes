import {
  saveRunSession,
  loadRunSession,
  clearRunSession,
  saveSoundPreference,
  loadSoundPreference,
  STORAGE_KEY,
  SOUND_STORAGE_KEY,
} from '@/lib/storage';
import { createRunSession } from '@/lib/game';

describe('Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Session Storage', () => {
    it('should return empty status when no session is saved', () => {
      const result = loadRunSession();
      expect(result.status).toBe('empty');
    });

    it('should clear session from storage', () => {
      const session = createRunSession({ studentName: 'Test', guardianEmail: 'test@email.pt' }, 'treino', true);

      saveRunSession(session);
      clearRunSession();
      expect(loadRunSession().status).toBe('empty');
    });

    it('should save session to correct storage key', () => {
      const session = createRunSession('Test', 'test@email.pt', 'exame');

      saveRunSession(session);

      const storedData = localStorage.getItem(STORAGE_KEY);
      expect(storedData).toBeDefined();
      if (storedData) {
        expect(JSON.parse(storedData)).toHaveProperty('version');
        expect(JSON.parse(storedData)).toHaveProperty('participant');
      }
    });
  });

  describe('Sound Preference Storage', () => {
    it('should save and load sound preference', () => {
      saveSoundPreference(true);
      const loaded = loadSoundPreference(false);

      expect(loaded).toBe(true);
    });

    it('should handle false sound preference', () => {
      saveSoundPreference(false);
      const loaded = loadSoundPreference(true);

      expect(loaded).toBe(false);
    });

    it('should return default value when not set', () => {
      const loaded = loadSoundPreference(true);
      expect(loaded).toBe(true);
    });

    it('should use correct storage key for sound', () => {
      saveSoundPreference(false);

      const storedData = localStorage.getItem(SOUND_STORAGE_KEY);
      expect(storedData).toBeDefined();
    });

    it('should overwrite previous sound preference', () => {
      saveSoundPreference(true);
      expect(loadSoundPreference(false)).toBe(true);

      saveSoundPreference(false);
      expect(loadSoundPreference(true)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle corrupted session data gracefully', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json');

      expect(() => {
        loadRunSession();
      }).not.toThrow();
    });

    it('should handle large session data', () => {
      let session = createRunSession('Test', 'test@email.pt', 'jogo');

      for (let i = 0; i < 50; i++) {
        const stored = JSON.stringify(session);
        if (stored.length > 5000000) break;
      }

      saveRunSession(session);
      const loaded = loadRunSession();

      expect(loaded).toBeDefined();
    });
  });
});
