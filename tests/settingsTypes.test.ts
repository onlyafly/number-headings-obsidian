import { isValidSeparator } from '../src/settingsTypes'

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
