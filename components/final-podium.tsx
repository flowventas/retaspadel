import { RankingRow } from "@/lib/types";

type FinalPodiumProps = {
  rows: RankingRow[];
  onClose: () => void;
  onDownload: () => void;
  isDownloading?: boolean;
};

const PLACE_LABELS = ["1er lugar", "2do lugar", "3er lugar"] as const;
const PLACE_HEIGHTS = ["min-h-[11rem]", "min-h-[9rem]", "min-h-[8rem]"] as const;
const PLACE_ORDER = [1, 0, 2] as const;

export function FinalPodium({ rows, onClose, onDownload, isDownloading = false }: FinalPodiumProps) {
  const winners = rows.slice(0, 3);

  if (!winners.length) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="app-card w-full max-w-3xl p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="app-kicker">Reta finalizada</p>
            <h2 className="mt-2 text-3xl font-black text-[var(--app-text)] sm:text-4xl">
              Asi quedo el podio final.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
              El ranking ya cerro. Aqui estan los tres que mandaron en la cancha.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar podio final"
            className="app-button app-button-secondary shrink-0 px-4 py-2 text-sm"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:items-end">
          {PLACE_ORDER.map((winnerIndex, orderIndex) => {
            const winner = winners[winnerIndex];
            if (!winner) {
              return <div key={`empty-${winnerIndex}`} className="hidden sm:block" />;
            }

            return (
              <article
                key={winner.playerId}
                className={`motion-podium app-panel grid content-end gap-3 px-4 py-5 text-center ${PLACE_HEIGHTS[winnerIndex]}`}
                style={{ animationDelay: `${orderIndex * 120}ms` }}
              >
                <span className="mx-auto inline-flex rounded-full bg-[var(--brand-accent-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-secondary)]">
                  {PLACE_LABELS[winnerIndex]}
                </span>
                <div>
                  <p className="break-words text-lg font-black text-[var(--app-text)] sm:text-xl">{winner.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {winner.wins}-{winner.losses}-{winner.draws} / {winner.points} pts
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="app-button app-button-secondary px-5 py-3 text-sm"
          >
            Ver tabla final
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={isDownloading}
            className="app-button app-button-primary px-5 py-3 text-sm disabled:cursor-wait"
          >
            {isDownloading ? "Preparando PNG..." : "Descargar tabla de poder"}
          </button>
        </div>
      </div>
    </div>
  );
}
