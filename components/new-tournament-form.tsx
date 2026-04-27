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
  onClearSavedPlayers: () => void;
  onRemoveSavedPlayer: (name: string) => void;
};

const PLAYER_OPTIONS: TournamentFormat[] = [8, 12, 16, 20];
const GAME_OPTIONS: GamesPerMatch[] = [5, 6];

function buildTournamentName(format: TournamentFormat, gamesPerMatch: GamesPerMatch) {
  return `6 loco / ${format} jugadores / a ${gamesPerMatch} juegos`;
}

export function NewTournamentForm({
  onCreate,
  savedPlayers,
  onClearSavedPlayers,
  onRemoveSavedPlayer,
}: NewTournamentFormProps) {
  const [format, setFormat] = useState<TournamentFormat>(8);
  const [gamesPerMatch, setGamesPerMatch] = useState<GamesPerMatch>(6);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);
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
      .sort((left, right) => left.localeCompare(right, "es", { sensitivity: "base" }));
  }, [currentIndex, draftName, names, savedPlayers]);

  function openPlayerModal() {
    setNames(Array.from({ length: format }, () => ""));
    setCurrentIndex(0);
    setDraftName("");
    setError("");
    setIsRecentOpen(false);
    setIsModalOpen(true);
  }

  function closePlayerModal() {
    setIsModalOpen(false);
    setIsRecentOpen(false);
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
      (item, index) => index !== currentIndex && item.trim().toLocaleLowerCase() === trimmedName.toLocaleLowerCase(),
    );

    if (!trimmedName) {
      setError("Todavia no hay banda. Agrega jugadores para armar la reta.");
      return;
    }

    if (duplicate) {
      setError("Ese nombre ya esta en la reta. Metele otro.");
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
    setIsRecentOpen(false);
  }

  function handlePickSuggestedPlayer(name: string) {
    setDraftName(name);
    setError("");
    setIsRecentOpen(false);
  }

  function handleClearRecentPlayers() {
    onClearSavedPlayers();
    setIsRecentOpen(false);
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
      <section className="grid gap-6 rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow-strong)] md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--brand-primary)]">
              Nueva reta
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[var(--app-text)]">
              Arma la reta, prende la competencia.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
              Elige cuanta banda entra, define si la cancha va a 5 o 6 juegos y deja que 6 loco organice todo.
            </p>
          </div>
          <button
            type="button"
            onClick={handleUseDemo}
            className="rounded-2xl border border-[var(--line)] bg-[var(--surface-subtle)] px-4 py-2 text-sm font-bold text-[var(--app-text)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
          >
            Cargar demo rapido
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[var(--app-text)]">
            Cuantos entran a la reta
            <div className="grid grid-cols-2 gap-2 rounded-[1.35rem] bg-[var(--surface-subtle)] p-1">
              {PLAYER_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleFormatChange(option)}
                  className={`rounded-[1rem] px-4 py-3 text-sm font-black transition ${
                    format === option
                      ? "bg-[var(--brand-primary)] text-black shadow-[0_0_20px_rgba(57,255,20,0.22)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-strong)]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--app-text)]">
            A cuantos juegos se va
            <div className="grid grid-cols-2 gap-2 rounded-[1.35rem] bg-[var(--surface-subtle)] p-1">
              {GAME_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGamesPerMatch(option)}
                  className={`rounded-[1rem] px-4 py-3 text-sm font-black transition ${
                    gamesPerMatch === option
                      ? "bg-[var(--brand-primary)] text-black shadow-[0_0_20px_rgba(57,255,20,0.22)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-strong)]"
                  }`}
                >
                  A {option} juegos
                </button>
              ))}
            </div>
          </label>
        </div>

        <div className="grid gap-3 rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface-subtle)] p-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="text-[3.2rem] font-black leading-none text-[var(--brand-primary)]">6</div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--muted)]">Reta lista</p>
            <p className="mt-1 text-xl font-black text-[var(--app-text)]">
              {format} jugadores / {gamesPerMatch} juegos
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              No organizes retas. Crea competencia.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openPlayerModal}
          className="inline-flex items-center justify-center rounded-2xl bg-[var(--brand-primary)] px-6 py-4 text-base font-black text-black transition hover:shadow-[0_0_28px_rgba(57,255,20,0.35)]"
        >
          Crear reta
        </button>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow-strong)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.28em] text-[var(--brand-primary)]">
                  Jugador {currentIndex + 1}
                </p>
                <h3 className="mt-2 text-3xl font-black text-[var(--app-text)]">Quien entra a la cancha?</h3>
              </div>
              <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-sm font-bold text-[var(--muted)]">
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
                className="rounded-[1.3rem] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-4 text-lg text-[var(--app-text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand-primary)]"
                placeholder={`Jugador ${currentIndex + 1}`}
              />
            </label>

            {savedPlayers.length ? (
              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecentOpen((current) => !current)}
                  className="inline-flex items-center justify-between rounded-[1.3rem] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-left text-sm font-semibold text-[var(--app-text)] transition hover:border-[var(--brand-primary)]"
                >
                  <span>Jugadores recientes</span>
                  <span aria-hidden="true" className="text-base">
                    {isRecentOpen ? "^" : "v"}
                  </span>
                </button>

                {isRecentOpen ? (
                  <div className="grid max-h-64 gap-2 overflow-y-auto rounded-[1.3rem] border border-[var(--line)] bg-[var(--surface-strong)] p-3">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
                        Jugadores guardados
                      </p>
                      <button
                        type="button"
                        onClick={handleClearRecentPlayers}
                        className="text-xs font-bold text-[var(--danger-text)] transition hover:opacity-80"
                      >
                        Borrar lista
                      </button>
                    </div>

                    {suggestedPlayers.map((name) => (
                      <div
                        key={name}
                        className="flex items-center gap-2 rounded-xl transition hover:bg-[var(--surface-subtle)]"
                      >
                        <button
                          type="button"
                          onClick={() => handlePickSuggestedPlayer(name)}
                          className="min-w-0 flex-1 rounded-xl px-3 py-2 text-left text-sm font-semibold text-[var(--app-text)] transition hover:text-[var(--brand-primary)]"
                        >
                          {name}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveSavedPlayer(name)}
                          aria-label={`Eliminar ${name}`}
                          title={`Eliminar ${name}`}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold text-[var(--danger-text)] transition hover:bg-[var(--danger-bg)]"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-[1.3rem] border border-dashed border-[var(--line)] bg-[var(--surface-subtle)] px-4 py-4 text-sm text-[var(--muted)]">
                Todavia no hay banda. Agrega jugadores para armar la reta.
              </div>
            )}

            {error ? (
              <div className="mt-4 rounded-[1.3rem] border border-[color:color-mix(in_srgb,var(--danger-text)_26%,white)] bg-[var(--danger-bg)] px-4 py-3 text-sm font-medium text-[var(--danger-text)]">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={closePlayerModal}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-bold text-[var(--app-text)] transition hover:border-[var(--brand-primary)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleNextPlayer}
                className="rounded-2xl bg-[var(--brand-primary)] px-5 py-3 text-sm font-black text-black transition hover:shadow-[0_0_20px_rgba(57,255,20,0.24)]"
              >
                {currentIndex === format - 1 ? "Crear reta" : "Que siga la reta"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
