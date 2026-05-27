import { arrayMove } from '@dnd-kit/sortable'
import { Group, GroupWidth, Link } from '../types'

export function addGroup(groups: Group[], group: Group): Group[] {
  return [...groups, group]
}

export function renameGroup(groups: Group[], groupId: string, name: string): Group[] {
  return groups.map((g) => (g.id === groupId ? { ...g, name } : g))
}

export function deleteGroup(groups: Group[], groupId: string): Group[] {
  return groups.filter((g) => g.id !== groupId)
}

export function setGroupWidth(groups: Group[], groupId: string, width: GroupWidth): Group[] {
  return groups.map((g) => (g.id === groupId ? { ...g, width } : g))
}

export function reorderGroups(groups: Group[], fromIndex: number, toIndex: number): Group[] {
  return arrayMove(groups, fromIndex, toIndex)
}

export function addLink(groups: Group[], groupId: string, link: Link): Group[] {
  return groups.map((g) =>
    g.id === groupId ? { ...g, links: [...g.links, link] } : g
  )
}

export function updateLink(groups: Group[], groupId: string, link: Link): Group[] {
  return groups.map((g) =>
    g.id === groupId
      ? { ...g, links: g.links.map((l) => (l.id === link.id ? link : l)) }
      : g
  )
}

export function deleteLink(groups: Group[], groupId: string, linkId: string): Group[] {
  return groups.map((g) =>
    g.id === groupId
      ? { ...g, links: g.links.filter((l) => l.id !== linkId) }
      : g
  )
}

export function reorderLinks(
  groups: Group[],
  groupId: string,
  fromIndex: number,
  toIndex: number
): Group[] {
  return groups.map((g) =>
    g.id === groupId ? { ...g, links: arrayMove(g.links, fromIndex, toIndex) } : g
  )
}

export function moveLinkToGroup(
  groups: Group[],
  fromGroupId: string,
  toGroupId: string,
  linkId: string,
  toIndex: number
): Group[] {
  const fromGroup = groups.find((g) => g.id === fromGroupId)
  const link = fromGroup?.links.find((l) => l.id === linkId)
  if (!link) return groups

  return groups.map((g) => {
    if (g.id === fromGroupId) {
      return { ...g, links: g.links.filter((l) => l.id !== linkId) }
    }
    if (g.id === toGroupId) {
      const links = [...g.links]
      links.splice(Math.min(toIndex, links.length), 0, link)
      return { ...g, links }
    }
    return g
  })
}
