import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Shell from "../components/Shell";
import { createPage } from "../lib/api";
import { themeOptions } from "../lib/themes";

const initialState = {
  username: "",
  displayName: "",
  avatarUrl: "",
  bio: "",
  btcAddress: "",
  goalSats: "",
  quickAmounts: "100,500,1000",
  theme: "aurora"
};

export default function CreatePage() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const previewAmounts = useMemo(
    () =>
      form.quickAmounts
        .split(",")
        .map((item) => Number(item.trim()))
        .filter(Boolean),
    [form.quickAmounts]
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const result = await createPage({
        ...form,
        quickAmounts: previewAmounts
      });
      navigate(`/tip/${result.page.username}`);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Shell className="p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200">
              Create page
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold text-white">
              Configure your Bitcoin tip profile
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              This covers the MVP from the spec: username, BTC address, avatar, bio, optional
              goal, quick donation presets, and theme selection.
            </p>
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit}>
            <Field
              label="Username"
              hint="Public URL slug used in /tip/:username"
              value={form.username}
              onChange={(value) => setForm((current) => ({ ...current, username: value }))}
              placeholder="satoshi-coder"
            />
            <Field
              label="Display name"
              value={form.displayName}
              onChange={(value) => setForm((current) => ({ ...current, displayName: value }))}
              placeholder="Satoshi Coder"
            />
            <Field
              label="Avatar URL"
              value={form.avatarUrl}
              onChange={(value) => setForm((current) => ({ ...current, avatarUrl: value }))}
              placeholder="https://..."
            />
            <Field
              label="Bio"
              textarea
              value={form.bio}
              onChange={(value) => setForm((current) => ({ ...current, bio: value }))}
              placeholder="Tell supporters what you are building."
            />
            <Field
              label="Bitcoin address"
              value={form.btcAddress}
              onChange={(value) => setForm((current) => ({ ...current, btcAddress: value }))}
              placeholder="bc1q..."
            />
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Goal in sats"
                value={form.goalSats}
                onChange={(value) => setForm((current) => ({ ...current, goalSats: value }))}
                placeholder="500000"
                type="number"
              />
              <Field
                label="Quick amounts"
                hint="Comma-separated sats presets"
                value={form.quickAmounts}
                onChange={(value) => setForm((current) => ({ ...current, quickAmounts: value }))}
                placeholder="100,500,1000"
              />
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-200">Theme</span>
              <select
                className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 outline-none ring-0"
                value={form.theme}
                onChange={(event) =>
                  setForm((current) => ({ ...current, theme: event.target.value }))
                }
              >
                {themeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>

            {status.message ? (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {status.message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-amber-300 px-6 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 disabled:opacity-70"
            >
              {submitting ? "Saving..." : "Create tip page"}
            </button>
          </form>
        </Shell>

        <Shell className="p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Preview</p>
          <div className="mt-5 rounded-[2rem] border border-white/10 bg-slate-950/55 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/10">
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-white">
                    {(form.displayName || form.username || "TJ").slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {form.displayName || "Your display name"}
                </h2>
                <p className="text-slate-400">@{form.username || "username"}</p>
              </div>
            </div>
            <p className="mt-5 text-slate-300">{form.bio || "Your bio will appear here."}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {previewAmounts.length ? (
                previewAmounts.map((amount) => (
                  <span
                    key={amount}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100"
                  >
                    {amount} sats
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">No quick amounts yet.</span>
              )}
            </div>
            <div className="mt-8">
              <Link
                to={form.username ? `/tip/${form.username}` : "#"}
                className="text-sm font-semibold text-amber-200"
              >
                Public URL preview
              </Link>
            </div>
          </div>
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
            <h3 className="font-bold text-white">Selected theme</h3>
            <p className="mt-2 text-slate-300">
              {themeOptions.find((item) => item.value === form.theme)?.preview}
            </p>
          </div>
        </Shell>
      </div>
    </div>
  );
}

function Field({ label, hint, textarea = false, onChange, ...props }) {
  const className =
    "rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 outline-none ring-0 transition placeholder:text-slate-500 focus:border-amber-300/40";

  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      {textarea ? (
        <textarea
          rows={4}
          className={className}
          onChange={(event) => onChange(event.target.value)}
          {...props}
        />
      ) : (
        <input className={className} onChange={(event) => onChange(event.target.value)} {...props} />
      )}
    </label>
  );
}
