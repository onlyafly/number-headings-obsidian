import { DEFAULT_SETTINGS, NumberHeadingsPluginSettings } from '../src/settingsTypes'
import { SupportFlags, findRangeInHeaderString, updateSettingsFromFrontMatterFormatPart } from '../src/textProcessing'

const defaultSupportFlags: SupportFlags = { alphabet: true, roman: true }

describe('heading prefix range finding', () => {
  test('basic', () => {
    const range = findRangeInHeaderString('# 4. Foo bar', 42, defaultSupportFlags)
    expect(range).toBeDefined()
    expect(range?.from.line).toBe(42)
    expect(range?.to.line).toBe(42)
    expect(range?.from.ch).toBe(0)
    expect(range?.to.ch).toBe(5)
  })
  test('various numbering forms', () => {
    expect(findRangeInHeaderString('# 4- Foo bar', 42, defaultSupportFlags)?.to.ch).toBe(5)
    expect(findRangeInHeaderString('###### Z.1.1.1.1 Foo', 42, defaultSupportFlags)?.to.ch).toBe(17)
    expect(findRangeInHeaderString('### 1.1- Test b1', 42, defaultSupportFlags)?.to.ch).toBe(9)
    expect(findRangeInHeaderString('### Z.2 Broken 3', 42, defaultSupportFlags)?.to.ch).toBe(8)
    expect(findRangeInHeaderString('##### Z.1.1.2 Broken 5', 42, defaultSupportFlags)?.to.ch).toBe(14)
    expect(findRangeInHeaderString('## 0.2.1 Broken 3a', 42, defaultSupportFlags)?.to.ch).toBe(9)
    expect(findRangeInHeaderString('#### D.A.A. John Helmer', 42, defaultSupportFlags)?.to.ch).toBe(12)
    expect(findRangeInHeaderString('#### 4.1.1: John Helmer', 42, defaultSupportFlags)?.to.ch).toBe(12)
  })
  test('spaces before separator (bug 36)', () => {
    expect(findRangeInHeaderString('# 4 - Foo bar', 42, defaultSupportFlags)?.to.ch).toBe(6)
  })
  test('roman', () => {
    expect(findRangeInHeaderString('# I.V.XXI - Foo bar', 42, defaultSupportFlags)?.to.ch).toBe(12)
    expect(findRangeInHeaderString('# XXI.67.C - Foo bar', 42, defaultSupportFlags)?.to.ch).toBe(13)
  })
  test('do not support roman', () => {
    expect(findRangeInHeaderString('# I am the very model', 42, { roman: false, alphabet: true })?.to.ch).toBe(4)
    expect(findRangeInHeaderString('# I am the very model', 42, { roman: false, alphabet: false })?.to.ch).toBe(2)
    expect(findRangeInHeaderString('# I am the very model', 42, { roman: true, alphabet: true })?.to.ch).toBe(4)
    expect(findRangeInHeaderString('# XV am the very model', 42, { roman: true, alphabet: true })?.to.ch).toBe(5)
    expect(findRangeInHeaderString('# XV am the very model', 42, { roman: false, alphabet: true })?.to.ch).toBe(2)
  })
  test('right parens as separator', () => {
    expect(findRangeInHeaderString('# 4) Foo bar', 42, defaultSupportFlags)?.to.ch).toBe(5)
    expect(findRangeInHeaderString('# 4 ) Foo bar', 42, defaultSupportFlags)?.to.ch).toBe(6)
  })
})

// Generate an clean settings object for testing
function createBasicSettings(): NumberHeadingsPluginSettings {
  const s = { ...DEFAULT_SETTINGS }
  s.skipTopLevel = true
  s.styleLevel1 = 'A'
  s.styleLevelOther = 'A'
  s.separator = 'foo'
  return s
}

describe('updateSettingsFromFrontMatterFormatPart', () => {
  test('basic', () => {
    const s = updateSettingsFromFrontMatterFormatPart('1.1', createBasicSettings())
    expect(s.skipTopLevel).toBe(false)
    expect(s.styleLevel1).toBe('1')
    expect(s.styleLevelOther).toBe('1')
    expect(s.separator).toBe('')
  })
  test('with period as separator', () => {
    const s = updateSettingsFromFrontMatterFormatPart('1.1.', createBasicSettings())
    expect(s.skipTopLevel).toBe(false)
    expect(s.styleLevel1).toBe('1')
    expect(s.styleLevelOther).toBe('1')
    expect(s.separator).toBe('.')
  })
  test('skip top level, with letters', () => {
    const s = updateSettingsFromFrontMatterFormatPart('_.A.A', createBasicSettings())
    expect(s.skipTopLevel).toBe(true)
    expect(s.styleLevel1).toBe('A')
    expect(s.styleLevelOther).toBe('A')
    expect(s.separator).toBe('')
  })
  test('with colon as separator and skip top level', () => {
    const s = updateSettingsFromFrontMatterFormatPart('_.1.1:', createBasicSettings())
    expect(s.skipTopLevel).toBe(true)
    expect(s.styleLevel1).toBe('1')
    expect(s.styleLevelOther).toBe('1')
    expect(s.separator).toBe(':')
  })
  test('with colon as separator, skip top level, and only one numbered descriptor', () => {
    const s = updateSettingsFromFrontMatterFormatPart('_.1:', createBasicSettings())
    expect(s.skipTopLevel).toBe(true)
    expect(s.styleLevel1).toBe('A') // Pass through, since number format is invalid
    expect(s.styleLevelOther).toBe('A') // Pass through, since number format is invalid
    expect(s.separator).toBe(':')
  })
  test('numbers, with space and colon as separator', () => {
    const s = updateSettingsFromFrontMatterFormatPart('1.1 :', createBasicSettings())
    expect(s.skipTopLevel).toBe(false)
    expect(s.separator).toBe(' :')
    expect(s.styleLevel1).toBe('1')
    expect(s.styleLevelOther).toBe('1')
  })
  test('letters, with space and colon as separator', () => {
    const s = updateSettingsFromFrontMatterFormatPart('A.A :', createBasicSettings())
    expect(s.skipTopLevel).toBe(false)
    expect(s.separator).toBe(' :')
    expect(s.styleLevel1).toBe('A')
    expect(s.styleLevelOther).toBe('A')
  })
  test('letters, with space and em-dash as separator', () => {
    const s = updateSettingsFromFrontMatterFormatPart('A.A —', createBasicSettings())
    expect(s.skipTopLevel).toBe(false)
    expect(s.separator).toBe(' —')
    expect(s.styleLevel1).toBe('A')
    expect(s.styleLevelOther).toBe('A')
  })
  test('unmixed roman, with space and em-dash as separator', () => {
    const s = updateSettingsFromFrontMatterFormatPart('I.I —', createBasicSettings())
    expect(s.skipTopLevel).toBe(false)
    expect(s.separator).toBe(' —')
    expect(s.styleLevel1).toBe('I')
    expect(s.styleLevelOther).toBe('I')
  })
  test('mixed roman, with space and em-dash as separator', () => {
    const s = updateSettingsFromFrontMatterFormatPart('A.I —', createBasicSettings())
    expect(s.skipTopLevel).toBe(false)
    expect(s.separator).toBe(' —')
    expect(s.styleLevel1).toBe('A')
    expect(s.styleLevelOther).toBe('I')
  })
  test('with space and right parens as separator', () => {
    const s = updateSettingsFromFrontMatterFormatPart('A.I )', createBasicSettings())
    expect(s.skipTopLevel).toBe(false)
    expect(s.separator).toBe(' )')
    expect(s.styleLevel1).toBe('A')
    expect(s.styleLevelOther).toBe('I')
  })
  test('with right parens as separator', () => {
    const s = updateSettingsFromFrontMatterFormatPart('A.I)', createBasicSettings())
    expect(s.skipTopLevel).toBe(false)
    expect(s.separator).toBe(')')
    expect(s.styleLevel1).toBe('A')
    expect(s.styleLevelOther).toBe('I')
  })
})
