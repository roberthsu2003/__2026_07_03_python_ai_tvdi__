import { speciesOf } from '../species'

interface ProbabilityBarsProps {
  probabilities: Record<string, number>
  topLabel?: string
}

export default function ProbabilityBars({ probabilities, topLabel }: ProbabilityBarsProps) {
  const entries = Object.entries(probabilities).sort((a, b) => b[1] - a[1])

  return (
    <div className="flex flex-col gap-4">
      {entries.map(([cls, val]) => {
        const info = speciesOf(cls)
        const pct = val * 100
        const isTop = cls === topLabel
        return (
          <div key={cls}>
            <div className="mb-1.5 flex items-center justify-between text-sm font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                <span>{info.emoji}</span>
                <span className="capitalize">{info.en}</span>
                <span className="text-xs font-normal text-slate-400">{info.zh}</span>
                {isTop && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
                    style={{ backgroundColor: info.color }}
                  >
                    預測
                  </span>
                )}
              </span>
              <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                {pct.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-out"
                style={{ width: `${pct}%`, backgroundColor: info.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
