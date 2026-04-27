import { RankingRow } from "@/lib/types";

type RankingTableProps = {
  rows: RankingRow[];
};

function getBadge(row: RankingRow, index: number) {
  if (index === 0) {
    return "#1 Lider";
  }

  if (row.wins >= 2 && row.gameDiff >= 2) {
    return "En fuego";
  }

  if (row.gameDiff > 0) {
    return "Subiendo";
  }

  return "Parejo";
}

export function RankingTable({ rows }: RankingTableProps) {
  const hasScores = rows.some((row) => row.played > 0);

  return (
    <section
      id="tabla-de-poder"
      className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--card)] shadow-[var(--shadow-strong)]"
    >
      <div className="border-b border-[var(--line)] px-4 py-5 sm:px-5">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand-primary)]">
          Tabla de poder
        </p>
        <h3 className="mt-2 text-2xl font-black text-[var(--app-text)]">Despues de cada ronda, el ranking se actualiza solo. Aqui no hay excusas.</h3>
        {!hasScores ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            El ranking se prende despues de la primera ronda.
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 p-4 min-[741px]:hidden">
        {rows.map((row, index) => {
          const badge = getBadge(row, index);

          return (
            <article
              key={row.playerId}
              className={`rounded-[1.6rem] border p-4 ${
                index === 0
                  ? "border-[var(--brand-primary)] bg-[linear-gradient(145deg,rgba(57,255,20,0.14),rgba(30,30,30,0.95))] shadow-[0_0_32px_rgba(57,255,20,0.18)]"
                  : "border-[var(--line)] bg-[var(--surface-subtle)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-black text-[var(--brand-primary)]">#{index + 1}</span>
                    <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs font-bold text-[var(--muted)]">
                      {badge}
                    </span>
                  </div>
                  <p className="mt-3 truncate text-xl font-black text-[var(--app-text)]">{row.name}</p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-strong)] px-4 py-2 text-right">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Puntos</p>
                  <p className="text-2xl font-black text-[var(--brand-primary)]">{row.points}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-xl bg-[var(--surface-strong)] px-3 py-2">
                  <p className="text-[var(--muted)]">PJ</p>
                  <p className="font-black text-[var(--app-text)]">{row.played}</p>
                </div>
                <div className="rounded-xl bg-[var(--surface-strong)] px-3 py-2">
                  <p className="text-[var(--muted)]">G-P-E</p>
                  <p className="font-black text-[var(--app-text)]">
                    {row.wins}-{row.losses}-{row.draws}
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--surface-strong)] px-3 py-2">
                  <p className="text-[var(--muted)]">Diff</p>
                  <p className={`font-black ${row.gameDiff >= 0 ? "text-[var(--brand-primary)]" : "text-[var(--danger-text)]"}`}>
                    {row.gameDiff > 0 ? `+${row.gameDiff}` : row.gameDiff}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto min-[741px]:block">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--surface-subtle)] text-[var(--muted)]">
            <tr>
              {["#", "Jugador", "Estado", "PJ", "G-P-E", "Diff", "P"].map((header) => (
                <th key={header} className="px-4 py-3 text-left font-bold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.playerId}
                className={`border-t border-[var(--line)] ${
                  index === 0
                    ? "bg-[linear-gradient(90deg,rgba(57,255,20,0.12),rgba(30,30,30,0.92))]"
                    : "bg-[var(--card)]"
                }`}
              >
                <td className="px-4 py-4 font-black text-[var(--brand-primary)]">#{index + 1}</td>
                <td className="px-4 py-4 font-semibold text-[var(--app-text)]">{row.name}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs font-bold text-[var(--muted)]">
                    {getBadge(row, index)}
                  </span>
                </td>
                <td className="px-4 py-4 text-[var(--muted)]">{row.played}</td>
                <td className="px-4 py-4 text-[var(--muted)]">
                  {row.wins}-{row.losses}-{row.draws}
                </td>
                <td
                  className={`px-4 py-4 font-bold ${
                    row.gameDiff >= 0 ? "text-[var(--brand-primary)]" : "text-[var(--danger-text)]"
                  }`}
                >
                  {row.gameDiff > 0 ? `+${row.gameDiff}` : row.gameDiff}
                </td>
                <td className="px-4 py-4 text-lg font-black text-[var(--brand-primary)]">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
