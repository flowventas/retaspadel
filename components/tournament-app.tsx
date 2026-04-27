"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
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

  return merged.slice(0, 60);
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

    if (!window.confirm(`Vas a borrar la reta "${tournament.name}". Seguro?`)) {
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
    if (!window.confirm("Se va a borrar toda la lista de jugadores recientes. Continuar?")) {
      return;
    }

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

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!isClient) {
    return <main className="min-h-screen bg-[var(--app-bg)]" />;
  }

  const tournaments = store.tournaments ?? defaultStore.tournaments;
  const featuredTournament =
    tournaments.find((item) => item.id === store.activeTournamentId) ?? tournaments[0] ?? null;

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <div className="absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_top,_rgba(57,255,20,0.14),_transparent_42%),radial-gradient(circle_at_right,_rgba(125,255,90,0.08),_transparent_32%)]" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-8 grid gap-6 rounded-[2rem] border border-[var(--hero-border)] bg-[image:var(--hero-bg)] px-5 py-6 text-[var(--hero-text)] shadow-[var(--shadow-strong)] md:grid-cols-[1.2fr_0.8fr] md:px-7 md:py-7">
          <div className="relative overflow-hidden rounded-[1.6rem] border border-white/6 bg-black/15 p-5">
            <div className="absolute -right-3 -top-8 text-[8rem] font-black leading-none text-[var(--brand-primary)]/18 sm:text-[10rem]">
              6
            </div>
            <p className="relative text-sm font-bold uppercase tracking-[0.34em] text-[var(--brand-primary)]">
              6 loco
            </p>
            <h1 className="relative mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
              Juega. Compite. Sube en el ranking.
            </h1>
            <p className="relative mt-4 max-w-2xl text-sm text-[var(--hero-muted)] sm:text-base">
              Organiza tus retas, registra scores y descubre quien manda en la cancha.
            </p>
            <p className="relative mt-6 text-base font-semibold text-white">
              No organizes retas. Crea competencia.
            </p>

            <div className="relative mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => scrollTo("crear-reta")}
                className="inline-flex items-center justify-center rounded-2xl bg-[var(--brand-primary)] px-5 py-3 text-base font-black text-black transition hover:shadow-[0_0_28px_rgba(57,255,20,0.35)]"
              >
                Crear reta
              </button>
              {featuredTournament ? (
                <Link
                  href={`/torneo/${featuredTournament.id}#tabla-de-poder`}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-base font-bold text-white transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                >
                  Ver ranking
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => scrollTo("retas-guardadas")}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-base font-bold text-white transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                >
                  Ver ranking
                </button>
              )}
            </div>
          </div>

          <div className="grid content-between gap-4">
            <div className="flex justify-end">
              <ThemeToggle theme={store.theme} onToggle={handleThemeToggle} />
            </div>

            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
              <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--hero-muted)]">
                  Retas activas
                </p>
                <p className="mt-2 text-3xl font-black text-white">{tournaments.length}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--hero-muted)]">
                  Jugadores recientes
                </p>
                <p className="mt-2 text-3xl font-black text-white">{store.savedPlayers.length}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--hero-muted)]">
                  Vibe
                </p>
                <p className="mt-2 text-xl font-black text-[var(--brand-primary)]">Competencia pura</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div id="crear-reta" className="grid content-start gap-6">
            <NewTournamentForm
              onCreate={handleCreateTournament}
              savedPlayers={store.savedPlayers ?? []}
              onClearSavedPlayers={handleClearSavedPlayers}
              onRemoveSavedPlayer={handleRemoveSavedPlayer}
            />
          </div>

          <div id="retas-guardadas" className="grid content-start gap-6">
            <section className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-strong)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand-primary)]">
                    Retas guardadas
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-[var(--app-text)]">Tus ultimas batallas</h2>
                </div>
                <span className="rounded-full border border-[var(--line)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-bold text-[var(--muted)]">
                  {tournaments.length} retas
                </span>
              </div>

              {tournaments.length ? (
                <div className="mt-5 grid gap-3">
                  {tournaments.map((tournament, index) => (
                    <article
                      key={tournament.id}
                      className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-subtle)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--brand-primary)] hover:shadow-[0_0_24px_rgba(57,255,20,0.12)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/torneo/${tournament.id}`} className="min-w-0 flex-1 text-left">
                          <p className="text-lg font-black text-[var(--app-text)]">{tournament.name}</p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {tournament.format} jugadores / a {tournament.gamesPerMatch} juegos / {tournament.rounds.length} rondas
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                            <span className="rounded-full bg-black px-3 py-1 text-[var(--brand-primary)] dark:bg-[var(--surface-strong)]">
                              {index === 0 ? "Activa" : "Lista"}
                            </span>
                            <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-[var(--muted)]">
                              {tournament.completed ? "Reta cerrada" : "Que siga la reta"}
                            </span>
                          </div>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDeleteTournament(tournament.id)}
                          className="rounded-2xl border border-[color:color-mix(in_srgb,var(--danger-text)_30%,white)] bg-[var(--danger-bg)] px-3 py-2 text-xs font-bold text-[var(--danger-text)] transition hover:opacity-90"
                        >
                          Borrar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-[1.6rem] border border-dashed border-[var(--line)] bg-[var(--surface-subtle)] px-4 py-8 text-sm text-[var(--muted)]">
                  No organizes retas. Crea competencia. Arranca la primera y deja que la tabla de poder hable.
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
