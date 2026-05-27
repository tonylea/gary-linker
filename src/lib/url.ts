export function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
}

export function isValidUrl(input: string): boolean {
  try {
    new URL(normalizeUrl(input))
    return true
  } catch {
    return false
  }
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch {
    return ''
  }
}

export function googleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`
}
