// 鳶尾花三品種的顯示資訊（顏色、名稱、emoji），與後端 Gradio 介面一致

export interface SpeciesInfo {
  key: string
  emoji: string
  zh: string
  en: string
  color: string // 主色（文字/長條）
  bg: string // 淺色背景
  ring: string // 邊框/光暈
}

export const SPECIES: Record<string, SpeciesInfo> = {
  setosa: {
    key: 'setosa',
    emoji: '🌿',
    zh: '山鳶尾',
    en: 'Setosa',
    color: '#137333',
    bg: '#e6f4ea',
    ring: 'rgba(19, 115, 51, 0.35)',
  },
  versicolor: {
    key: 'versicolor',
    emoji: '🍁',
    zh: '變色鳶尾',
    en: 'Versicolor',
    color: '#b06000',
    bg: '#fef7e0',
    ring: 'rgba(176, 96, 0, 0.35)',
  },
  virginica: {
    key: 'virginica',
    emoji: '🪻',
    zh: '維吉尼亞鳶尾',
    en: 'Virginica',
    color: '#c5221f',
    bg: '#fce8e6',
    ring: 'rgba(197, 34, 31, 0.35)',
  },
}

export function speciesOf(label: string): SpeciesInfo {
  return (
    SPECIES[label.toLowerCase()] ?? {
      key: label,
      emoji: '🌸',
      zh: label,
      en: label,
      color: '#0d9488',
      bg: '#e6fffa',
      ring: 'rgba(13, 148, 136, 0.35)',
    }
  )
}
