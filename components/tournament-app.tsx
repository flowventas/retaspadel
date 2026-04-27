"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { NewTournamentForm } from "@/components/new-tournament-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { defaultStore, loadStore, saveStore } from "@/lib/storage";
import { createPlayers, createTournament } from "@/lib/tournament";
import { GamesPerMatch, TournamentFormat, TournamentStore } from "@/lib/types";

function mergeSavedPlayers(current: string[], incoming: string[]) {
  const seen = new Set<string>();
  const merged: string[] = [];

  [...incoming, ...current].forEach((name) => {
    const trimmed = name.trim();
    const key = trimmed.toLocaleLowerCase();
    if (!trimmed || seen.has(key)) {
      return;
    }

    seen.add(key);
    merged.push(trimmed);
  });

  return merged.slice(0, 40);
}

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
      savedPlayers: mergeSavedPlayers(store.savedPlayers ?? [], payload.names),
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

  function handleClearSavedPlayers() {
    setStore((current) => ({
      ...current,
      savedPlayers: [],
    }));
  }

  function handleRemoveSavedPlayer(name: string) {
    const normalized = name.trim().toLocaleLowerCase();
    setStore((current) => ({
      ...current,
      savedPlayers: current.savedPlayers.filter((item) => item.trim().toLocaleLowerCase() !== normalized),
    }));
  }

  if (!isClient) {
    return <main className="min-h-screen bg-[var(--app-bg)]" />;
  }

  const tournaments = store.tournaments ?? defaultStore.tournaments;

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--brand-accent)_52%,transparent),_transparent_45%),radial-gradient(circle_at_right,_color-mix(in_srgb,var(--brand-primary)_22%,transparent),_transparent_35%)]" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-[var(--hero-border)] bg-[image:var(--hero-bg)] px-6 py-6 text-[var(--hero-text)] shadow-[0_24px_70px_-28px_rgba(15,23,42,0.65)] md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <BrandLogo className="-ml-2 mb-5 sm:-ml-3 md:mb-6" />
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              Crea la reta y salta directo a la vista de torneo.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[var(--hero-muted)] md:text-base">
              Configura jugadores, elige si cada partido se juega a 5 o 6 juegos y administra cada
              torneo en su propia pagina con captura rapida desde celular.
            </p>
          </div>
          <ThemeToggle theme={store.theme} onToggle={handleThemeToggle} />
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid content-start gap-6">
            <NewTournamentForm
              onCreate={handleCreateTournament}
              savedPlayers={store.savedPlayers ?? []}
              onClearSavedPlayers={handleClearSavedPlayers}
              onRemoveSavedPlayer={handleRemoveSavedPlayer}
            />
          </div>

          <div className="grid content-start gap-6">
            <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.5)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand-secondary)]">
                    Guardados
                  </p>
                  <h2 className="mt-1 text-xl font-black text-[var(--app-text)]">Torneos locales</h2>
                </div>
                <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-bold text-[var(--muted)]">
                  {tournaments.length} total
                </span>
              </div>

              {tournaments.length ? (
                <div className="mt-4 grid gap-3">
                  {tournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-subtle)] px-4 py-4 transition hover:border-[var(--brand-primary)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Link href={`/torneo/${tournament.id}`} className="min-w-0 flex-1 text-left">
                          <p className="font-black text-[var(--app-text)]">{tournament.name}</p>
                          <p className="text-sm text-[var(--muted)]">
                            {tournament.format} jugadores · a {tournament.gamesPerMatch} juegos ·{" "}
                            {tournament.rounds.length} rondas
                          </p>
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--muted)]">
                            {tournament.completed ? "Finalizado" : "En curso"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteTournament(tournament.id)}
                            className="rounded-full border border-[color:color-mix(in_srgb,var(--danger-text)_25%,white)] bg-white px-3 py-2 text-xs font-bold text-[var(--danger-text)] transition hover:bg-[var(--danger-bg)]"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface-subtle)] px-4 py-6 text-sm text-[var(--muted)]">
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
