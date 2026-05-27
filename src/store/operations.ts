import { arrayMove } from '@dnd-kit/sortable'
import { Group, GroupWidth, Link } from '../types'

function mapGroup(groups: Group[], groupId: string, fn: (group: Group) => Group): Group[] {
  return groups.map((g) => (g.id === groupId ? fn(g) : g))
}

function mapGroupLinks(groups: Group[], groupId: string, fn: (links: Link[]) => Link[]): Group[] {
  return mapGroup(groups, groupId, (g) => ({ ...g, links: fn(g.links) }))
}

export function addGroup(groups: Group[], group: Group): Group[] {
  return [...groups, group]
}

export function renameGroup(groups: Group[], groupId: string, name: string): Group[] {
  return mapGroup(groups, groupId, (g) => ({ ...g, name }))
}

export function deleteGroup(groups: Group[], groupId: string): Group[] {
  return groups.filter((g) => g.id !== groupId)
}

export function setGroupWidth(groups: Group[], groupId: string, width: GroupWidth): Group[] {
  return mapGroup(groups, groupId, (g) => ({ ...g, width }))
}

export function reorderGroups(groups: Group[], fromIndex: number, toIndex: number): Group[] {
  return arrayMove(groups, fromIndex, toIndex)
}

export function addLink(groups: Group[], groupId: string, link: Link): Group[] {
  return mapGroupLinks(groups, groupId, (links) => [...links, link])
}

export function updateLink(groups: Group[], groupId: string, link: Link): Group[] {
  return mapGroupLinks(groups, groupId, (links) =>
    links.map((l) => (l.id === link.id ? link : l))
  )
}

export function deleteLink(groups: Group[], groupId: string, linkId: string): Group[] {
  return mapGroupLinks(groups, groupId, (links) => links.filter((l) => l.id !== linkId))
}

export function reorderLinks(
  groups: Group[],
  groupId: string,
  fromIndex: number,
  toIndex: number
): Group[] {
  return mapGroupLinks(groups, groupId, (links) => arrayMove(links, fromIndex, toIndex))
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
