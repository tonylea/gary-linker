import { describe, expect, it } from 'vitest'
import { Group } from '../types'
import { parseStoredGroups } from './storage'

const fallback: Group[] = [{ id: 'seed', name: 'Seed', links: [] }]
const stored: Group[] = [{ id: 'a', name: 'A', links: [] }]

describe('parseStoredGroups', () => {
  it('returns the stored groups when the payload is a non-empty array', () => {
    expect(parseStoredGroups(JSON.stringify(stored), fallback)).toEqual(stored)
  })

  it('falls back when storage is empty (null)', () => {
    expect(parseStoredGroups(null, fallback)).toBe(fallback)
  })

  it('falls back on an empty array', () => {
    expect(parseStoredGroups('[]', fallback)).toBe(fallback)
  })

  it('falls back on malformed JSON', () => {
    expect(parseStoredGroups('{not json', fallback)).toBe(fallback)
  })

  it('falls back when the payload is not an array', () => {
    expect(parseStoredGroups('{"id":"a"}', fallback)).toBe(fallback)
  })
})
