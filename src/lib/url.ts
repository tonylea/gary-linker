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

export function getFaviconUrls(url: string): string[] {
  try {
    const { hostname, origin } = new URL(url)
    return [
      `${origin}/favicon.ico`,
      `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
      `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
    ]
  } catch {
    return []
  }
}

export function googleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`
}
