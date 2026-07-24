// ==========================================
// 後端 API 客戶端
// 後端服務: FastAPI + Gradio，部署於 Render
// 可透過 VITE_API_BASE 覆寫（例如本地測試後端）
// ==========================================

export const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ||
  'https://2026-07-03-python-ai-tvdi.onrender.com'

// ---- 預測 ----
export interface IrisInput {
  sepal_length: number
  sepal_width: number
  petal_length: number
  petal_width: number
}

export interface PredictResult {
  prediction_id: number
  prediction_label: string
  probabilities: Record<string, number>
}

// ---- 訓練 ----
export interface TrainConfig {
  n_estimators: number
  max_depth: number // 0 代表無限制
  test_size: number
  random_state: number
}

export interface TrainResult {
  status: string
  accuracy: number
  train_time: number
  feature_importances: Record<string, number>
  message: string
}

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error(
      '無法連線到後端服務。若服務閒置（Render 免費方案會休眠），首次喚醒約需 30~60 秒，請稍候再試。',
    )
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const data = await res.json()
      if (data?.detail) detail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)
    } catch {
      /* 忽略解析錯誤 */
    }
    throw new Error(detail)
  }
  return res.json() as Promise<T>
}

export function predict(input: IrisInput): Promise<PredictResult> {
  return postJSON<PredictResult>('/predict', input)
}

export function train(config: TrainConfig): Promise<TrainResult> {
  return postJSON<TrainResult>('/train', config)
}
