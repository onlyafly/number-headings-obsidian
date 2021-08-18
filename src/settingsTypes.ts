export interface NumberHeadingsPluginSettings {
  skipTopLevel: boolean,
  maxLevel: number,
  styleLevel1: string,
  styleLevelOther: string,
  auto: boolean,
  separator: string
}

export const DEFAULT_SETTINGS: NumberHeadingsPluginSettings = {
  skipTopLevel: false,
  maxLevel: 6,
  styleLevel1: '1',
  styleLevelOther: '1',
  auto: false,
  separator: ''
}

export function isValidLevelStyle (s: string): boolean {
  if (s === 'A' || s === '1') return true
  return false
}

export function isValidFlag (f: unknown): boolean {
  if (f === true || f === false) return true
  return false
}

export function isValidMaxLevel (x: unknown): boolean {
  if (typeof x === 'number' && x >= 1 && x <= 6) return true
  return false
}

export function isValidSeparator (x: unknown): boolean {
  if (typeof x === 'string' && (x === '' || x === ':' || x === '.' || x === '-')) return true
  return false
}
