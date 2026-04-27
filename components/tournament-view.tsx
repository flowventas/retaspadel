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
  playerNameMap,
  reopenRound,
  roundLabel,
  saveRound,
  tournamentProgress,
  updateMatchScore,
  validateRoundScores,
  validScoreCombos,
} from "@/lib/tournament";
import { Tournament, TournamentStore } from "@/lib/types";

type TournamentViewProps = {
  tournamentId: string;
};

const SCORE_MESSAGES = [
  "Score guardado. El ranking se movio.",
  "La cancha hablo.",
  "Nueva ronda, nueva oportunidad.",
];

export function TournamentView({ tournamentId }: TournamentViewProps) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const router = useRouter();
  const [store, setStore] = useState<TournamentStore>(() => loadStore());
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!isClient) {
      return;
    }

    saveStore(store);
    document.documentElement.classList.toggle("dark", store.theme === "dark");
  }, [isClient, store]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

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
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-8 text-center shadow-[var(--shadow-strong)]">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--brand-primary)]">
            Reta perdida
          </p>
          <h1 className="mt-3 text-3xl font-black text-[var(--app-text)]">No encontramos esta reta.</h1>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-2xl bg-[var(--brand-primary)] px-5 py-3 text-sm font-black text-black"
          >
            Volver a 6 loco
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

    if (match.score === null && delta === -1) {
      return;
    }

    if (match.score === null && delta === 1) {
      persistTournament(
        updateMatchScore(
          tournament,
          currentRound.id,
          matchId,
          createLinkedScore(0, tournament.gamesPerMatch),
        ),
      );
      setError("");
      return;
    }

    const currentTeamA = match.score?.teamA ?? 0;
    const nextTeamA = currentTeamA + delta;
    if (nextTeamA < 0 || nextTeamA > tournament.gamesPerMatch) {
      setError(`El score no cuadra. Esta reta es a ${tournament.gamesPerMatch} juegos.`);
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

    const validationError = validateRoundScores(currentRound, tournament.gamesPerMatch);
    if (validationError) {
      setError(validationError);
      return;
    }

    const nextTournament = saveRound(tournament, currentRound.id);
    persistTournament(nextTournament);
    setError("");
    setFeedback(SCORE_MESSAGES[(currentRound.number - 1) % SCORE_MESSAGES.length]);
  }

  function handleEditRound(roundId: string) {
    persistTournament(reopenRound(tournament, roundId));
    setError("");
    setFeedback("Score reabierto. Que siga la reta.");
  }

  function handleDeleteTournament() {
    if (!window.confirm(`Vas a borrar la reta "${tournament.name}". Seguro?`)) {
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
    setFeedback("CSV listo. La reta ya quedo guardada.");
  }

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top,_rgba(57,255,20,0.14),_transparent_42%),radial-gradient(circle_at_right,_rgba(125,255,90,0.08),_transparent_32%)]" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="sticky top-3 z-20 mb-6 flex min-w-0 flex-col gap-4 rounded-[2rem] border border-[var(--hero-border)] bg-[image:var(--hero-bg)] px-4 py-5 text-[var(--hero-text)] shadow-[var(--shadow-strong)] backdrop-blur sm:px-6 sm:py-6">
          <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/" className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--brand-primary)]">
                  Volver
                </Link>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-[var(--hero-muted)]">
                  6 loco
                </span>
              </div>
              <h1 className="mt-3 break-words text-2xl font-black tracking-tight min-[541px]:text-3xl sm:text-4xl">
                {tournament.name}
              </h1>
              <p className="mt-2 max-w-3xl break-words text-sm text-[var(--hero-muted)] md:text-base">
                Juega. Compite. Sube en el ranking.
              </p>
              <p className="mt-3 break-words text-sm text-[var(--hero-muted)]">
                Banda: {formatPlayerList(tournament.players.map((player) => player.id), names)}
              </p>
            </div>

            <div className="flex w-full items-start justify-between gap-3 sm:w-auto sm:justify-end">
              <nav className="flex flex-wrap gap-2">
                <a
                  href="#scores"
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                >
                  Scores
                </a>
                <a
                  href="#tabla-de-poder"
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                >
                  Tabla
                </a>
                <a
                  href="#historial"
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                >
                  Rondas
                </a>
              </nav>
              <ThemeToggle theme={store.theme} onToggle={handleThemeToggle} />
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-2 min-[541px]:gap-3 md:grid-cols-4">
            <div className="rounded-[1.25rem] bg-white/5 px-3 py-3 min-[541px]:rounded-[1.5rem] min-[541px]:px-4 min-[541px]:py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--hero-muted)]">Ronda activa</p>
              <p className="mt-2 break-words text-lg font-black text-white min-[541px]:text-xl sm:text-2xl">
                {currentRound ? roundLabel(currentRound) : "Sin ronda"}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-white/5 px-3 py-3 min-[541px]:rounded-[1.5rem] min-[541px]:px-4 min-[541px]:py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--hero-muted)]">Canchas</p>
              <p className="mt-2 break-words text-lg font-black text-white min-[541px]:text-xl sm:text-2xl">
                {currentRound?.matches.length ?? 0}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-white/5 px-3 py-3 min-[541px]:rounded-[1.5rem] min-[541px]:px-4 min-[541px]:py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--hero-muted)]">Avance</p>
              <p className="mt-2 break-words text-lg font-black text-white min-[541px]:text-xl sm:text-2xl">
                {progress.percentage}%
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-white/5 px-3 py-3 min-[541px]:rounded-[1.5rem] min-[541px]:px-4 min-[541px]:py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--hero-muted)]">Lider</p>
              <p className="mt-2 break-words text-lg font-black text-[var(--brand-primary)] min-[541px]:text-xl sm:text-2xl">
                {ranking[0]?.name ?? "-"}
              </p>
            </div>
          </div>
        </header>

        <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="grid min-w-0 content-start gap-6">
            {feedback ? (
              <div className="animate-pulse-rise rounded-[1.5rem] border border-[var(--brand-primary)] bg-[var(--brand-accent-soft)] px-4 py-3 text-sm font-bold text-[var(--brand-primary)]">
                {feedback}
              </div>
            ) : null}

            {tournament.completed ? (
              <section className="grid gap-6 rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-strong)]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand-primary)]">
                    Reta cerrada
                  </p>
                  <h2 className="mt-2 text-3xl font-black text-[var(--app-text)]">El que mando en la cancha</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {stats.map((player, index) => (
                    <article
                      key={player.playerId}
                      className={`rounded-[1.75rem] border p-5 ${
                        index === 0
                          ? "border-[var(--brand-primary)] bg-[linear-gradient(145deg,rgba(57,255,20,0.14),rgba(30,30,30,0.94))] shadow-[0_0_30px_rgba(57,255,20,0.14)]"
                          : "border-[var(--line)] bg-[var(--surface-subtle)]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words text-lg font-black text-[var(--app-text)]">{player.name}</p>
                          <p className="text-sm text-[var(--muted)]">
                            G-P-E {player.wins}-{player.losses}-{player.draws} / Diff {player.gameDiff}
                          </p>
                        </div>
                        <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs font-bold text-[var(--muted)]">
                          #{index + 1}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : currentRound ? (
              <section
                id="scores"
                className="grid gap-4 rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--shadow-strong)] sm:p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand-primary)]">
                      Scores en vivo
                    </p>
                    <h2 className="mt-2 break-words text-2xl font-black text-[var(--app-text)] sm:text-3xl">
                      {roundLabel(currentRound)}
                    </h2>
                    <p className="mt-2 break-words text-sm text-[var(--muted)]">
                      Scores validos para esta reta a {tournament.gamesPerMatch} juegos: {validScoreCombos(tournament.gamesPerMatch)}.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveRound}
                    className="w-full rounded-2xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-black text-black transition hover:shadow-[0_0_28px_rgba(57,255,20,0.35)] md:w-auto"
                  >
                    Guardar score
                  </button>
                </div>

                {error ? (
                  <div className="rounded-[1.4rem] border border-[color:color-mix(in_srgb,var(--danger-text)_28%,white)] bg-[var(--danger-bg)] px-4 py-3 text-sm font-semibold text-[var(--danger-text)]">
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

            <section id="historial" className="grid min-w-0 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand-primary)]">Rondas y scores</p>
                <h2 className="mt-2 text-2xl font-black text-[var(--app-text)]">La historia de la reta</h2>
              </div>
              <RoundHistory rounds={finishedRounds} names={names} onEdit={handleEditRound} />
            </section>

            <section className="grid gap-3 rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--shadow-strong)] sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand-primary)]">Acciones</p>
                <h2 className="mt-2 text-xl font-black text-[var(--app-text)]">Cierra o comparte la reta</h2>
              </div>
              <div className="grid gap-3 sm:flex sm:flex-wrap">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--app-text)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] sm:w-auto"
                >
                  Exportar scores
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTournament}
                  className="w-full rounded-2xl border border-[color:color-mix(in_srgb,var(--danger-text)_28%,white)] bg-[var(--danger-bg)] px-4 py-3 text-sm font-semibold text-[var(--danger-text)] transition hover:opacity-90 sm:w-auto"
                >
                  Cerrar reta
                </button>
              </div>
            </section>
          </div>

          <div className="hidden min-w-0 content-start gap-6 lg:grid">
            <RankingTable rows={ranking} />
          </div>
        </section>
      </div>
    </main>
  );
}
