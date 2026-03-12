import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Shell from "../components/Shell";
import { getLeaderboard, getPage } from "../lib/api";
import { formatSats } from "../lib/format";

export default function LeaderboardPage() {
  const { username } = useParams();
  const [page, setPage] = useState(null);
  const [entries, setEntries] = useState([]);
  const [period, setPeriod] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [pageResult, leaderboardResult] = await Promise.all([
          getPage(username),
          getLeaderboard(username)
        ]);
        if (!active) return;
        setPage(pageResult.page);
        setEntries(leaderboardResult.leaderboard);
      } catch (loadError) {
        if (active) setError(loadError.message);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [username]);

  const filteredEntries = entries.filter((entry) => period === "all" || entry.period === period);

  return (
    <div className="mx-auto max-w-5xl px-6">
      <Shell className="p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200">
              Leaderboard
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold text-white">
              {page ? `${page.displayName} supporters` : `@${username} supporters`}
            </h1>
          </div>
          <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-2">
            {["all", "month", "week"].map((value) => (
              <button
                key={value}
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  period === value ? "bg-amber-300 text-slate-950" : "text-slate-200"
                }`}
                onClick={() => setPeriod(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="mt-6 text-rose-100">{error}</p> : null}

        <div className="mt-8 space-y-4">
          {filteredEntries.length ? (
            filteredEntries.map((entry, index) => (
              <div
                key={`${entry.period}-${entry.name}-${index}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                    #{index + 1} · {entry.badge}
                  </p>
                  <p className="mt-2 text-xl font-bold text-white">{entry.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">{formatSats(entry.totalSats)}</p>
                  <p className="text-sm text-slate-400">{entry.count} confirmed donations</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400">No supporters in this period yet.</p>
          )}
        </div>

        <div className="mt-8">
          <Link to={`/tip/${username}`} className="text-sm font-semibold text-amber-200">
            Back to tip page
          </Link>
        </div>
      </Shell>
    </div>
  );
}
