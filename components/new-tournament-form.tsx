"use client";

import { useMemo, useState } from "react";
import { sampleNames } from "@/lib/sample";
import { TournamentFormat } from "@/lib/types";

type NewTournamentFormProps = {
  onCreate: (payload: { name: string; format: TournamentFormat; names: string[] }) => void;
};

const PLAYER_OPTIONS: TournamentFormat[] = [8, 12, 16, 20];

export function NewTournamentForm({ onCreate }: NewTournamentFormProps) {
  const [format, setFormat] = useState<TournamentFormat>(8);
  const [name, setName] = useState("Reta del viernes");
  const [names, setNames] = useState<string[]>(sampleNames(8));
  const [error, setError] = useState("");

  const filledPlayers = useMemo(
    () => names.map((value) => value.trim()).filter(Boolean).length,
    [names],
  );

  function handleNameChange(index: number, value: string) {
    setNames((current) => current.map((item, cursor) => (cursor === index ? value : item)));
  }

  function handleFormatChange(nextFormat: TournamentFormat) {
    setFormat(nextFormat);
    setNames((current) =>
      Array.from({ length: nextFormat }, (_, index) => current[index] ?? sampleNames(nextFormat)[index] ?? ""),
    );
    setError("");
  }

  function handleSample() {
    setNames(sampleNames(format));
    setName(`Demo ${format} jugadores`);
    setError("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedNames = names.map((player) => player.trim());
    const uniqueNames = new Set(trimmedNames.filter(Boolean).map((player) => player.toLowerCase()));

    if (!name.trim()) {
      setError("Ponle un nombre al torneo.");
      return;
    }

    if (trimmedNames.some((player) => !player)) {
      setError("Completa todos los nombres antes de generar el torneo.");
      return;
    }

    if (uniqueNames.size !== trimmedNames.length) {
      setError("Los nombres de jugadores deben ser unicos.");
      return;
    }

    setError("");
    onCreate({ name: name.trim(), format, names: trimmedNames });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-[2rem] border border-white/55 bg-white/80 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.55)] backdrop-blur md:p-8"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
            Nuevo torneo
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Organiza la reta en menos de un minuto
          </h2>
        </div>
        <button
          type="button"
          onClick={handleSample}
          className="rounded-full border border-slate-200 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Cargar demo
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Nombre del torneo
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none ring-0 transition placeholder:text-slate-400 focus:border-cyan-500"
            placeholder="Reta del jueves"
          />
        </label>

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
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-600">Jugadores capturados</p>
          <p className="text-2xl font-black text-slate-950">
            {filledPlayers}/{format}
          </p>
        </div>
        <p className="max-w-sm text-right text-sm text-slate-500">
          La app genera canchas automaticamente, rota parejas y busca variar rivales en torneos
          de 8, 12, 16 y 20 jugadores.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: format }, (_, index) => (
          <label key={index} className="grid gap-2 text-sm font-medium text-slate-700">
            Jugador {index + 1}
            <input
              value={names[index] ?? ""}
              onChange={(event) => handleNameChange(index, event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500"
              placeholder={`Nombre ${index + 1}`}
            />
          </label>
        ))}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-cyan-500 to-emerald-500 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]"
      >
        Generar torneo
      </button>
    </form>
  );
}
