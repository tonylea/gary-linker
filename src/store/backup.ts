import { Group } from '../types'

export function serializeGroups(groups: Group[]): string {
  return JSON.stringify(groups, null, 2)
}

export function backupFilename(date: Date): string {
  return `linker-backup-${date.toISOString().slice(0, 10)}.json`
}

export function parseBackup(text: string): Group[] {
  const parsed = JSON.parse(text)
  if (!Array.isArray(parsed)) throw new Error('Backup must be an array of groups')
  return parsed as Group[]
}
