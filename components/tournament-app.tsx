"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { NewTournamentForm } from "@/components/new-tournament-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { defaultStore, loadStore, saveStore } from "@/lib/storage";
import { createPlayers, createTournament } from "@/lib/tournament";
import { GamesPerMatch, PairingMode, PlayMode, TournamentFormat, TournamentStore } from "@/lib/types";

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
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const savedSectionRef = useRef<HTMLDivElement | null>(null);

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
    pairingMode: PairingMode;
    playMode: PlayMode;
    names: string[];
  }) {
    const tournament = createTournament(
      payload.name,
      createPlayers(payload.names),
      payload.format,
      payload.gamesPerMatch,
      payload.pairingMode,
      payload.playMode,
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

    if (!window.confirm(`Borrar la reta "${tournament.name}"?`)) {
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

  function scrollToSection(target: HTMLDivElement | null) {
    target?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  if (!isClient) {
    return <main className="min-h-screen bg-[var(--app-bg)]" />;
  }

  const tournaments = store.tournaments ?? defaultStore.tournaments;

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--brand-accent)_52%,transparent),_transparent_45%),radial-gradient(circle_at_right,_color-mix(in_srgb,var(--brand-primary)_22%,transparent),_transparent_35%)]" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="app-hero motion-hero mb-8 grid gap-8 px-6 py-6 md:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] md:px-8 md:py-8">
          <div className="relative min-h-10">
            <BrandLogo
              theme={store.theme}
              className="mx-auto block min-[500px]:mr-14 min-[500px]:ml-auto"
            />
            <div className="absolute right-0 top-0">
              <ThemeToggle theme={store.theme} onToggle={handleThemeToggle} />
            </div>
          </div>
          <div className="grid gap-6 md:col-span-2 md:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] md:items-end">
            <div className="max-w-3xl">
              <p className="app-kicker text-[var(--hero-muted)]">Retas de padel organizadas en minutos</p>
              <h1 className="mt-3 text-5xl font-black tracking-tight text-[var(--hero-text)] sm:text-6xl lg:text-7xl">
                Organiza la reta, guarda cada score y deja claro quien manda.
              </h1>
              <p className="mt-4 max-w-2xl text-base text-[var(--hero-muted)] sm:text-lg">
                6 loco te ayuda a armar partidos, capturar resultados desde el celular y mantener
                una tabla de poder lista para compartir.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => scrollToSection(formSectionRef.current)}
                  className="app-button app-button-primary px-6 py-3 text-sm sm:text-base"
                >
                  Crear una reta
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection(savedSectionRef.current)}
                  className="app-button app-button-secondary px-6 py-3 text-sm sm:text-base"
                >
                  Ver retas guardadas
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--hero-muted)]">
                <span className="font-semibold text-[var(--hero-text)]">Rapida en celular</span>
                <span>Importa jugadores desde WhatsApp</span>
                <span>Ranking en vivo al instante</span>
              </div>
            </div>

            <div className="app-panel grid gap-3 px-5 py-5 md:max-w-sm md:justify-self-end">
              <p className="app-kicker">Lista para jugar</p>
              <h2 className="text-2xl font-black text-[var(--app-text)]">Menos organizacion, mas cancha.</h2>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-[1rem] bg-[var(--surface-strong)] px-3 py-3 text-center">
                  <p className="text-xl font-black text-[var(--app-text)]">8-20</p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">jugadores</p>
                </div>
                <div className="rounded-[1rem] bg-[var(--surface-strong)] px-3 py-3 text-center">
                  <p className="text-xl font-black text-[var(--app-text)]">5-6</p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">juegos</p>
                </div>
                <div className="rounded-[1rem] bg-[var(--surface-strong)] px-3 py-3 text-center">
                  <p className="text-xl font-black text-[var(--app-text)]">1 tap</p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">para guardar</p>
                </div>
              </div>
              <p className="text-sm text-[var(--muted)]">
                Ideal para grupos, clubes y retas privadas donde importa jugar rapido y llevar el
                orden sin hojas ni chats sueltos.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div ref={formSectionRef} className="motion-card motion-delay-1 grid content-start gap-6">
            <NewTournamentForm
              onCreate={handleCreateTournament}
              savedPlayers={store.savedPlayers ?? []}
              onClearSavedPlayers={handleClearSavedPlayers}
              onRemoveSavedPlayer={handleRemoveSavedPlayer}
            />
          </div>

          <div ref={savedSectionRef} className="motion-card motion-delay-2 grid content-start gap-6">
            <div className="app-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand-secondary)]">
                    Guardados
                  </p>
                  <h2 className="mt-1 text-xl font-black text-[var(--app-text)]">Retas guardadas</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">Continua donde se quedo la batalla.</p>
                </div>
                <span className="app-pill bg-[var(--surface-soft)] px-3 py-1 text-xs">
                  {tournaments.length} total
                </span>
              </div>

              {tournaments.length ? (
                <div className="mt-4 grid gap-3">
                  {tournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className="app-panel px-4 py-4 transition hover:border-[var(--brand-primary)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Link href={`/torneo/${tournament.id}`} className="min-w-0 flex-1 text-left">
                          <p className="font-black text-[var(--app-text)]">{tournament.name}</p>
                          <p className="text-sm text-[var(--muted)]">
                            {tournament.format} jugadores, a {tournament.gamesPerMatch} juegos,{" "}
                            {tournament.totalRounds} rondas,{" "}
                            {tournament.playMode === "ladder" ? "escalera" : "rotativo"},{" "}
                            {tournament.pairingMode === "fixed" ? "parejas fijas" : "parejas rotativas"}
                          </p>
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="app-pill border border-[var(--line)] px-3 py-1 text-xs text-[var(--app-text)]">
                            {tournament.completed ? "Finalizado" : "En curso"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteTournament(tournament.id)}
                            className="app-button app-button-danger px-3 py-2 text-xs"
                          >
                            Borrar
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
