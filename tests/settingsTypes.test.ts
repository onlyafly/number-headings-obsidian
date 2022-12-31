import { isValidSeparator } from '../src/settingsTypes'

describe('isValidSeparator', () => {
  test('basic', () => {
    expect(isValidSeparator('')).toBe(true)
    expect(isValidSeparator('.')).toBe(true)
    expect(isValidSeparator(':')).toBe(true)
    expect(isValidSeparator('-')).toBe(true)
  })
})
