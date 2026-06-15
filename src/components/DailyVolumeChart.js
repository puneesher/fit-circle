import {
  dailyVolumeFromHistory,
  formatChartDate,
  formatVolume,
} from "@/lib/history-volume";

export default function DailyVolumeChart({ history }) {
  const data = dailyVolumeFromHistory(history);

  if (data.length === 0) return null;

  const maxVolume = Math.max(...data.map((entry) => entry.volume));

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Daily volume</h2>
      <p className="mt-0.5 text-sm text-zinc-500">
        Sets × reps × weight, summed per day
      </p>

      <div className="mt-4 flex h-44 items-end gap-2">
        {data.map((entry) => {
          const height = maxVolume > 0 ? (entry.volume / maxVolume) * 100 : 0;

          return (
            <div
              key={entry.date}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
                {formatVolume(entry.volume)}
              </span>
              <div className="flex h-28 w-full items-end">
                <div
                  className="w-full rounded-t-md bg-zinc-900 dark:bg-zinc-100"
                  style={{ height: `${Math.max(height, 4)}%` }}
                  title={`${formatChartDate(entry.date)}: ${formatVolume(entry.volume)}`}
                />
              </div>
              <span className="text-[10px] text-zinc-500">
                {formatChartDate(entry.date)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
