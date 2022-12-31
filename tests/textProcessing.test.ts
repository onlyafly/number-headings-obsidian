import { DEFAULT_SETTINGS } from '../src/settingsTypes'
import { findRangeInHeaderString, updateSettingsFromFrontMatterFormatPart } from '../src/textProcessing'

describe('heading prefix range finding', () => {
  test('basic', () => {
    const range = findRangeInHeaderString('# 4. Foo bar', 42)
    expect(range).toBeDefined()
    expect(range?.from.line).toBe(42)
    expect(range?.to.line).toBe(42)
    expect(range?.from.ch).toBe(0)
    expect(range?.to.ch).toBe(5)
  })
  test('basic', () => {
    const range = findRangeInHeaderString('# 4- Foo bar', 42)
    expect(range?.to.ch).toBe(5)
  })
  test('basic', () => {
    const range = findRangeInHeaderString('# 4 - Foo bar', 42)
    expect(range?.to.ch).toBe(5)
  })
})

describe('updateSettingsFromFrontMatterFormatPart', () => {
  test('basic', () => {
    const oldSettings = DEFAULT_SETTINGS
    oldSettings.skipTopLevel = true
    oldSettings.styleLevel1 = '0'
    oldSettings.styleLevelOther = '0'
    oldSettings.separator = 'foo'
    const newSettings = updateSettingsFromFrontMatterFormatPart('1.1', DEFAULT_SETTINGS)
    expect(newSettings.skipTopLevel).toBe(false)
    expect(newSettings.styleLevel1).toBe('1')
    expect(newSettings.styleLevelOther).toBe('1')
    expect(newSettings.separator).toBe('')
  })
})
