"use client";

import { GamesPerMatch, Tournament, TournamentStore } from "@/lib/types";

const STORAGE_KEY = "padel-locos-store";

export const defaultStore: TournamentStore = {
  tournaments: [],
  activeTournamentId: null,
  theme: "light",
};

function normalizeTournament(tournament: Tournament): Tournament {
  return {
    ...tournament,
    gamesPerMatch: (tournament.gamesPerMatch ?? 6) as GamesPerMatch,
  };
}

export function loadStore() {
  if (typeof window === "undefined") {
    return defaultStore;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultStore;
    }

    const parsed = JSON.parse(raw) as TournamentStore;
    return {
      ...defaultStore,
      ...parsed,
      tournaments: (parsed.tournaments ?? []).map(normalizeTournament),
    };
  } catch {
    return defaultStore;
  }
}

export function saveStore(store: TournamentStore) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
