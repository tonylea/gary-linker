import { describe, expect, it } from 'vitest'
import { Group } from '../types'
import { backupFilename, parseBackup, serializeGroups } from './backup'

const groups: Group[] = [{ id: 'a', name: 'A', links: [] }]

describe('serializeGroups', () => {
  it('produces pretty-printed JSON that round-trips through parseBackup', () => {
    const text = serializeGroups(groups)
    expect(text).toContain('\n')
    expect(parseBackup(text)).toEqual(groups)
  })
})

describe('backupFilename', () => {
  it('embeds the date as YYYY-MM-DD', () => {
    expect(backupFilename(new Date('2026-05-27T12:34:56Z'))).toBe('linker-backup-2026-05-27.json')
  })
})

describe('parseBackup', () => {
  it('parses a valid array of groups', () => {
    expect(parseBackup('[{"id":"a","name":"A","links":[]}]')).toEqual(groups)
  })

  it('throws on malformed JSON', () => {
    expect(() => parseBackup('{not json')).toThrow()
  })

  it('throws when the payload is not an array', () => {
    expect(() => parseBackup('{"id":"a"}')).toThrow('Backup must be an array of groups')
  })
})
