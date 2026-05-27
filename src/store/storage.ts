import { Group } from '../types'

export const STORAGE_KEY = 'linker-data'

export function parseStoredGroups(raw: string | null, fallback: Group[]): Group[] {
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as Group[]
  } catch {
    // unreadable storage falls back to the seed
  }
  return fallback
}

export function loadGroups(fallback: Group[]): Group[] {
  return parseStoredGroups(localStorage.getItem(STORAGE_KEY), fallback)
}

export function saveGroups(groups: Group[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups))
  } catch {
    // storage may be full or unavailable; nothing to recover here
  }
}
