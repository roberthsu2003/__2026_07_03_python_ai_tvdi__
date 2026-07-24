import { useCallback, useEffect, useRef, useState } from 'react'
import { predict, type IrisInput, type PredictResult } from '../api'
import { speciesOf } from '../species'
import Slider from './Slider'
import ProbabilityBars from './ProbabilityBars'

interface FeatureDef {
  key: keyof IrisInput
  label: string
  sublabel: string
  color: string
}

const FEATURES: FeatureDef[] = [
  { key: 'sepal_length', label: '花萼長度', sublabel: 'Sepal Length (cm)', color: '#1a73e8' },
  { key: 'sepal_width', label: '花萼寬度', sublabel: 'Sepal Width (cm)', color: '#ab47bc' },
  { key: 'petal_length', label: '花瓣長度', sublabel: 'Petal Length (cm)', color: '#137333' },
  { key: 'petal_width', label: '花瓣寬度', sublabel: 'Petal Width (cm)', color: '#e37400' },
]

const DEFAULTS: IrisInput = {
  sepal_length: 5.1,
  sepal_width: 3.5,
  petal_length: 1.4,
  petal_width: 0.2,
}

// 常見範例，方便一鍵套用
const PRESETS: { name: string; emoji: string; values: IrisInput }[] = [
  { name: 'Setosa', emoji: '🌿', values: { sepal_length: 5.1, sepal_width: 3.5, petal_length: 1.4, petal_width: 0.2 } },
  { name: 'Versicolor', emoji: '🍁', values: { sepal_length: 6.0, sepal_width: 2.7, petal_length: 4.2, petal_width: 1.3 } },
  { name: 'Virginica', emoji: '🪻', values: { sepal_length: 6.5, sepal_width: 3.0, petal_length: 5.5, petal_width: 2.0 } },
]

export default function PredictTab() {
  const [input, setInput] = useState<IrisInput>(DEFAULTS)
  const [result, setResult] = useState<PredictResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runPredict = useCallback(async (data: IrisInput) => {
    setLoading(true)
    setError(null)
    try {
      const res = await predict(data)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : '預測失敗')
    } finally {
      setLoading(false)
    }
  }, [])

  // 滑桿變動後 400ms 自動預測（防抖），避免拖動時狂打 API
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runPredict(input), 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [input, runPredict])

  const info = result ? speciesOf(result.prediction_label) : null
  const topProb = result ? result.probabilities[result.prediction_label] * 100 : 0

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 左：輸入 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
        <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
          <span>📏</span> 輸入特徵
        </h3>
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          拖動滑桿，結果會即時更新
        </p>

        <div className="flex flex-col gap-5">
          {FEATURES.map((f) => (
            <Slider
              key={f.key}
              label={f.label}
              sublabel={f.sublabel}
              value={input[f.key]}
              min={0.1}
              max={10}
              step={0.1}
              color={f.color}
              unit=" cm"
              onChange={(v) => setInput((prev) => ({ ...prev, [f.key]: v }))}
            />
          ))}
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-700">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            快速套用範例
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setInput(p.values)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                {p.emoji} {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 右：結果 */}
      <div className="flex flex-col gap-6">
        {/* 預測卡片 */}
        <div
          className="animate-fade-in rounded-2xl border p-6 text-center shadow-sm transition-colors"
          style={{
            backgroundColor: info ? info.bg : '#f8fafc',
            borderColor: info ? info.ring : '#e2e8f0',
            color: info ? info.color : '#334155',
          }}
        >
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">
            預測分析品種
          </span>
          {result && info ? (
            <>
              <h2
                className="my-2 flex items-center justify-center gap-2 text-3xl font-extrabold sm:text-4xl"
                style={{ color: info.color }}
              >
                <span>{info.emoji}</span>
                {info.en}
              </h2>
              <p className="text-base font-medium opacity-90">
                {info.zh}．預測機率{' '}
                <strong className="text-2xl font-extrabold">{topProb.toFixed(1)}%</strong>
              </p>
            </>
          ) : (
            <h2 className="my-4 text-2xl font-bold text-slate-400">
              {loading ? '預測中…' : '等待輸入'}
            </h2>
          )}
        </div>

        {/* 機率分佈 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
              <span>📊</span> 機率分佈
            </h3>
            {loading && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-teal-600">
                <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
                更新中
              </span>
            )}
          </div>

          {error ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
              ⚠️ {error}
            </div>
          ) : result ? (
            <ProbabilityBars
              probabilities={result.probabilities}
              topLabel={result.prediction_label}
            />
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">尚無資料</p>
          )}
        </div>
      </div>
    </div>
  )
}
