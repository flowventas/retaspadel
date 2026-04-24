import { RankingRow } from "@/lib/types";

type RankingTableProps = {
  rows: RankingRow[];
};

export function RankingTable({ rows }: RankingTableProps) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.4)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">
            Ranking en vivo
          </p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Clasificacion actual</h3>
        </div>
        {rows[0] ? (
          <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
            Lider: {rows[0].name}
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 p-4 min-[541px]:hidden">
        {rows.map((row, index) => (
          <article
            key={row.playerId}
            className={`rounded-[1.5rem] border px-4 py-4 ${
              index === 0 ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-black text-slate-950">
                  #{index + 1} {row.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  PJ {row.played} · PG {row.wins} · PE {row.draws} · PP {row.losses}
                </p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-sm font-black text-cyan-700">
                P {row.points}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-xl bg-white px-3 py-2">
                <p className="text-slate-500">GF</p>
                <p className="font-black text-slate-950">{row.gamesFor}</p>
              </div>
              <div className="rounded-xl bg-white px-3 py-2">
                <p className="text-slate-500">GC</p>
                <p className="font-black text-slate-950">{row.gamesAgainst}</p>
              </div>
              <div className="rounded-xl bg-white px-3 py-2">
                <p className="text-slate-500">Diff</p>
                <p className={`font-black ${row.gameDiff >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {row.gameDiff > 0 ? `+${row.gameDiff}` : row.gameDiff}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto min-[541px]:block">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {["#", "Jugador", "P", "PJ", "PG", "PE", "PP", "GF", "GC", "Diff"].map((header) => (
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
                className={`border-t border-slate-100 ${
                  index === 0 ? "bg-emerald-50/70" : "bg-white"
                }`}
              >
                <td className="px-4 py-3 font-black text-slate-950">{index + 1}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{row.name}</td>
                <td className="px-4 py-3 font-black text-cyan-700">{row.points}</td>
                <td className="px-4 py-3 text-slate-600">{row.played}</td>
                <td className="px-4 py-3 text-slate-600">{row.wins}</td>
                <td className="px-4 py-3 text-slate-600">{row.draws}</td>
                <td className="px-4 py-3 text-slate-600">{row.losses}</td>
                <td className="px-4 py-3 text-slate-600">{row.gamesFor}</td>
                <td className="px-4 py-3 text-slate-600">{row.gamesAgainst}</td>
                <td
                  className={`px-4 py-3 font-bold ${
                    row.gameDiff >= 0 ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {row.gameDiff > 0 ? `+${row.gameDiff}` : row.gameDiff}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
