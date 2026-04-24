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
  value: number;
  max: number;
  disabled: boolean;
  onAdjust: (delta: -1 | 1) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onAdjust(-1)}
        disabled={disabled || value <= 0}
        className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white text-2xl font-black text-slate-700 transition hover:border-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
      >
        -
      </button>
      <div className="grid h-14 w-16 place-items-center rounded-2xl bg-white text-2xl font-black text-slate-950">
        {value}
      </div>
      <button
        type="button"
        onClick={() => onAdjust(1)}
        disabled={disabled || value >= max}
        className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white text-2xl font-black text-slate-700 transition hover:border-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
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
  const score = match.score ?? { teamA: 0, teamB: gamesPerMatch };
  const winner = matchWinner(match.score);

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-700">
            Cancha {match.court}
          </p>
          <h4 className="mt-1 text-lg font-black text-slate-950">Partido {match.court}</h4>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
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
          <div className="mt-2 flex items-center justify-between gap-4">
            <p className="text-base font-bold text-slate-900">{formatTeam(match, "A", names)}</p>
            <ScoreStepper
              value={score.teamA}
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
          <div className="mt-2 flex items-center justify-between gap-4">
            <p className="text-base font-bold text-slate-900">{formatTeam(match, "B", names)}</p>
            <div className="grid h-14 w-16 place-items-center rounded-2xl bg-white text-2xl font-black text-slate-950">
              {score.teamB}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
