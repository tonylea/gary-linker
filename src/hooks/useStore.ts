import { useState, useEffect, useCallback } from 'react'
import { Group, GroupWidth, Link } from '../types'
import * as ops from '../store/operations'
import { loadGroups, saveGroups } from '../store/storage'
import { SEED_DATA } from '../store/seed'

function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

export function useStore() {
  const [groups, setGroups] = useState<Group[]>(() => loadGroups(SEED_DATA))

  useEffect(() => {
    saveGroups(groups)
  }, [groups])

  const addGroup = useCallback((name: string) => {
    setGroups((prev) => ops.addGroup(prev, { id: generateId(), name, links: [] }))
  }, [])

  const renameGroup = useCallback((groupId: string, name: string) => {
    setGroups((prev) => ops.renameGroup(prev, groupId, name))
  }, [])

  const deleteGroup = useCallback((groupId: string) => {
    setGroups((prev) => ops.deleteGroup(prev, groupId))
  }, [])

  const addLink = useCallback((groupId: string, link: Omit<Link, 'id'>) => {
    setGroups((prev) => ops.addLink(prev, groupId, { ...link, id: generateId() }))
  }, [])

  const updateLink = useCallback((groupId: string, link: Link) => {
    setGroups((prev) => ops.updateLink(prev, groupId, link))
  }, [])

  const deleteLink = useCallback((groupId: string, linkId: string) => {
    setGroups((prev) => ops.deleteLink(prev, groupId, linkId))
  }, [])

  const reorderLinks = useCallback((groupId: string, fromIndex: number, toIndex: number) => {
    setGroups((prev) => ops.reorderLinks(prev, groupId, fromIndex, toIndex))
  }, [])

  const moveLinkToGroup = useCallback(
    (fromGroupId: string, toGroupId: string, linkId: string, toIndex: number) => {
      setGroups((prev) => ops.moveLinkToGroup(prev, fromGroupId, toGroupId, linkId, toIndex))
    },
    []
  )

  const reorderGroups = useCallback((fromIndex: number, toIndex: number) => {
    setGroups((prev) => ops.reorderGroups(prev, fromIndex, toIndex))
  }, [])

  const importGroups = useCallback((newGroups: Group[]) => {
    setGroups(newGroups)
  }, [])

  const setGroupWidth = useCallback((groupId: string, width: GroupWidth) => {
    setGroups((prev) => ops.setGroupWidth(prev, groupId, width))
  }, [])

  return {
    groups,
    addGroup,
    renameGroup,
    deleteGroup,
    addLink,
    updateLink,
    deleteLink,
    reorderLinks,
    moveLinkToGroup,
    reorderGroups,
    setGroupWidth,
    importGroups,
  }
}
