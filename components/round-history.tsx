import { formatPlayerList, formatTeam, roundHasScores } from "@/lib/tournament";
import { Round } from "@/lib/types";

type RoundHistoryProps = {
  rounds: Round[];
  names: Record<string, string>;
  onEdit: (roundId: string) => void;
};

export function RoundHistory({ rounds, names, onEdit }: RoundHistoryProps) {
  return (
    <div className="grid min-w-0 gap-4">
      {rounds.map((round) => (
        <section
          key={round.id}
          className="min-w-0 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.45)] sm:p-5"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h4 className="text-lg font-black text-slate-950">Ronda {round.number}</h4>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    round.status === "completed"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {round.status === "completed" ? "Guardada" : "Pendiente"}
                </span>
              </div>
              {round.restingPlayerIds.length ? (
                <p className="mt-2 text-sm text-slate-500">
                  Descansan: {formatPlayerList(round.restingPlayerIds, names)}
                </p>
              ) : null}
            </div>

            {roundHasScores(round) ? (
              <button
                type="button"
                onClick={() => onEdit(round.id)}
                className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-cyan-500 hover:text-cyan-700 md:w-auto"
              >
                Editar esta ronda
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3">
            {round.matches.map((match) => (
              <div
                key={match.id}
                className="flex min-w-0 flex-col gap-2 rounded-[1.25rem] bg-slate-50 px-3 py-3 text-sm text-slate-700 md:flex-row md:items-center md:justify-between md:px-4"
              >
                <span className="min-w-0 break-words font-semibold">
                  Cancha {match.court}: {formatTeam(match, "A", names)}
                </span>
                <span className="self-start rounded-full bg-white px-3 py-1 text-center font-black text-slate-950 md:self-auto">
                  {match.score ? `${match.score.teamA} - ${match.score.teamB}` : "Sin score"}
                </span>
                <span className="min-w-0 break-words font-semibold">{formatTeam(match, "B", names)}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
