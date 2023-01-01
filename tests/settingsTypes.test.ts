import { isValidNumberingValueString, isValidSeparator } from '../src/settingsTypes'

describe('isValidSeparator', () => {
  test('basic', () => {
    expect(isValidSeparator('')).toBe(true)
    expect(isValidSeparator('.')).toBe(true)
    expect(isValidSeparator(':')).toBe(true)
    expect(isValidSeparator('-')).toBe(true) // en dash
    expect(isValidSeparator('—')).toBe(true) // em dash
    expect(isValidSeparator('&')).toBe(false)
    expect(isValidSeparator('€')).toBe(false)
  })
  test('with spaces', () => {
    expect(isValidSeparator('')).toBe(true)
    expect(isValidSeparator(' .')).toBe(true)
    expect(isValidSeparator(' :')).toBe(true)
    expect(isValidSeparator(' -')).toBe(true) // en dash
    expect(isValidSeparator(' —')).toBe(true) // em dash
  })
})

describe('isValidNumberingValueString', () => {
  test('basic', () => {
    expect(isValidNumberingValueString('A')).toBe(true)
    expect(isValidNumberingValueString('1')).toBe(true)
    expect(isValidNumberingValueString('15T')).toBe(false)
  })
  test('roman', () => {
    expect(isValidNumberingValueString('I')).toBe(true)
    expect(isValidNumberingValueString('XXI')).toBe(true)
    expect(isValidNumberingValueString('MCMXIV')).toBe(true)
    expect(isValidNumberingValueString('QQQ')).toBe(false)
  })
})
