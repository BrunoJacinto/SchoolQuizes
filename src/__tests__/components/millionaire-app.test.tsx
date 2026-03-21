import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MillionaireApp } from '@/components/millionaire-app';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('MillionaireApp Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should render without crashing', () => {
      render(<MillionaireApp />);
      expect(screen.getByText(/Quem Quer Ser Milionário/i)).toBeInTheDocument();
    });

    it('should display app title', async () => {
      render(<MillionaireApp />);
      await waitFor(() => {
        expect(
          screen.getByText(/Quem Quer Ser Milionário.*5.º Ano/i)
        ).toBeInTheDocument();
      });
    });

  });

  describe('Sound Toggle', () => {
    it('should display sound toggle button', async () => {
      render(<MillionaireApp />);

      await waitFor(() => {
        expect(screen.getByText(/Som:/i)).toBeInTheDocument();
      });
    });
  });
});
