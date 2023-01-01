import { makeNumberingString, NumberingToken, startAtOrZerothInStyle } from '../src/numberingTokens'

describe('makeNumberingString', () => {
  test('basic', () => {
    const stack: NumberingToken[] = [
      { style: '1', value: 1 },
      { style: '1', value: 1 }
    ]
    const result = makeNumberingString(stack)
    expect(result).toBe(' 1.1')
  })
  test('basic', () => {
    const stack: NumberingToken[] = [
      { style: 'A', value: 'A' },
      { style: 'A', value: 'B' },
      { style: '1', value: 1 }
    ]
    const result = makeNumberingString(stack)
    expect(result).toBe(' A.B.1')
  })
})

describe('startAtOrZerothInStyle', () => {
  test('empty letter', () => {
    const result = startAtOrZerothInStyle('', 'A')
    expect(result).toStrictEqual({ style: 'A', value: 'Z' })
  })
  test('empty number', () => {
    const result = startAtOrZerothInStyle('', '1')
    expect(result).toStrictEqual({ style: '1', value: 0 })
  })
  test('letters', () => {
    const result = startAtOrZerothInStyle('C', 'A')
    expect(result).toStrictEqual({ style: 'A', value: 'B' })
  })
  test('numbers', () => {
    const result = startAtOrZerothInStyle('3', '1')
    expect(result).toStrictEqual({ style: '1', value: 2 })
  })
  test('mismatched', () => {
    const result = startAtOrZerothInStyle('3', 'A')
    expect(result).toStrictEqual({ style: 'A', value: 'Z' })
  })
})
