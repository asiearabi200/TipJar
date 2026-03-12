export default function ProgressBar({ current = 0, target = 0 }) {
  const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
        <span>Goal progress</span>
        <span>{progress}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-900/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-pink-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
