import { deromanize, romanize } from 'romans'

export type NumberingToken = NumberingTokenArabic | NumberingTokenAlphabet | NumberingTokenRoman
export type NumberingTokenArabic = {
  style: '1'
  value: number
}
export type NumberingTokenAlphabet = {
  style: 'A'
  value: string
}
export type NumberingTokenRoman = {
  style: 'I'
  value: string
}
export type NumberingStyle = '1' | 'A' | 'I'
export type NumberingValue = number | string

// Validates the string using a regex to ensure is is a valid arabic numbering value
export function isValidArabicNumberingValueString (s: string): boolean {
  const regex = /^[0-9]+$/
  return regex.test(s)
}

// Validates the string using a regex to ensure is is a valid alphabet numbering value
export function isValidAlphabetNumberingValueString (s: string): boolean {
  const regex = /^[A-Z]$/
  return regex.test(s)
}

// Validates the string using a regex to ensure is is a valid roman numbering value
export function isValidRomanNumberingValueString (s: string): boolean {
  const regex = /^[0IVXLCDM]+$/ // This includes zero for zeroth testing
  return regex.test(s)
}

function printableNumberingToken (t: NumberingToken): string {
  switch (t.style) {
    case '1':
      return t.value.toString()
    case 'A':
      return t.value
    case 'I':
      return t.value
  }
}

export function zerothNumberingTokenInStyle (style: NumberingStyle): NumberingToken {
  switch (style) {
    case '1':
      return { style: '1', value: 0 }
    case 'A':
      return { style: 'A', value: 'Z' }
    case 'I':
      return { style: 'I', value: '0' }
  }
}

export function firstNumberingTokenInStyle (style: NumberingStyle): NumberingToken {
  switch (style) {
    case '1':
      return { style: '1', value: 1 }
    case 'A':
      return { style: 'A', value: 'A' }
    case 'I':
      return { style: 'I', value: 'I' }
  }
}

export function nextNumberingToken (t: NumberingToken): NumberingToken {
  switch (t.style) {
    case '1':
      return { style: '1', value: t.value + 1 }
    case 'A':
      if (t.value === 'Z') return { style: 'A', value: 'A' }
      else return { style: 'A', value: String.fromCharCode(t.value.charCodeAt(0) + 1) }
    case 'I':
      if (t.value === '0') return { style: 'I', value: 'I' }
      else return { style: 'I', value: romanize(deromanize(t.value) + 1) }
  }
}

export function previousNumberingToken (t: NumberingToken): NumberingToken {
  switch (t.style) {
    case '1':
      return { style: '1', value: t.value - 1 }
    case 'A':
      if (t.value === 'A') return { style: 'A', value: 'Z' }
      else return { style: 'A', value: String.fromCharCode(t.value.charCodeAt(0) - 1) }
    case 'I':
      if (t.value === 'I') return { style: 'I', value: '0' }
      else return { style: 'I', value: romanize(deromanize(t.value) - 1) }
  }
}

export function makeNumberingString (numberingStack: NumberingToken[]): string {
  let numberingString = ''

  for (let i = 0; i < numberingStack.length; i++) {
    if (i === 0) {
      numberingString += ' '
    } else {
      numberingString += '.'
    }
    numberingString += printableNumberingToken(numberingStack[i])
  }

  return numberingString
}

export function startAtOrZerothInStyle (startAtSettingString: string, style : NumberingStyle): NumberingToken {
  if (startAtSettingString === '') return zerothNumberingTokenInStyle(style)

  let firstNumberingTokenFromSetting: NumberingToken

  switch (style) {
    case '1':
      if (!isValidArabicNumberingValueString(startAtSettingString)) return zerothNumberingTokenInStyle(style)

      firstNumberingTokenFromSetting = { style: '1', value: parseInt(startAtSettingString) }
      break
    case 'A':
      if (!isValidAlphabetNumberingValueString(startAtSettingString)) return zerothNumberingTokenInStyle(style)

      firstNumberingTokenFromSetting = { style: 'A', value: startAtSettingString }
      break
    case 'I':
      if (!isValidRomanNumberingValueString(startAtSettingString)) return zerothNumberingTokenInStyle(style)
      firstNumberingTokenFromSetting = { style: 'I', value: startAtSettingString }
      break
  }

  // Convert the first numbering token to a zeroth numbering token
  return previousNumberingToken(firstNumberingTokenFromSetting)
}
