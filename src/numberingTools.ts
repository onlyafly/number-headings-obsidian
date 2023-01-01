export type NumberingToken = string | number
export type NumberingStyle = '1' | 'A'

export function zerothNumberingTokenInStyle (style: NumberingStyle): NumberingToken {
  if (style === '1') {
    return 0
  } else if (style === 'A') {
    return 'Z'
  }

  return 0
}

export function firstNumberingTokenInStyle (style: NumberingStyle): NumberingToken {
  if (style === '1') {
    return 1
  } else if (style === 'A') {
    return 'A'
  }

  return 1
}

export function nextNumberingToken (t: NumberingToken): NumberingToken {
  if (typeof t === 'number') {
    return t + 1
  }

  if (typeof t === 'string') {
    if (t === 'Z') return 'A'
    else return String.fromCharCode(t.charCodeAt(0) + 1)
  }

  return 1
}
