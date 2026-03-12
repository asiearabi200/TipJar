import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Shell from "../components/Shell";
import ProgressBar from "../components/ProgressBar";
import { checkDonation, createDonation, getDonations, getLeaderboard, getPage } from "../lib/api";
import { formatDate, formatSats, satsToBtc, shortAddress } from "../lib/format";
import { themeMap } from "../lib/themes";

export default function TipPage() {
  const { username } = useParams();
  const [page, setPage] = useState(null);
  const [donations, setDonations] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [pendingDonation, setPendingDonation] = useState(null);
  const [form, setForm] = useState({ amountSats: "", donorName: "", message: "" });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [pageResult, donationsResult, leaderboardResult] = await Promise.all([
          getPage(username),
          getDonations(username),
          getLeaderboard(username)
        ]);

        if (!active) return;
        setPage(pageResult.page);
        setDonations(donationsResult.donations);
        setLeaderboard(leaderboardResult.leaderboard);
      } catch (error) {
        if (!active) return;
        setStatus({ type: "error", message: error.message });
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [username]);

  const totalRaised = useMemo(
    () =>
      donations
        .filter((donation) => donation.status === "confirmed")
        .reduce((sum, donation) => sum + donation.amountSats, 0),
    [donations]
  );

  async function handleDonate(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    try {
      const result = await createDonation(username, form);
      setPendingDonation(result.donation);
      setStatus({
        type: "success",
        message: "Payment request created. Send the BTC from OP_WALLET or any compatible wallet and then click Check payment."
      });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  async function handleCheckPayment() {
    if (!pendingDonation) return;

    try {
      const result = await checkDonation(username, pendingDonation.id);
      setPendingDonation(result.donation);

      const [donationsResult, leaderboardResult] = await Promise.all([
        getDonations(username),
        getLeaderboard(username)
      ]);

      setDonations(donationsResult.donations);
      setLeaderboard(leaderboardResult.leaderboard);
      setStatus({
        type: result.donation.status === "confirmed" ? "success" : "info",
        message:
          result.donation.status === "confirmed"
            ? "Thanks screen unlocked: donation confirmed on-chain."
            : "Transaction not found yet. You can check again in a few seconds."
      });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6">
        <Shell className="p-8 text-slate-300">Loading page...</Shell>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="mx-auto max-w-7xl px-6">
        <Shell className="p-8 text-rose-100">Page not found.</Shell>
      </div>
    );
  }

  const theme = themeMap[page.theme] || themeMap.aurora;
  const qrValue = pendingDonation?.paymentUri || `bitcoin:${page.btcAddress}`;

  return (
    <div className="mx-auto max-w-7xl px-6">
      <div
        className={`relative overflow-hidden rounded-[2rem] border border-white/10 ${theme.pageClass}`}
      >
        <div className="absolute inset-0 bg-slate-950/35" />
        <div className="relative grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <Shell className="bg-slate-950/40 p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[2rem] bg-white/10">
                {page.avatarUrl ? (
                  <img
                    src={page.avatarUrl}
                    alt={page.displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {(page.displayName || page.username).slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="font-display text-4xl font-bold text-white">{page.displayName}</h1>
                <p className="mt-2 text-slate-300">@{page.username}</p>
                <p className="mt-3 max-w-2xl text-slate-200">{page.bio}</p>
                <p className="mt-4 text-sm text-slate-400">
                  Wallet: {shortAddress(page.btcAddress)} | Min message amount:{" "}
                  {formatSats(page.messageMinSats || 100)}
                </p>
              </div>
            </div>

            {page.goalSats ? (
              <div className="mt-8">
                <ProgressBar current={totalRaised} target={page.goalSats} />
                <div className="mt-2 flex items-center justify-between text-sm text-slate-300">
                  <span>{formatSats(totalRaised)} raised</span>
                  <span>{formatSats(page.goalSats)} target</span>
                </div>
              </div>
            ) : null}

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {leaderboard
                .filter((entry) => entry.period === "all")
                .slice(0, 3)
                .map((entry, index) => (
                  <div
                    key={`${entry.name}-${index}`}
                    className="rounded-3xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      #{index + 1} supporter
                    </p>
                    <p className="mt-3 text-lg font-bold text-white">{entry.name}</p>
                    <p className="text-slate-300">{formatSats(entry.totalSats)}</p>
                    <p className="mt-2 text-xs text-amber-200">{entry.badge}</p>
                  </div>
                ))}
            </div>
          </Shell>

          <Shell className="bg-slate-950/45 p-8">
            <h2 className="font-display text-3xl font-bold text-white">Send a tip</h2>
            <form className="mt-6 grid gap-4" onSubmit={handleDonate}>
              <div className="flex flex-wrap gap-3">
                {page.quickAmounts?.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, amountSats: String(amount) }))}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
                  >
                    {amount} sats
                  </button>
                ))}
              </div>
              <input
                className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 outline-none"
                type="number"
                min="1"
                placeholder="Amount in sats"
                value={form.amountSats}
                onChange={(event) =>
                  setForm((current) => ({ ...current, amountSats: event.target.value }))
                }
              />
              <input
                className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 outline-none"
                type="text"
                placeholder="Donor name (optional)"
                value={form.donorName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, donorName: event.target.value }))
                }
              />
              <textarea
                className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 outline-none"
                rows={4}
                maxLength={280}
                placeholder="Message up to 280 chars"
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({ ...current, message: event.target.value }))
                }
              />
              <button
                type="submit"
                className="rounded-full bg-amber-300 px-6 py-3 text-sm font-bold text-slate-950"
              >
                Generate QR request
              </button>
            </form>

            {pendingDonation ? (
              <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                  <div className="rounded-2xl bg-white p-3">
                    <QRCodeSVG value={qrValue} size={164} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Send exactly</p>
                    <p className="text-2xl font-bold text-white">
                      {formatSats(pendingDonation.amountSats)} |{" "}
                      {satsToBtc(pendingDonation.amountSats).toFixed(8)} BTC
                    </p>
                    <p className="break-all text-sm text-slate-300">{page.btcAddress}</p>
                    <p className="text-xs text-slate-500">Status: {pendingDonation.status}</p>
                    <button
                      type="button"
                      onClick={handleCheckPayment}
                      className="mt-3 rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10"
                    >
                      Check payment
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {status.message ? (
              <div
                className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
                  status.type === "error"
                    ? "border border-rose-500/30 bg-rose-500/10 text-rose-100"
                    : status.type === "success"
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                      : "border border-cyan-500/30 bg-cyan-500/10 text-cyan-100"
                }`}
              >
                {status.message}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
              <span>Leaderboard and latest messages update after confirmation.</span>
              <Link to={`/leaderboard/${page.username}`} className="text-amber-200">
                Full leaderboard
              </Link>
            </div>
          </Shell>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Shell className="p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Supporter messages</h2>
            <span className="text-sm text-slate-500">{donations.length} total tips</span>
          </div>
          <div className="mt-6 space-y-4">
            {donations.length ? (
              donations.map((donation) => (
                <div key={donation.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{donation.donorName || "Anonymous"}</p>
                      <p className="text-sm text-slate-400">
                        {formatDate(donation.updatedAt || donation.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        donation.status === "confirmed"
                          ? "bg-emerald-400/15 text-emerald-200"
                          : "bg-amber-400/15 text-amber-200"
                      }`}
                    >
                      {donation.status}
                    </span>
                  </div>
                  <p className="mt-4 text-slate-100">{formatSats(donation.amountSats)}</p>
                  <p className="mt-2 text-slate-300">
                    {donation.hiddenMessage ? "Hidden by page owner" : donation.message || "No message left."}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No donations yet.</p>
            )}
          </div>
        </Shell>

        <Shell className="p-8">
          <h2 className="text-2xl font-bold text-white">How payment tracking works</h2>
          <ol className="mt-5 space-y-4 text-slate-300">
            <li>1. Create a payment request with sats amount and optional message.</li>
            <li>2. Donor sends BTC to the page address using the QR code or OP_WALLET.</li>
            <li>3. The app checks mempool.space for a matching transaction to that address.</li>
            <li>4. Once found and confirmed, the donation feeds the leaderboard and dashboard.</li>
          </ol>
        </Shell>
      </div>
    </div>
  );
}
