"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { NewTournamentForm } from "@/components/new-tournament-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { defaultStore, loadStore, saveStore } from "@/lib/storage";
import { createPlayers, createTournament } from "@/lib/tournament";
import { GamesPerMatch, TournamentFormat, TournamentStore } from "@/lib/types";

export default function TournamentApp() {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const router = useRouter();
  const [store, setStore] = useState<TournamentStore>(() => loadStore());

  useEffect(() => {
    if (!isClient) {
      return;
    }

    saveStore(store);
    document.documentElement.classList.toggle("dark", store.theme === "dark");
  }, [isClient, store]);

  function handleCreateTournament(payload: {
    name: string;
    format: TournamentFormat;
    gamesPerMatch: GamesPerMatch;
    names: string[];
  }) {
    const tournament = createTournament(
      payload.name,
      createPlayers(payload.names),
      payload.format,
      payload.gamesPerMatch,
    );

    const nextStore = {
      ...store,
      tournaments: [tournament, ...store.tournaments],
      activeTournamentId: tournament.id,
    };

    setStore(nextStore);
    router.push(`/torneo/${tournament.id}`);
  }

  function handleDeleteTournament(tournamentId: string) {
    const tournament = store.tournaments.find((item) => item.id === tournamentId);
    if (!tournament) {
      return;
    }

    if (!window.confirm(`Eliminar el torneo "${tournament.name}"?`)) {
      return;
    }

    setStore((current) => {
      const remaining = current.tournaments.filter((item) => item.id !== tournamentId);
      return {
        ...current,
        tournaments: remaining,
        activeTournamentId:
          current.activeTournamentId === tournamentId ? remaining[0]?.id ?? null : current.activeTournamentId,
      };
    });
  }

  function handleThemeToggle() {
    setStore((current) => ({
      ...current,
      theme: current.theme === "dark" ? "light" : "dark",
    }));
  }

  if (!isClient) {
    return <main className="min-h-screen bg-[var(--app-bg)]" />;
  }

  const tournaments = store.tournaments ?? defaultStore.tournaments;

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.25),_transparent_45%),radial-gradient(circle_at_right,_rgba(16,185,129,0.18),_transparent_35%)]" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/15 bg-slate-950 px-6 py-6 text-white shadow-[0_24px_70px_-28px_rgba(15,23,42,0.65)] md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.32em] text-cyan-300">
              Padel Locos
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
              Crea la reta y salta directo a la vista de torneo.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              Configura jugadores, elige si cada partido se juega a 5 o 6 juegos y administra cada
              torneo en su propia pagina con captura rapida desde celular.
            </p>
          </div>
          <ThemeToggle theme={store.theme} onToggle={handleThemeToggle} />
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid content-start gap-6">
            <NewTournamentForm onCreate={handleCreateTournament} />
          </div>

          <div className="grid content-start gap-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.5)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-700">
                    Guardados
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">Torneos locales</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {tournaments.length} total
                </span>
              </div>

              {tournaments.length ? (
                <div className="mt-4 grid gap-3">
                  {tournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Link href={`/torneo/${tournament.id}`} className="min-w-0 flex-1 text-left">
                          <p className="font-black text-slate-950">{tournament.name}</p>
                          <p className="text-sm text-slate-500">
                            {tournament.format} jugadores · a {tournament.gamesPerMatch} juegos ·{" "}
                            {tournament.rounds.length} rondas
                          </p>
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                            {tournament.completed ? "Finalizado" : "En curso"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteTournament(tournament.id)}
                            className="rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Aun no hay torneos guardados. Crea el primero y la app te llevara directo a su
                  vista de juego.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
