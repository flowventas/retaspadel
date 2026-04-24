import { formatTeam, matchWinner } from "@/lib/tournament";
import { GamesPerMatch, Match } from "@/lib/types";

type MatchCardProps = {
  match: Match;
  names: Record<string, string>;
  gamesPerMatch: GamesPerMatch;
  disabled?: boolean;
  onAdjustScore: (matchId: string, delta: -1 | 1) => void;
};

function ScoreStepper({
  value,
  max,
  disabled,
  onAdjust,
}: {
  value: number | null;
  max: number;
  disabled: boolean;
  onAdjust: (delta: -1 | 1) => void;
}) {
  return (
    <div className="flex w-full shrink-0 items-center justify-end gap-2 self-end sm:w-auto sm:self-auto">
      <button
        type="button"
        onClick={() => onAdjust(-1)}
        disabled={disabled || value === null || value <= 0}
        className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-700 transition hover:border-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300 sm:h-12 sm:w-12 sm:rounded-2xl sm:text-2xl"
      >
        -
      </button>
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-xl font-black text-slate-950 sm:h-14 sm:w-16 sm:rounded-2xl sm:text-2xl">
        {value ?? ""}
      </div>
      <button
        type="button"
        onClick={() => onAdjust(1)}
        disabled={disabled || value === max}
        className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-700 transition hover:border-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300 sm:h-12 sm:w-12 sm:rounded-2xl sm:text-2xl"
      >
        +
      </button>
    </div>
  );
}

export function MatchCard({
  match,
  names,
  gamesPerMatch,
  disabled = false,
  onAdjustScore,
}: MatchCardProps) {
  const score = match.score;
  const winner = matchWinner(match.score);

  return (
    <article className="min-w-0 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-700">
            Cancha {match.court}
          </p>
          <h4 className="mt-1 text-lg font-black text-slate-950">Partido {match.court}</h4>
        </div>
        <div className="self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          A {gamesPerMatch} juegos
        </div>
      </div>

      <div className="grid gap-3">
        <div
          className={`rounded-[1.5rem] border px-4 py-4 ${
            winner === "A" ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Pareja A</p>
          <div className="mt-2 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0 break-words pr-1 text-base font-bold text-slate-900">
              {formatTeam(match, "A", names)}
            </p>
            <ScoreStepper
              value={score?.teamA ?? null}
              max={gamesPerMatch}
              disabled={disabled}
              onAdjust={(delta) => onAdjustScore(match.id, delta)}
            />
          </div>
        </div>

        <div
          className={`rounded-[1.5rem] border px-4 py-4 ${
            winner === "B" ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Pareja B</p>
          <div className="mt-2 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0 break-words pr-1 text-base font-bold text-slate-900">
              {formatTeam(match, "B", names)}
            </p>
            <div className="grid h-12 w-12 shrink-0 place-items-center self-end rounded-xl bg-white text-xl font-black text-slate-950 sm:h-14 sm:w-16 sm:self-auto sm:rounded-2xl sm:text-2xl">
              {score?.teamB ?? ""}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
