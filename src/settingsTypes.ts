import { isValidAlphabetNumberingValueString, isValidArabicNumberingValueString, isValidRomanNumberingValueString, NumberingStyle } from './numberingTokens'

export interface NumberHeadingsPluginSettings {
  skipTopLevel: boolean,
  firstLevel: number,
  maxLevel: number,
  styleLevel1: NumberingStyle,
  styleLevelOther: NumberingStyle,
  auto: boolean,
  separator: string,
  contents: string,
  startAt: string,
}

export const DEFAULT_SETTINGS: Readonly<NumberHeadingsPluginSettings> = {
  skipTopLevel: false,
  firstLevel: 1,
  maxLevel: 6,
  styleLevel1: '1',
  styleLevelOther: '1',
  auto: false,
  separator: '',
  contents: '',
  startAt: ''
}

export function isValidNumberingStyleString(s: string): boolean {
  if (s === 'A' || s === '1' || s === 'I') return true
  return false
}

export function isValidNumberingValueString(s: string): boolean {
  if (s === '' || isValidArabicNumberingValueString(s) || isValidAlphabetNumberingValueString(s) || isValidRomanNumberingValueString(s)) return true
  return false
}

export function isValidFlag(f: unknown): boolean {
  if (f === true || f === false) return true
  return false
}

export function isValidFirstOrMaxLevel(x: unknown): boolean {
  if (typeof x === 'number' && x >= 1 && x <= 6) return true
  return false
}

export function isValidSeparator(x: unknown): boolean {
  return typeof x === 'string' &&
    (
      x === '' ||
      x === ':' || x === ' :' ||
      x === '.' || x === ' .' ||
      x === '-' || x === ' -' ||
      x === '—' || x === ' —' || /* em-dash */
      x === ')' || x === ' )'
    )
}

export function isValidContents(x: unknown): boolean {
  if (typeof x === 'string' && (x === '' || x.startsWith('^'))) return true
  return false
}

export function doesContentsHaveValue(x: string): boolean {
  if (x.length > 2 && x.startsWith('^')) return true
  return false
}
