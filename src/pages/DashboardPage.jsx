import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import StatCard from "../components/StatCard";
import ChartBars from "../components/ChartBars";
import { getDonations, getPage, getStats, updatePage } from "../lib/api";
import { formatDate, formatSats } from "../lib/format";

export default function DashboardPage() {
  const [usernameInput, setUsernameInput] = useState("");
  const [page, setPage] = useState(null);
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function handleLoad(event) {
    event.preventDefault();
    if (!usernameInput) return;
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const [pageResult, statsResult, donationsResult] = await Promise.all([
        getPage(usernameInput),
        getStats(usernameInput),
        getDonations(usernameInput)
      ]);
      setPage(pageResult.page);
      setStats(statsResult.stats);
      setDonations(donationsResult.donations);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleHideMessage(donationId) {
    if (!page) return;

    try {
      await updatePage(page.username, {
        hideDonationMessageId: donationId
      });
      const donationsResult = await getDonations(page.username);
      setDonations(donationsResult.donations);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  const embedSnippet = useMemo(
    () =>
      page
        ? `<iframe src="${window.location.origin}/tip/${page.username}" width="420" height="720" style="border:none;border-radius:24px;overflow:hidden"></iframe>`
        : "",
    [page]
  );

  return (
    <div className="mx-auto max-w-7xl px-6">
      <Shell className="p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200">
              Owner dashboard
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold text-white">
              Stats, donations, and page controls
            </h1>
          </div>
          <form className="flex flex-col gap-3 md:flex-row" onSubmit={handleLoad}>
            <input
              className="rounded-full border border-white/10 bg-slate-900/70 px-5 py-3 outline-none"
              placeholder="Enter username"
              value={usernameInput}
              onChange={(event) => setUsernameInput(event.target.value)}
            />
            <button className="rounded-full bg-amber-300 px-6 py-3 text-sm font-bold text-slate-950">
              {loading ? "Loading..." : "Load dashboard"}
            </button>
          </form>
        </div>

        {status.message ? (
          <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {status.message}
          </div>
        ) : null}
      </Shell>

      {page && stats ? (
        <div className="mt-6 grid gap-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Collected" value={formatSats(stats.totalConfirmedSats)} />
            <StatCard label="Donations" value={String(stats.donationCount)} />
            <StatCard label="Unique supporters" value={String(stats.uniqueSupporters)} />
            <StatCard label="Pending" value={formatSats(stats.pendingSats)} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Shell className="p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Daily donation chart</h2>
                <Link to={`/tip/${page.username}`} className="text-sm font-semibold text-amber-200">
                  Open public page
                </Link>
              </div>
              <div className="mt-6">
                <ChartBars items={stats.dailyTotals} />
              </div>
            </Shell>

            <Shell className="p-8">
              <h2 className="text-2xl font-bold text-white">Embed widget</h2>
              <p className="mt-3 text-slate-300">
                Use this iframe snippet to embed the public donation page.
              </p>
              <textarea
                readOnly
                className="mt-5 min-h-40 w-full rounded-3xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-200 outline-none"
                value={embedSnippet}
              />
            </Shell>
          </div>

          <Shell className="p-8">
            <h2 className="text-2xl font-bold text-white">All donations</h2>
            <div className="mt-6 space-y-4">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{donation.donorName || "Anonymous"}</p>
                      <p className="text-sm text-slate-400">{formatDate(donation.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-100">{formatSats(donation.amountSats)}</span>
                      <button
                        type="button"
                        onClick={() => handleHideMessage(donation.id)}
                        className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
                      >
                        Hide message
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-slate-300">
                    {donation.hiddenMessage ? "Hidden by owner" : donation.message || "No message"}
                  </p>
                </div>
              ))}
            </div>
          </Shell>
        </div>
      ) : null}
    </div>
  );
}
