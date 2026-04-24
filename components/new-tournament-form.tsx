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
};

const PLAYER_OPTIONS: TournamentFormat[] = [8, 12, 16, 20];
const GAME_OPTIONS: GamesPerMatch[] = [5, 6];

function buildTournamentName(format: TournamentFormat, gamesPerMatch: GamesPerMatch) {
  return `Reta ${format} jugadores · a ${gamesPerMatch} juegos`;
}

export function NewTournamentForm({ onCreate }: NewTournamentFormProps) {
  const [format, setFormat] = useState<TournamentFormat>(8);
  const [gamesPerMatch, setGamesPerMatch] = useState<GamesPerMatch>(6);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [names, setNames] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draftName, setDraftName] = useState("");
  const [error, setError] = useState("");

  const progress = useMemo(() => `${Math.min(currentIndex + 1, format)}/${format}`, [currentIndex, format]);

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
      <section className="grid gap-6 rounded-[2rem] border border-white/55 bg-white/80 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.55)] backdrop-blur md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
              Nuevo torneo
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Configura la reta y captura nombres en popup
            </h2>
          </div>
          <button
            type="button"
            onClick={handleUseDemo}
            className="rounded-full border border-slate-200 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Cargar demo
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Numero de jugadores
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
              {PLAYER_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleFormatChange(option)}
                  className={`rounded-[1rem] px-4 py-3 text-sm font-bold transition ${
                    format === option
                      ? "bg-slate-950 text-white shadow-lg"
                      : "text-slate-600 hover:bg-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Juegos por partido
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
              {GAME_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGamesPerMatch(option)}
                  className={`rounded-[1rem] px-4 py-3 text-sm font-bold transition ${
                    gamesPerMatch === option
                      ? "bg-slate-950 text-white shadow-lg"
                      : "text-slate-600 hover:bg-white"
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
            <p className="text-sm font-semibold text-slate-600">Resumen</p>
            <p className="text-2xl font-black text-slate-950">
              {format} jugadores · {gamesPerMatch} juegos
            </p>
          </div>
          <p className="max-w-sm text-right text-sm text-slate-500">
            Al iniciar, la app te ira pidiendo un nombre por jugador en popups consecutivos.
          </p>
        </div>

        <button
          type="button"
          onClick={openPlayerModal}
          className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-cyan-500 to-emerald-500 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]"
        >
          Iniciar torneo
        </button>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.65)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-700">
                  Jugador {currentIndex + 1}
                </p>
                <h3 className="mt-2 text-3xl font-black text-slate-950">Captura el nombre</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">
                {progress}
              </span>
            </div>

            <label className="mt-6 grid gap-2 text-sm font-medium text-slate-700">
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
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500"
                placeholder={`Jugador ${currentIndex + 1}`}
              />
            </label>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={closePlayerModal}
                className="rounded-full border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleNextPlayer}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
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
