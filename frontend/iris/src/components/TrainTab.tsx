import { useState } from 'react'
import { train, type TrainConfig, type TrainResult } from '../api'
import Slider from './Slider'

const IMPORTANCE_COLORS = ['#1a73e8', '#ab47bc', '#137333', '#e37400']

const DEFAULT_CONFIG: TrainConfig = {
  n_estimators: 100,
  max_depth: 0,
  test_size: 0.2,
  random_state: 42,
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-extrabold tabular-nums" style={{ color }}>
        {value}
      </div>
    </div>
  )
}

export default function TrainTab() {
  const [config, setConfig] = useState<TrainConfig>(DEFAULT_CONFIG)
  const [result, setResult] = useState<TrainResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof TrainConfig>(key: K, value: TrainConfig[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }))

  async function handleTrain() {
    setLoading(true)
    setError(null)
    try {
      const res = await train(config)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : '訓練失敗')
    } finally {
      setLoading(false)
    }
  }

  const importances = result
    ? Object.entries(result.feature_importances).sort((a, b) => b[1] - a[1])
    : []
  const maxImp = importances.length ? Math.max(...importances.map(([, v]) => v)) : 1

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 左：超參數 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
        <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
          <span>⚙️</span> 隨機森林超參數
        </h3>
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          調整參數後，於後端即時重新訓練模型
        </p>

        <div className="flex flex-col gap-5">
          <Slider
            label="決策樹數量"
            sublabel="n_estimators"
            value={config.n_estimators}
            min={10}
            max={500}
            step={10}
            decimals={0}
            color="#1a73e8"
            onChange={(v) => set('n_estimators', v)}
          />
          <Slider
            label="最大深度"
            sublabel="max_depth（0 = 無限制）"
            value={config.max_depth}
            min={0}
            max={20}
            step={1}
            decimals={0}
            color="#ab47bc"
            onChange={(v) => set('max_depth', v)}
          />
          <Slider
            label="測試集比例"
            sublabel="test_size"
            value={config.test_size}
            min={0.1}
            max={0.5}
            step={0.05}
            decimals={2}
            color="#137333"
            onChange={(v) => set('test_size', v)}
          />
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              隨機種子
              <span className="ml-1 text-xs font-normal text-slate-400">random_state</span>
            </label>
            <input
              type="number"
              min={0}
              value={config.random_state}
              onChange={(e) => set('random_state', Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleTrain}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-500 px-4 py-3 font-bold text-white shadow-md transition hover:from-teal-600 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              訓練中…
            </>
          ) : (
            <>🚀 開始訓練模型</>
          )}
        </button>
      </div>

      {/* 右：結果 */}
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
            <span>📈</span> 評估指標
          </h3>

          {error ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
              ⚠️ {error}
            </div>
          ) : result ? (
            <div className="animate-fade-in">
              <div className="grid grid-cols-3 gap-3">
                <MetricCard
                  label="測試集準確度"
                  value={`${(result.accuracy * 100).toFixed(2)}%`}
                  color="#1a73e8"
                />
                <MetricCard
                  label="訓練耗時"
                  value={`${result.train_time.toFixed(3)}s`}
                  color="#137333"
                />
                <MetricCard
                  label="決策樹數量"
                  value={String(config.n_estimators)}
                  color="#ab47bc"
                />
              </div>
              <div className="mt-3 flex justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
                <span>
                  🌲 最大深度：{config.max_depth === 0 ? '無限制' : config.max_depth}
                </span>
                <span>📊 測試集比例：{(config.test_size * 100).toFixed(0)}%</span>
              </div>
              {result.message && (
                <p className="mt-3 rounded-lg bg-teal-50 px-4 py-2 text-sm text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                  ✅ {result.message}
                </p>
              )}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">
              尚未訓練，點擊左側按鈕開始
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
            <span>💡</span> 特徵重要性
          </h3>
          {importances.length ? (
            <div className="flex animate-fade-in flex-col gap-4">
              {importances.map(([feature, val], idx) => {
                const color = IMPORTANCE_COLORS[idx % IMPORTANCE_COLORS.length]
                const pct = (val / maxImp) * 100
                return (
                  <div key={feature}>
                    <div className="mb-1.5 flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <span className="capitalize">{feature}</span>
                      <span className="font-mono tabular-nums">{(val * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full transition-[width] duration-700 ease-out"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">尚無特徵重要性資料</p>
          )}
        </div>
      </div>
    </div>
  )
}
