"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { MatchCard } from "@/components/match-card";
import { RankingTable } from "@/components/ranking-table";
import { RoundHistory } from "@/components/round-history";
import { ThemeToggle } from "@/components/theme-toggle";
import { loadStore, saveStore } from "@/lib/storage";
import {
  calculateRanking,
  createLinkedScore,
  exportTournamentCsv,
  formatPlayerList,
  getCurrentRound,
  getPlayerStats,
  isRoundReady,
  playerNameMap,
  reopenRound,
  roundLabel,
  saveRound,
  tournamentProgress,
  updateMatchScore,
} from "@/lib/tournament";
import { Tournament, TournamentStore } from "@/lib/types";

type TournamentViewProps = {
  tournamentId: string;
};

export function TournamentView({ tournamentId }: TournamentViewProps) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const router = useRouter();
  const [store, setStore] = useState<TournamentStore>(() => loadStore());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isClient) {
      return;
    }

    saveStore(store);
    document.documentElement.classList.toggle("dark", store.theme === "dark");
  }, [isClient, store]);

  const maybeTournament = useMemo(
    () => store.tournaments.find((item) => item.id === tournamentId) ?? null,
    [store.tournaments, tournamentId],
  );

  if (!isClient) {
    return <main className="min-h-screen bg-[var(--app-bg)]" />;
  }

  if (!maybeTournament) {
    return (
      <main className="min-h-screen bg-[var(--app-bg)] px-4 py-10 text-[var(--app-text)]">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_-40px_rgba(15,23,42,0.4)]">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-700">
            Torneo no encontrado
          </p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">No pudimos cargar este torneo.</h1>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  const tournament = maybeTournament;
  const ranking = calculateRanking(tournament);
  const stats = getPlayerStats(tournament);
  const currentRound = getCurrentRound(tournament);
  const names = playerNameMap(tournament.players);
  const progress = tournamentProgress(tournament);
  const finishedRounds = tournament.rounds.filter((round) => round.status === "completed");

  function updateStore(updater: (current: TournamentStore) => TournamentStore) {
    setStore((current) => updater(current));
  }

  function persistTournament(nextTournament: Tournament) {
    updateStore((current) => ({
      ...current,
      tournaments: current.tournaments.map((item) => (item.id === nextTournament.id ? nextTournament : item)),
      activeTournamentId: nextTournament.id,
    }));
  }

  function handleAdjustScore(matchId: string, delta: -1 | 1) {
    if (!currentRound) {
      return;
    }

    const match = currentRound.matches.find((item) => item.id === matchId);
    if (!match) {
      return;
    }

    const currentTeamA = match.score?.teamA ?? 0;
    if (match.score === null && delta === -1) {
      return;
    }
    const nextTeamA = currentTeamA + delta;
    if (nextTeamA < 0 || nextTeamA > tournament.gamesPerMatch) {
      return;
    }

    persistTournament(
      updateMatchScore(
        tournament,
        currentRound.id,
        matchId,
        createLinkedScore(nextTeamA, tournament.gamesPerMatch),
      ),
    );
    setError("");
  }

  function handleSaveRound() {
    if (!currentRound) {
      return;
    }

    if (!isRoundReady(currentRound, tournament.gamesPerMatch)) {
      setError("Completa y valida todos los scores antes de guardar.");
      return;
    }

    persistTournament(saveRound(tournament, currentRound.id));
    setError("");
  }

  function handleEditRound(roundId: string) {
    persistTournament(reopenRound(tournament, roundId));
    setError("");
  }

  function handleDeleteTournament() {
    if (!window.confirm(`Eliminar el torneo "${tournament.name}"?`)) {
      return;
    }

    updateStore((current) => {
      const remaining = current.tournaments.filter((item) => item.id !== tournament.id);
      return {
        ...current,
        tournaments: remaining,
        activeTournamentId: remaining[0]?.id ?? null,
      };
    });
    router.push("/");
  }

  function handleThemeToggle() {
    updateStore((current) => ({
      ...current,
      theme: current.theme === "dark" ? "light" : "dark",
    }));
  }

  function handleExportCsv() {
    const blob = new Blob([exportTournamentCsv(tournament)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tournament.name.toLowerCase().replaceAll(" ", "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.25),_transparent_45%),radial-gradient(circle_at_right,_rgba(16,185,129,0.18),_transparent_35%)]" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/15 bg-slate-950 px-6 py-6 text-white shadow-[0_24px_70px_-28px_rgba(15,23,42,0.65)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Link href="/" className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
                Volver al inicio
              </Link>
              <h1 className="mt-3 text-4xl font-black tracking-tight">{tournament.name}</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300 md:text-base">
                {tournament.format} jugadores · partidos a {tournament.gamesPerMatch} juegos ·{" "}
                {tournament.rounds.length} rondas
              </p>
              <p className="mt-3 text-sm text-slate-300">
                Jugadores: {formatPlayerList(tournament.players.map((player) => player.id), names)}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleExportCsv}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/20"
              >
                Exportar CSV
              </button>
              <button
                type="button"
                onClick={handleDeleteTournament}
                className="rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
              >
                Eliminar torneo
              </button>
              <ThemeToggle theme={store.theme} onToggle={handleThemeToggle} />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-[1.5rem] bg-white/10 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Ronda actual</p>
              <p className="mt-2 text-2xl font-black">
                {currentRound ? roundLabel(currentRound) : "Sin ronda"}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/10 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Canchas</p>
              <p className="mt-2 text-2xl font-black">{currentRound?.matches.length ?? 0}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white/10 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Avance</p>
              <p className="mt-2 text-2xl font-black">{progress.percentage}%</p>
            </div>
            <div className="rounded-[1.5rem] bg-white/10 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Lider</p>
              <p className="mt-2 text-2xl font-black">{ranking[0]?.name ?? "-"}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid content-start gap-6">
            {tournament.completed ? (
              <section className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">
                    Torneo finalizado
                  </p>
                  <h2 className="mt-2 text-3xl font-black text-slate-950">Ranking final y estadisticas</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {stats.map((player, index) => (
                    <article
                      key={player.playerId}
                      className={`rounded-[1.75rem] border p-5 ${
                        index === 0 ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-black text-slate-950">{player.name}</p>
                          <p className="text-sm text-slate-500">
                            {player.wins} ganados · {player.draws} empatados · {player.losses} perdidos
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                          #{index + 1}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : currentRound ? (
              <section className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-700">
                      En juego
                    </p>
                    <h2 className="mt-2 text-3xl font-black text-slate-950">{roundLabel(currentRound)}</h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Usa los botones para marcar juegos. Cada partido siempre suma {tournament.gamesPerMatch}.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveRound}
                    className="rounded-full bg-linear-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-500/25 transition hover:scale-[1.01]"
                  >
                    Guardar resultados
                  </button>
                </div>

                {error ? (
                  <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {error}
                  </div>
                ) : null}

                <div className="grid gap-4 xl:grid-cols-2">
                  {currentRound.matches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      names={names}
                      gamesPerMatch={tournament.gamesPerMatch}
                      onAdjustScore={handleAdjustScore}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <div className="lg:hidden">
              <RankingTable rows={ranking} />
            </div>

            <section className="grid gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-700">Historial</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Rondas anteriores</h2>
              </div>
              <RoundHistory rounds={finishedRounds} names={names} onEdit={handleEditRound} />
            </section>
          </div>

          <div className="hidden content-start gap-6 lg:grid">
            <RankingTable rows={ranking} />
          </div>
        </section>
      </div>
    </main>
  );
}
