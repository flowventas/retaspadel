"use client";

import { useMemo, useState } from "react";
import { sampleNames } from "@/lib/sample";
import { GamesPerMatch, TournamentFormat } from "@/lib/types";

type NewTournamentFormProps = {
  onCreate: (payload: {
    name: string;
    format: TournamentFormat;
    gamesPerMatch: GamesPerMatch;
    names: string[];
  }) => void;
  savedPlayers: string[];
};

const PLAYER_OPTIONS: TournamentFormat[] = [8, 12, 16, 20];
const GAME_OPTIONS: GamesPerMatch[] = [5, 6];

function buildTournamentName(format: TournamentFormat, gamesPerMatch: GamesPerMatch) {
  return `Reta ${format} jugadores · a ${gamesPerMatch} juegos`;
}

export function NewTournamentForm({ onCreate, savedPlayers }: NewTournamentFormProps) {
  const [format, setFormat] = useState<TournamentFormat>(8);
  const [gamesPerMatch, setGamesPerMatch] = useState<GamesPerMatch>(6);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [names, setNames] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draftName, setDraftName] = useState("");
  const [error, setError] = useState("");

  const progress = useMemo(() => `${Math.min(currentIndex + 1, format)}/${format}`, [currentIndex, format]);
  const suggestedPlayers = useMemo(() => {
    const usedNames = new Set(
      names
        .filter((_, index) => index !== currentIndex)
        .map((item) => item.trim().toLocaleLowerCase())
        .filter(Boolean),
    );
    const query = draftName.trim().toLocaleLowerCase();

    return savedPlayers
      .filter((name) => {
        const normalized = name.trim().toLocaleLowerCase();
        if (!normalized || usedNames.has(normalized)) {
          return false;
        }

        return query ? normalized.includes(query) : true;
      })
      .slice(0, 8);
  }, [currentIndex, draftName, names, savedPlayers]);

  function openPlayerModal() {
    setNames(Array.from({ length: format }, () => ""));
    setCurrentIndex(0);
    setDraftName("");
    setError("");
    setIsModalOpen(true);
  }

  function closePlayerModal() {
    setIsModalOpen(false);
    setCurrentIndex(0);
    setDraftName("");
    setError("");
  }

  function handleFormatChange(nextFormat: TournamentFormat) {
    setFormat(nextFormat);
    setError("");
  }

  function handleNextPlayer() {
    const trimmedName = draftName.trim();
    const currentNames = [...names];
    const duplicate = currentNames.some(
      (item, index) => index !== currentIndex && item.trim().toLowerCase() === trimmedName.toLowerCase(),
    );

    if (!trimmedName) {
      setError("Escribe un nombre antes de continuar.");
      return;
    }

    if (duplicate) {
      setError("Ese nombre ya fue capturado. Usa uno distinto.");
      return;
    }

    currentNames[currentIndex] = trimmedName;
    setNames(currentNames);
    setError("");

    if (currentIndex === format - 1) {
      onCreate({
        name: buildTournamentName(format, gamesPerMatch),
        format,
        gamesPerMatch,
        names: currentNames,
      });
      closePlayerModal();
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setDraftName(currentNames[nextIndex] ?? "");
  }

  function handlePickSuggestedPlayer(name: string) {
    setDraftName(name);
    setError("");
  }

  function handleUseDemo() {
    onCreate({
      name: buildTournamentName(format, gamesPerMatch),
      format,
      gamesPerMatch,
      names: sampleNames(format),
    });
  }

  return (
    <>
      <section className="grid gap-6 rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.55)] backdrop-blur md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-secondary)]">
              Nuevo torneo
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[var(--app-text)]">
              Configura la reta y captura nombres en popup
            </h2>
          </div>
          <button
            type="button"
            onClick={handleUseDemo}
            className="rounded-full border border-[var(--brand-primary)] bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-secondary)]"
          >
            Cargar demo
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[var(--app-text)]">
            Numero de jugadores
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[var(--surface-subtle)] p-1">
              {PLAYER_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleFormatChange(option)}
                  className={`rounded-[1rem] px-4 py-3 text-sm font-bold transition ${
                    format === option
                      ? "bg-[var(--brand-secondary)] text-white shadow-lg"
                      : "text-[var(--muted)] hover:bg-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--app-text)]">
            Juegos por partido
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[var(--surface-subtle)] p-1">
              {GAME_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGamesPerMatch(option)}
                  className={`rounded-[1rem] px-4 py-3 text-sm font-bold transition ${
                    gamesPerMatch === option
                      ? "bg-[var(--brand-secondary)] text-white shadow-lg"
                      : "text-[var(--muted)] hover:bg-white"
                  }`}
                >
                  A {option} juegos
                </button>
              ))}
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--muted)]">Resumen</p>
            <p className="text-2xl font-black text-[var(--app-text)]">
              {format} jugadores · {gamesPerMatch} juegos
            </p>
          </div>
          <p className="max-w-sm text-right text-sm text-[var(--muted)]">
            Al iniciar, la app te ira pidiendo un nombre por jugador en popups consecutivos.
          </p>
        </div>

        <button
          type="button"
          onClick={openPlayerModal}
          className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-[color:color-mix(in_srgb,var(--brand-primary)_28%,transparent)] transition hover:scale-[1.01]"
        >
          Iniciar torneo
        </button>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4">
          <div className="w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.65)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--brand-secondary)]">
                  Jugador {currentIndex + 1}
                </p>
                <h3 className="mt-2 text-3xl font-black text-[var(--app-text)]">Captura el nombre</h3>
              </div>
              <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-sm font-bold text-[var(--muted)]">
                {progress}
              </span>
            </div>

            <label className="mt-6 grid gap-2 text-sm font-medium text-[var(--app-text)]">
              Nombre del jugador
              <input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                autoFocus
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleNextPlayer();
                  }
                }}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-4 text-lg text-[var(--app-text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand-primary)]"
                placeholder={`Jugador ${currentIndex + 1}`}
              />
            </label>

            {suggestedPlayers.length ? (
              <div className="mt-4 grid gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Jugadores guardados
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedPlayers.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handlePickSuggestedPlayer(name)}
                      className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm font-semibold text-[var(--app-text)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-secondary)]"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={closePlayerModal}
                className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-bold text-[var(--app-text)] transition hover:border-[var(--brand-primary)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleNextPlayer}
                className="rounded-full bg-[var(--brand-primary)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-secondary)]"
              >
                {currentIndex === format - 1 ? "Generar torneo" : "Siguiente jugador"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
