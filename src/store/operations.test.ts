import { describe, expect, it } from 'vitest'
import { Group } from '../types'
import * as ops from './operations'

const link = (id: string) => ({ id, name: id, url: `https://${id}.com` })

function fixture(): Group[] {
  return [
    { id: 'a', name: 'A', links: [link('a1'), link('a2'), link('a3')] },
    { id: 'b', name: 'B', links: [link('b1'), link('b2')] },
  ]
}

describe('group operations', () => {
  it('appends a new group', () => {
    const result = ops.addGroup(fixture(), { id: 'c', name: 'C', links: [] })
    expect(result.map((g) => g.id)).toEqual(['a', 'b', 'c'])
  })

  it('renames a group without touching others', () => {
    const result = ops.renameGroup(fixture(), 'b', 'Renamed')
    expect(result.find((g) => g.id === 'b')?.name).toBe('Renamed')
    expect(result.find((g) => g.id === 'a')?.name).toBe('A')
  })

  it('deletes a group', () => {
    const result = ops.deleteGroup(fixture(), 'a')
    expect(result.map((g) => g.id)).toEqual(['b'])
  })

  it('sets group width', () => {
    const result = ops.setGroupWidth(fixture(), 'a', 'half')
    expect(result.find((g) => g.id === 'a')?.width).toBe('half')
  })

  it('reorders groups', () => {
    const result = ops.reorderGroups(fixture(), 0, 1)
    expect(result.map((g) => g.id)).toEqual(['b', 'a'])
  })

  it('does not mutate the input array', () => {
    const groups = fixture()
    ops.renameGroup(groups, 'a', 'X')
    expect(groups.find((g) => g.id === 'a')?.name).toBe('A')
  })
})

describe('link operations', () => {
  it('appends a link to the target group only', () => {
    const result = ops.addLink(fixture(), 'b', link('b3'))
    expect(result.find((g) => g.id === 'b')?.links.map((l) => l.id)).toEqual(['b1', 'b2', 'b3'])
    expect(result.find((g) => g.id === 'a')?.links).toHaveLength(3)
  })

  it('updates a link in place', () => {
    const result = ops.updateLink(fixture(), 'a', { ...link('a2'), name: 'Updated' })
    const a2 = result.find((g) => g.id === 'a')?.links.find((l) => l.id === 'a2')
    expect(a2?.name).toBe('Updated')
  })

  it('deletes a link', () => {
    const result = ops.deleteLink(fixture(), 'a', 'a2')
    expect(result.find((g) => g.id === 'a')?.links.map((l) => l.id)).toEqual(['a1', 'a3'])
  })

  it('reorders links within a group', () => {
    const result = ops.reorderLinks(fixture(), 'a', 0, 2)
    expect(result.find((g) => g.id === 'a')?.links.map((l) => l.id)).toEqual(['a2', 'a3', 'a1'])
  })
})

describe('moveLinkToGroup', () => {
  it('moves a link to another group at the given index', () => {
    const result = ops.moveLinkToGroup(fixture(), 'a', 'b', 'a1', 1)
    expect(result.find((g) => g.id === 'a')?.links.map((l) => l.id)).toEqual(['a2', 'a3'])
    expect(result.find((g) => g.id === 'b')?.links.map((l) => l.id)).toEqual(['b1', 'a1', 'b2'])
  })

  it('clamps an out-of-range index to the end', () => {
    const result = ops.moveLinkToGroup(fixture(), 'a', 'b', 'a1', 99)
    expect(result.find((g) => g.id === 'b')?.links.map((l) => l.id)).toEqual(['b1', 'b2', 'a1'])
  })

  it('returns groups unchanged when the link does not exist', () => {
    const groups = fixture()
    expect(ops.moveLinkToGroup(groups, 'a', 'b', 'missing', 0)).toBe(groups)
  })
})
