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
        className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] text-2xl font-black text-[var(--app-text)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] disabled:cursor-not-allowed disabled:opacity-45"
      >
        -
      </button>
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--surface-strong)] text-2xl font-black text-[var(--app-text)] sm:h-14 sm:w-16">
        {value ?? ""}
      </div>
      <button
        type="button"
        onClick={() => onAdjust(1)}
        disabled={disabled || value === max}
        className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] text-2xl font-black text-[var(--app-text)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] disabled:cursor-not-allowed disabled:opacity-45"
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
  const outcomeLabel =
    winner === "draw" ? "Se puso parejo" : winner ? "El que mando en la cancha" : "Score pendiente";

  return (
    <article className="min-w-0 rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface-subtle)] p-4 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.8)] sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand-primary)]">
            Cancha {match.court}
          </p>
          <h4 className="mt-1 text-xl font-black text-[var(--app-text)]">Partido {match.court}</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs font-bold text-[var(--muted)]">
            A {gamesPerMatch} juegos
          </span>
          <span className="rounded-full border border-[var(--line)] bg-black/20 px-3 py-1 text-xs font-bold text-[var(--brand-primary)]">
            {outcomeLabel}
          </span>
        </div>
      </div>

      <div className="grid gap-3">
        <div
          className={`rounded-[1.4rem] border px-4 py-4 ${
            winner === "A"
              ? "border-[var(--brand-primary)] bg-[var(--brand-accent-soft)] shadow-[0_0_22px_rgba(57,255,20,0.12)]"
              : "border-[var(--line)] bg-[var(--card)]"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--muted)]">Pareja A</p>
          <div className="mt-2 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0 break-words pr-1 text-base font-bold text-[var(--app-text)]">
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
          className={`rounded-[1.4rem] border px-4 py-4 ${
            winner === "B"
              ? "border-[var(--brand-primary)] bg-[var(--brand-accent-soft)] shadow-[0_0_22px_rgba(57,255,20,0.12)]"
              : "border-[var(--line)] bg-[var(--card)]"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--muted)]">Pareja B</p>
          <div className="mt-2 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0 break-words pr-1 text-base font-bold text-[var(--app-text)]">
              {formatTeam(match, "B", names)}
            </p>
            <div className="grid h-14 w-14 shrink-0 place-items-center self-end rounded-2xl bg-[var(--surface-strong)] text-2xl font-black text-[var(--app-text)] sm:h-14 sm:w-16 sm:self-auto">
              {score?.teamB ?? ""}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
