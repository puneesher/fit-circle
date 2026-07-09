import {
  dailyVolumeFromHistory,
  formatChartDate,
  formatVolume,
} from "@/lib/history-volume";

function barBackground(colors) {
  if (!colors || colors.length === 0) return undefined;
  if (colors.length === 1) return colors[0];
  // Gradient with equal stops
  const stops = colors.map(
    (c, i) => `${c} ${(i / colors.length) * 100}%, ${c} ${((i + 1) / colors.length) * 100}%`
  );
  return `linear-gradient(to top, ${stops.join(", ")})`;
}

export default function DailyVolumeChart({ history, routineColors = {} }) {
  const data = dailyVolumeFromHistory(history);

  if (data.length === 0) return null;

  const maxVolume = Math.max(...data.map((entry) => entry.volume));

  // Build a map: date → colors (from the session's routineId)
  const dateColors = {};
  for (const session of history) {
    if (!session.date || !session.routineId) continue;
    const colors = routineColors[session.routineId];
    if (colors && colors.length > 0 && !dateColors[session.date]) {
      dateColors[session.date] = colors;
    }
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Daily volume</h2>
      <p className="mt-0.5 text-sm text-zinc-500">
        Sets × reps × weight, summed per day
      </p>

      <div className="mt-4 flex h-44 items-end gap-0.5">
        {data.map((entry) => {
          const height = maxVolume > 0 ? (entry.volume / maxVolume) * 100 : 0;
          const colors = dateColors[entry.date];
          const bg = barBackground(colors);

          return (
            <div
              key={entry.date}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <div className="flex h-36 w-full items-end">
                <div
                  className={`relative w-full overflow-hidden rounded-t-md ${!bg ? "bg-zinc-900 dark:bg-zinc-100" : ""}`}
                  style={{
                    height: `${Math.max(height, 8)}%`,
                    ...(bg ? { background: bg } : {}),
                  }}
                  title={`${formatChartDate(entry.date)}: ${formatVolume(entry.volume)}`}
                >
                  <span className="absolute inset-x-0 top-1 text-center text-[9px] font-bold text-white dark:text-zinc-900">
                    {formatVolume(entry.volume)}
                  </span>
                </div>
              </div>
              <span className="whitespace-nowrap text-[10px] text-zinc-500">
                {formatChartDate(entry.date)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
