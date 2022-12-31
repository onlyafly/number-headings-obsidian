import { findRangeInHeaderString } from '../src/textProcessing'

describe('heading prefix range finding', () => {
  test('foo', () => {
    const result = findRangeInHeaderString('# 4. Foo bar', 42)
    expect(result).toBeDefined()
    expect(result?.from.line).toBe(42)
    expect(result?.to.line).toBe(42)
    expect(result?.from.ch).toBe(0)
    expect(result?.to.ch).toBe(5)
  })
})
