import { formatSats } from "../lib/format";

export default function ChartBars({ items = [] }) {
  const max = Math.max(...items.map((item) => item.total), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.date}>
          <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
            <span>{item.date}</span>
            <span>{formatSats(item.total)}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-900/80">
            <div
              className="h-full rounded-full bg-cyan-400"
              style={{ width: `${Math.max((item.total / max) * 100, 6)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
