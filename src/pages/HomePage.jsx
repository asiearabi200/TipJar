import { Link } from "react-router-dom";
import Shell from "../components/Shell";

const features = [
  "Create a Bitcoin tip page in under a minute",
  "Share a public page with QR code and supporter wall",
  "Track donations, stats, and top supporters from one dashboard"
];

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6">
      <Shell className="overflow-hidden px-8 py-12 md:px-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200">
              Bitcoin-native creator page
            </p>
            <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight text-white md:text-6xl">
              Launch a BTC tip page with leaderboard, messages, and dashboard analytics.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              TipJarBTC is an MVP for streamers, open-source maintainers, and communities who
              want a clean page for receiving Bitcoin donations and showing public support.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/create"
                className="rounded-full bg-amber-300 px-6 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5"
              >
                Create page
              </Link>
              <a
                href="#how-it-works"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                See flow
              </a>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">MVP scope</p>
            <div className="mt-6 space-y-4">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-slate-200"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Shell>

      <div id="how-it-works" className="grid gap-6 md:grid-cols-3">
        {[
          ["1", "Create page", "Set username, BTC address, avatar, bio, goal, and quick amounts."],
          ["2", "Collect tips", "Donors enter sats and message, scan QR, and send the payment."],
          ["3", "Track impact", "Dashboard shows totals, unique supporters, trends, and leaderboard."]
        ].map(([step, title, text]) => (
          <Shell key={step} className="p-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-200">Step {step}</p>
            <h2 className="mt-4 text-2xl font-bold text-white">{title}</h2>
            <p className="mt-3 text-slate-300">{text}</p>
          </Shell>
        ))}
      </div>
    </div>
  );
}
