"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { MatchCard } from "@/components/match-card";
import { NewTournamentForm } from "@/components/new-tournament-form";
import { RankingTable } from "@/components/ranking-table";
import { RoundHistory } from "@/components/round-history";
import { ThemeToggle } from "@/components/theme-toggle";
import { loadStore, saveStore } from "@/lib/storage";
import {
  calculateRanking,
  createPlayers,
  createTournament,
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
import { Tournament, TournamentFormat, TournamentStore } from "@/lib/types";

export default function TournamentApp() {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [store, setStore] = useState<TournamentStore>(() => loadStore());
  const [error, setError] = useState("");

  useEffect(() => {
    saveStore(store);
    document.documentElement.classList.toggle("dark", store.theme === "dark");
  }, [store]);

  const activeTournament = useMemo(
    () =>
      store.tournaments.find((tournament) => tournament.id === store.activeTournamentId) ??
      store.tournaments[0] ??
      null,
    [store.activeTournamentId, store.tournaments],
  );

  const ranking = useMemo(
    () => (activeTournament ? calculateRanking(activeTournament) : []),
    [activeTournament],
  );
  const stats = useMemo(
    () => (activeTournament ? getPlayerStats(activeTournament) : []),
    [activeTournament],
  );
  const currentRound = activeTournament ? getCurrentRound(activeTournament) : null;
  const names = activeTournament ? playerNameMap(activeTournament.players) : {};
  const progress = activeTournament ? tournamentProgress(activeTournament) : null;
  const finishedRounds = activeTournament
    ? activeTournament.rounds.filter((round) => round.status === "completed")
    : [];

  function updateStore(updater: (current: TournamentStore) => TournamentStore) {
    setStore((current) => updater(current));
  }

  function persistTournament(nextTournament: Tournament) {
    updateStore((current) => ({
      ...current,
      tournaments: current.tournaments.map((tournament) =>
        tournament.id === nextTournament.id ? nextTournament : tournament,
      ),
      activeTournamentId: nextTournament.id,
    }));
  }

  function handleCreateTournament(payload: {
    name: string;
    format: TournamentFormat;
    names: string[];
  }) {
    const tournament = createTournament(payload.name, createPlayers(payload.names), payload.format);
    updateStore((current) => ({
      ...current,
      tournaments: [tournament, ...current.tournaments],
      activeTournamentId: tournament.id,
    }));
    setError("");
  }

  function handleSelectTournament(tournamentId: string) {
    updateStore((current) => ({
      ...current,
      activeTournamentId: tournamentId,
    }));
    setError("");
  }

  function handleDeleteTournament(tournamentId: string) {
    const tournament = store.tournaments.find((item) => item.id === tournamentId);
    if (!tournament) {
      return;
    }

    if (!window.confirm(`Eliminar el torneo "${tournament.name}"?`)) {
      return;
    }

    updateStore((current) => {
      const remaining = current.tournaments.filter((item) => item.id !== tournamentId);

      return {
        ...current,
        tournaments: remaining,
        activeTournamentId:
          current.activeTournamentId === tournamentId
            ? remaining[0]?.id ?? null
            : current.activeTournamentId,
      };
    });
    setError("");
  }

  function handleScoreChange(matchId: string, side: "teamA" | "teamB", value: string) {
    if (!activeTournament || !currentRound) {
      return;
    }

    const parsed = value === "" ? null : Number(value);
    const match = currentRound.matches.find((item) => item.id === matchId);
    const nextScore = {
      teamA: side === "teamA" ? parsed ?? 0 : match?.score?.teamA ?? 0,
      teamB: side === "teamB" ? parsed ?? 0 : match?.score?.teamB ?? 0,
    };

    const nextTournament =
      value === ""
        ? updateMatchScore(activeTournament, currentRound.id, matchId, null)
        : updateMatchScore(activeTournament, currentRound.id, matchId, nextScore);

    persistTournament(nextTournament);
  }

  function handleSaveRound() {
    if (!activeTournament || !currentRound) {
      return;
    }

    const issue = currentRound && !isRoundReady(currentRound);
    if (issue) {
      setError("Completa y valida todos los scores antes de guardar.");
      return;
    }

    const nextTournament = saveRound(activeTournament, currentRound.id);
    persistTournament(nextTournament);
    setError("");
  }

  function handleEditRound(roundId: string) {
    if (!activeTournament) {
      return;
    }

    persistTournament(reopenRound(activeTournament, roundId));
    setError("");
  }

  function handleRestartTournament() {
    if (!activeTournament) {
      return;
    }

    updateStore((current) => {
      const remaining = current.tournaments.filter(
        (tournament) => tournament.id !== activeTournament.id,
      );

      return {
        ...current,
        tournaments: remaining,
        activeTournamentId: remaining[0]?.id ?? null,
      };
    });
    setError("");
  }

  function handleExportCsv() {
    if (!activeTournament) {
      return;
    }

    const blob = new Blob([exportTournamentCsv(activeTournament)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeTournament.name.toLowerCase().replaceAll(" ", "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleThemeToggle() {
    updateStore((current) => ({
      ...current,
      theme: current.theme === "dark" ? "light" : "dark",
    }));
  }

  if (!isClient) {
    return <main className="min-h-screen bg-[var(--app-bg)]" />;
  }

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
              Rondas automaticas, ranking en vivo y captura express.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              Administra torneos amistosos de 8, 12, 16 o 20 jugadores con parejas rotativas,
              varias canchas y resultados listos para capturarse desde el celular.
            </p>
          </div>
          <ThemeToggle theme={store.theme} onToggle={handleThemeToggle} />
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid content-start gap-6">
            <NewTournamentForm onCreate={handleCreateTournament} />

            {store.tournaments.length ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.5)] backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-700">
                      Guardados
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">Torneos locales</h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {store.tournaments.length} total
                  </span>
                </div>

                <div className="mt-4 grid gap-3">
                  {store.tournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className={`rounded-[1.5rem] border px-4 py-4 transition ${
                        activeTournament?.id === tournament.id
                          ? "border-cyan-500 bg-cyan-50"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => handleSelectTournament(tournament.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <p className="font-black text-slate-950">{tournament.name}</p>
                          <p className="text-sm text-slate-500">
                            {tournament.format} jugadores · {tournament.rounds.length} rondas
                          </p>
                        </button>
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
              </div>
            ) : null}
          </div>

          <div className="grid content-start gap-6">
            {activeTournament ? (
              <>
                <section className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white/85 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur md:grid-cols-[1.3fr_0.7fr]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                        {activeTournament.format} jugadores
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        {progress?.completed}/{progress?.total} rondas guardadas
                      </span>
                    </div>
                    <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                      {activeTournament.name}
                    </h2>
                    <p className="mt-3 text-sm text-slate-600">
                      Jugadores:{" "}
                      {formatPlayerList(activeTournament.players.map((player) => player.id), names)}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
                    <div className="rounded-[1.5rem] bg-slate-950 px-4 py-4 text-white">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Ronda actual</p>
                      <p className="mt-2 text-2xl font-black">
                        {currentRound ? roundLabel(currentRound) : "Sin ronda"}
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] bg-slate-100 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Avance</p>
                      <p className="mt-2 text-2xl font-black text-slate-950">{progress?.percentage}%</p>
                    </div>
                    <div className="rounded-[1.5rem] bg-emerald-50 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">Lider</p>
                      <p className="mt-2 text-2xl font-black text-emerald-800">
                        {ranking[0]?.name ?? "-"}
                      </p>
                    </div>
                  </div>
                </section>

                <RankingTable rows={ranking} />

                {activeTournament.completed ? (
                  <section className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">
                          Torneo finalizado
                        </p>
                        <h3 className="mt-2 text-3xl font-black text-slate-950">
                          Ranking final y estadisticas
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={handleExportCsv}
                          className="rounded-full border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-cyan-500 hover:text-cyan-700"
                        >
                          Exportar CSV
                        </button>
                        <button
                          type="button"
                          onClick={handleRestartTournament}
                          className="rounded-full bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                        >
                          Reiniciar torneo
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {stats.map((player, index) => (
                        <article
                          key={player.playerId}
                          className={`rounded-[1.75rem] border p-5 ${
                            index === 0
                              ? "border-emerald-300 bg-emerald-50"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-lg font-black text-slate-950">{player.name}</p>
                              <p className="text-sm text-slate-500">
                                {player.wins} ganados · {player.losses} perdidos ·{" "}
                                {Math.round(player.winRate * 100)}% de efectividad
                              </p>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                            <div className="rounded-2xl bg-white px-3 py-3">
                              <p className="text-slate-500">Puntos</p>
                              <p className="mt-1 text-xl font-black text-slate-950">{player.points}</p>
                            </div>
                            <div className="rounded-2xl bg-white px-3 py-3">
                              <p className="text-slate-500">GF / GC</p>
                              <p className="mt-1 text-xl font-black text-slate-950">
                                {player.gamesFor}/{player.gamesAgainst}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-white px-3 py-3">
                              <p className="text-slate-500">Diff</p>
                              <p className="mt-1 text-xl font-black text-slate-950">{player.gameDiff}</p>
                            </div>
                          </div>
                          <p className="mt-4 text-sm text-slate-600">
                            Parejas usadas: {player.partners.join(", ") || "Sin datos"}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            Rivales vistos: {player.opponents.join(", ") || "Sin datos"}
                          </p>
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
                        <h3 className="mt-2 text-3xl font-black text-slate-950">
                          {roundLabel(currentRound)}
                        </h3>
                        <p className="mt-2 text-sm text-slate-600">
                          Captura los resultados y guarda para recalcular el ranking inmediatamente.
                        </p>
                        {currentRound.restingPlayerIds.length ? (
                          <p className="mt-3 rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
                            Descansan: {formatPlayerList(currentRound.restingPlayerIds, names)}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={handleSaveRound}
                          className="rounded-full bg-linear-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-500/25 transition hover:scale-[1.01]"
                        >
                          Guardar resultados
                        </button>
                      </div>
                    </div>

                    {error ? (
                      <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                        {error}
                      </div>
                    ) : null}

                    <div className="grid gap-4 lg:grid-cols-2">
                      {currentRound.matches.map((match) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          names={names}
                          onScoreChange={handleScoreChange}
                        />
                      ))}
                    </div>

                    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                      No se puede avanzar sin guardar correctamente la ronda actual. Si editas una
                      ronda anterior, las siguientes quedaran pendientes para mantener el ranking
                      coherente.
                    </div>
                  </section>
                ) : null}

                <section className="grid gap-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-700">
                        Historial
                      </p>
                      <h3 className="mt-2 text-2xl font-black text-slate-950">Rondas anteriores</h3>
                    </div>
                  </div>
                  <RoundHistory rounds={finishedRounds} names={names} onEdit={handleEditRound} />
                </section>
              </>
            ) : (
              <section className="grid h-full place-items-center rounded-[2rem] border border-dashed border-slate-300 bg-white/60 p-8 text-center shadow-[0_24px_60px_-45px_rgba(15,23,42,0.35)] backdrop-blur">
                <div className="max-w-lg">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-700">
                    Listo para empezar
                  </p>
                  <h2 className="mt-3 text-3xl font-black text-slate-950">
                    Crea tu primer torneo y la app arma todo el flujo.
                  </h2>
                  <p className="mt-3 text-base text-slate-600">
                    Tendras rondas generadas automaticamente, captura rapida de scores, ranking en
                    vivo y almacenamiento local para retomar despues.
                  </p>
                </div>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
