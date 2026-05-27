import { describe, expect, it } from 'vitest'
import { Group, Link } from '../types'
import { resolveDrop } from './resolveDrop'

const link = (id: string): Link => ({ id, name: id, url: `https://${id}.com` })

function fixture(): Group[] {
  return [
    { id: 'a', name: 'A', links: [link('a1'), link('a2'), link('a3')] },
    { id: 'b', name: 'B', links: [link('b1'), link('b2')] },
  ]
}

const groupNode = (group: Group) => ({ id: group.id, data: { type: 'group' as const, group } })
const groupDroppable = (groupId: string) => ({ id: `droppable-${groupId}`, data: { type: 'group' as const, groupId } })
const linkNode = (l: Link) => ({ id: l.id, data: { type: 'link' as const, link: l } })

describe('resolveDrop — guards', () => {
  it('returns null when there is no drop target', () => {
    expect(resolveDrop(fixture(), groupNode(fixture()[0]), null)).toBeNull()
  })

  it('returns null when a group is dropped on itself', () => {
    const groups = fixture()
    expect(resolveDrop(groups, groupNode(groups[0]), groupNode(groups[0]))).toBeNull()
  })
})

describe('resolveDrop — group reordering', () => {
  it('resolves indices when a group is dropped on another group', () => {
    const groups = fixture()
    expect(resolveDrop(groups, groupNode(groups[0]), groupNode(groups[1]))).toEqual({
      kind: 'reorder-groups',
      fromIndex: 0,
      toIndex: 1,
    })
  })
})

describe('resolveDrop — link reordering within a group', () => {
  it('resolves indices when a link is dropped on a sibling link', () => {
    const groups = fixture()
    expect(resolveDrop(groups, linkNode(link('a1')), linkNode(link('a3')))).toEqual({
      kind: 'reorder-links',
      groupId: 'a',
      fromIndex: 0,
      toIndex: 2,
    })
  })

  it('returns null when a link is dropped on itself', () => {
    const groups = fixture()
    expect(resolveDrop(groups, linkNode(link('a1')), linkNode(link('a1')))).toBeNull()
  })

  it('returns null when a link is dropped on its own empty group container', () => {
    const groups = fixture()
    expect(resolveDrop(groups, linkNode(link('a1')), groupDroppable('a'))).toBeNull()
  })
})

describe('resolveDrop — cross-group move', () => {
  it('moves before the target link when dropped on a link in another group', () => {
    const groups = fixture()
    expect(resolveDrop(groups, linkNode(link('a1')), linkNode(link('b2')))).toEqual({
      kind: 'move-link',
      fromGroupId: 'a',
      toGroupId: 'b',
      linkId: 'a1',
      toIndex: 1,
    })
  })

  it('appends when dropped on another group container', () => {
    const groups = fixture()
    expect(resolveDrop(groups, linkNode(link('a1')), groupDroppable('b'))).toEqual({
      kind: 'move-link',
      fromGroupId: 'a',
      toGroupId: 'b',
      linkId: 'a1',
      toIndex: 2,
    })
  })

  it('returns null when the dragged link belongs to no group', () => {
    const groups = fixture()
    expect(resolveDrop(groups, linkNode(link('ghost')), linkNode(link('b1')))).toBeNull()
  })
})
