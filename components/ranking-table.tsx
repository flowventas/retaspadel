import { RankingRow } from "@/lib/types";

type RankingTableProps = {
  rows: RankingRow[];
};

export function RankingTable({ rows }: RankingTableProps) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.4)]">
      <div className="flex flex-col gap-3 border-b border-[var(--line)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand-secondary)]">
            Ranking en vivo
          </p>
          <h3 className="mt-1 text-xl font-black text-[var(--app-text)]">Clasificacion actual</h3>
        </div>
        {rows[0] ? (
          <div className="rounded-full bg-[var(--brand-accent-soft)] px-4 py-2 text-sm font-bold text-[var(--brand-secondary)]">
            Lider: {rows[0].name}
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 p-4 min-[541px]:hidden">
        {rows.map((row, index) => (
          <article
            key={row.playerId}
            className={`rounded-[1.5rem] border px-4 py-4 ${
              index === 0 ? "border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]" : "border-[var(--line)] bg-[var(--surface-subtle)]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-black text-[var(--app-text)]">
                  #{index + 1} {row.name}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  G-P-E {row.wins}-{row.losses}-{row.draws}
                </p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-sm font-black text-[var(--brand-secondary)]">
                P {row.points}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-white px-3 py-2">
                <p className="text-[var(--muted)]">G-P-E</p>
                <p className="font-black text-[var(--app-text)]">
                  {row.wins}-{row.losses}-{row.draws}
                </p>
              </div>
              <div className="rounded-xl bg-white px-3 py-2">
                <p className="text-[var(--muted)]">Diff</p>
                <p className={`font-black ${row.gameDiff >= 0 ? "text-[var(--brand-secondary)]" : "text-rose-700"}`}>
                  {row.gameDiff > 0 ? `+${row.gameDiff}` : row.gameDiff}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto min-[541px]:block">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--surface-subtle)] text-[var(--muted)]">
            <tr>
              {["#", "Jugador", "G-P-E", "Diff", "P"].map((header) => (
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
                className={`border-t border-[var(--line)] ${index === 0 ? "bg-[var(--brand-accent-soft)]" : "bg-white"}`}
              >
                <td className="px-4 py-3 font-black text-[var(--app-text)]">{index + 1}</td>
                <td className="px-4 py-3 font-semibold text-[var(--app-text)]">{row.name}</td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {row.wins}-{row.losses}-{row.draws}
                </td>
                <td
                  className={`px-4 py-3 font-bold ${row.gameDiff >= 0 ? "text-[var(--brand-secondary)]" : "text-rose-700"}`}
                >
                  {row.gameDiff > 0 ? `+${row.gameDiff}` : row.gameDiff}
                </td>
                <td className="px-4 py-3 font-black text-[var(--brand-secondary)]">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
