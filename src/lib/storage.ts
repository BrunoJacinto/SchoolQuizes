import { SOUND_STORAGE_KEY, STORAGE_KEY, validateRunSession } from "@/lib/game";
import type { RunSession } from "@/types/game";

export type LoadSessionResult =
  | { status: "empty" }
  | { status: "ready"; session: RunSession }
  | { status: "invalid"; reason: string };

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveRunSession(session: RunSession): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadRunSession(): LoadSessionResult {
  if (!isBrowser()) {
    return { status: "empty" };
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return { status: "empty" };
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;
    const validation = validateRunSession(parsedValue);

    if (!validation.valid) {
      return { status: "invalid", reason: validation.reason };
    }

    return { status: "ready", session: validation.session };
  } catch {
    return { status: "invalid", reason: "Não foi possível ler a sessão guardada no navegador." };
  }
}

export function clearRunSession(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function saveSoundPreference(enabled: boolean): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(enabled));
}

export function loadSoundPreference(defaultValue: boolean): boolean {
  if (!isBrowser()) {
    return defaultValue;
  }

  const rawValue = window.localStorage.getItem(SOUND_STORAGE_KEY);

  if (rawValue === null) {
    return defaultValue;
  }

  try {
    return Boolean(JSON.parse(rawValue));
  } catch {
    return defaultValue;
  }
}
