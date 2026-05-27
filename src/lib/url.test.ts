import { describe, expect, it } from 'vitest'
import { getDomain, getFaviconUrl, googleSearchUrl, isValidUrl, normalizeUrl } from './url'

describe('normalizeUrl', () => {
  it('prepends https:// when no scheme is present', () => {
    expect(normalizeUrl('github.com')).toBe('https://github.com')
  })

  it('leaves an existing http(s) scheme untouched', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com')
    expect(normalizeUrl('https://example.com')).toBe('https://example.com')
  })

  it('trims surrounding whitespace', () => {
    expect(normalizeUrl('  example.com  ')).toBe('https://example.com')
  })
})

describe('isValidUrl', () => {
  it('accepts bare domains (they get normalized)', () => {
    expect(isValidUrl('example.com')).toBe(true)
  })

  it('rejects strings that cannot form a URL', () => {
    expect(isValidUrl('http://')).toBe(false)
    expect(isValidUrl('   ')).toBe(false)
  })
})

describe('getDomain', () => {
  it('strips the scheme and leading www', () => {
    expect(getDomain('https://www.github.com/foo')).toBe('github.com')
  })

  it('returns the input unchanged when it is not a URL', () => {
    expect(getDomain('not a url')).toBe('not a url')
  })
})

describe('getFaviconUrl', () => {
  it('builds a favicon service URL for the host', () => {
    expect(getFaviconUrl('https://github.com/foo')).toBe(
      'https://www.google.com/s2/favicons?domain=github.com&sz=64'
    )
  })

  it('returns an empty string for an invalid URL', () => {
    expect(getFaviconUrl('nonsense')).toBe('')
  })
})

describe('googleSearchUrl', () => {
  it('encodes the query', () => {
    expect(googleSearchUrl('hello world & co')).toBe(
      'https://www.google.com/search?q=hello%20world%20%26%20co'
    )
  })
})
