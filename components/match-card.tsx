import { formatTeam, matchWinner } from "@/lib/tournament";
import { Match } from "@/lib/types";

type MatchCardProps = {
  match: Match;
  names: Record<string, string>;
  disabled?: boolean;
  onScoreChange: (matchId: string, side: "teamA" | "teamB", value: string) => void;
};

export function MatchCard({ match, names, disabled = false, onScoreChange }: MatchCardProps) {
  const winner = matchWinner(match.score);

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-700">
            Cancha {match.court}
          </p>
          <h4 className="mt-1 text-lg font-black text-slate-950">Partido {match.court}</h4>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          Score rapido
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
            <input
              inputMode="numeric"
              value={match.score?.teamA ?? ""}
              onChange={(event) => onScoreChange(match.id, "teamA", event.target.value)}
              disabled={disabled}
              className="h-14 w-20 rounded-2xl border border-slate-200 bg-white text-center text-2xl font-black text-slate-950 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="0"
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
            <input
              inputMode="numeric"
              value={match.score?.teamB ?? ""}
              onChange={(event) => onScoreChange(match.id, "teamB", event.target.value)}
              disabled={disabled}
              className="h-14 w-20 rounded-2xl border border-slate-200 bg-white text-center text-2xl font-black text-slate-950 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
