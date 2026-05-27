import { useState, useEffect, useCallback } from 'react'
import { Group, GroupWidth, Link } from '../types'
import * as ops from '../store/operations'

const STORAGE_KEY = 'linker-data'

function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

const SEED_DATA: Group[] = [
  {
    id: 'group-dev',
    name: 'Development',
    links: [
      {
        id: 'link-gh',
        name: 'GitHub',
        url: 'https://github.com',
        description: 'Code hosting and collaboration',
        icon: undefined,
      },
      {
        id: 'link-mdn',
        name: 'MDN Web Docs',
        url: 'https://developer.mozilla.org',
        description: 'Web platform documentation',
        icon: undefined,
      },
      {
        id: 'link-vite',
        name: 'Vite',
        url: 'https://vitejs.dev',
        description: 'Next generation frontend tooling',
        icon: '⚡',
      },
      {
        id: 'link-tw',
        name: 'Tailwind CSS',
        url: 'https://tailwindcss.com',
        description: 'Utility-first CSS framework',
        icon: '🌊',
      },
    ],
  },
  {
    id: 'group-tools',
    name: 'Productivity',
    links: [
      {
        id: 'link-notion',
        name: 'Notion',
        url: 'https://notion.so',
        description: 'All-in-one workspace',
        icon: undefined,
      },
      {
        id: 'link-linear',
        name: 'Linear',
        url: 'https://linear.app',
        description: 'Issue tracking for modern teams',
        icon: undefined,
      },
      {
        id: 'link-figma',
        name: 'Figma',
        url: 'https://figma.com',
        description: 'Collaborative design tool',
        icon: '🎨',
      },
      {
        id: 'link-vercel',
        name: 'Vercel',
        url: 'https://vercel.com',
        description: 'Deploy and host web apps',
        icon: '▲',
      },
    ],
  },
]

function loadFromStorage(): Group[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Group[]
      }
    }
  } catch {
    // ignore parse errors
  }
  return SEED_DATA
}

function saveToStorage(groups: Group[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups))
  } catch {
    // ignore storage errors
  }
}

export function useStore() {
  const [groups, setGroups] = useState<Group[]>(() => loadFromStorage())

  useEffect(() => {
    saveToStorage(groups)
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
