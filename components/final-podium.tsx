import { RankingRow } from "@/lib/types";

type FinalPodiumProps = {
  rows: RankingRow[];
  onClose: () => void;
  onDownload: () => void;
  isDownloading?: boolean;
};

const MEDALS = [
  { emoji: "🥇", label: "1er lugar", tone: "border-yellow-300/60 bg-yellow-100/70 text-yellow-900 dark:border-yellow-200/25 dark:bg-yellow-200/10 dark:text-yellow-100" },
  { emoji: "🥈", label: "2do lugar", tone: "border-slate-300/70 bg-slate-100/80 text-slate-800 dark:border-slate-200/20 dark:bg-slate-200/10 dark:text-slate-100" },
  { emoji: "🥉", label: "3er lugar", tone: "border-orange-300/60 bg-orange-100/75 text-orange-900 dark:border-orange-200/20 dark:bg-orange-200/10 dark:text-orange-100" },
] as const;

export function FinalPodium({ rows, onClose, onDownload, isDownloading = false }: FinalPodiumProps) {
  const winners = rows.slice(0, 3);

  if (!winners.length) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/72 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto flex min-h-full w-full max-w-lg items-center">
        <div className="app-card w-full p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="app-kicker">Reta finalizada</p>
              <h2 className="mt-2 text-2xl font-black text-[var(--app-text)] sm:text-3xl">
                Podio final
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Asi quedaron los tres primeros lugares.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar podio final"
              className="app-button app-button-secondary shrink-0 px-3 py-2 text-sm"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-6 grid gap-3">
            {winners.map((winner, index) => (
              <article
                key={winner.playerId}
                className={`motion-podium flex items-center gap-3 rounded-[1.25rem] border px-4 py-3 sm:px-5 ${MEDALS[index].tone}`}
                style={{ animationDelay: `${index * 110}ms` }}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/65 text-xl shadow-sm dark:bg-white/10">
                  <span aria-hidden="true">{MEDALS[index].emoji}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] opacity-80">
                    {MEDALS[index].label}
                  </p>
                  <p className="mt-1 break-words text-base font-black sm:text-lg">
                    {winner.name}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={onClose}
              className="app-button app-button-secondary w-full px-5 py-3 text-sm"
            >
              Ver tabla final
            </button>
            <button
              type="button"
              onClick={onDownload}
              disabled={isDownloading}
              className="app-button app-button-primary w-full px-5 py-3 text-sm disabled:cursor-wait"
            >
              {isDownloading ? "Preparando PNG..." : "Descargar tabla de poder"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
