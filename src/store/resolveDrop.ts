import { Group, Link } from '../types'

export type ActiveData =
  | { type: 'group'; group: Group }
  | { type: 'link'; link: Link }
  | undefined

export type OverData =
  | { type: 'group'; groupId?: string; group?: Group }
  | { type: 'link'; link: Link }
  | undefined

export interface DragNode<T> {
  id: string
  data: T
}

export type DropAction =
  | { kind: 'reorder-groups'; fromIndex: number; toIndex: number }
  | { kind: 'reorder-links'; groupId: string; fromIndex: number; toIndex: number }
  | { kind: 'move-link'; fromGroupId: string; toGroupId: string; linkId: string; toIndex: number }
  | null

const groupOf = (groups: Group[], linkId: string) =>
  groups.find((g) => g.links.some((l) => l.id === linkId))

export function resolveDrop(
  groups: Group[],
  active: DragNode<ActiveData>,
  over: DragNode<OverData> | null
): DropAction {
  if (!over) return null

  if (active.data?.type === 'group') {
    return resolveGroupReorder(groups, active.id, over.id)
  }
  if (active.data?.type === 'link') {
    return resolveLinkDrop(groups, active.id, over)
  }
  return null
}

function resolveGroupReorder(groups: Group[], activeId: string, overId: string): DropAction {
  if (activeId === overId) return null
  const fromIndex = groups.findIndex((g) => g.id === activeId)
  const toIndex = groups.findIndex((g) => g.id === overId)
  if (fromIndex === -1 || toIndex === -1) return null
  return { kind: 'reorder-groups', fromIndex, toIndex }
}

function resolveLinkDrop(
  groups: Group[],
  linkId: string,
  over: DragNode<OverData>
): DropAction {
  const source = groupOf(groups, linkId)
  if (!source) return null

  const overData = over.data
  const destLinkId = overData?.type === 'link' ? over.id : null
  const dest =
    overData?.type === 'link'
      ? groupOf(groups, destLinkId!)
      : overData?.type === 'group'
        ? groups.find((g) => g.id === overData.groupId)
        : undefined
  if (!dest) return null

  if (dest.id === source.id) {
    if (!destLinkId) return null
    const fromIndex = source.links.findIndex((l) => l.id === linkId)
    const toIndex = source.links.findIndex((l) => l.id === destLinkId)
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return null
    return { kind: 'reorder-links', groupId: source.id, fromIndex, toIndex }
  }

  const targetIndex = destLinkId ? dest.links.findIndex((l) => l.id === destLinkId) : -1
  return {
    kind: 'move-link',
    fromGroupId: source.id,
    toGroupId: dest.id,
    linkId,
    toIndex: targetIndex === -1 ? dest.links.length : targetIndex,
  }
}
